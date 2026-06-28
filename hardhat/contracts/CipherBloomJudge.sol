// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PrecompileConsumer} from "./utils/PrecompileConsumer.sol";

interface IRitualWallet {
    function deposit(uint256 lockDuration) external payable;
    function depositFor(address user, uint256 lockDuration) external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address) external view returns (uint256);
    function lockUntil(address) external view returns (uint256);
}

/**
 * @title CipherBloomJudge
 * @notice A privacy-preserving, AI-judged bounty garden on Ritual L1.
 *
 *         Cipher Bloom treats every answer as a seed. While the planting
 *         (commit) window is open a participant publishes only a sealed shell —
 *         `keccak256(abi.encode(answer, salt, sender, bountyId))` — never the
 *         answer itself. After planting closes the sprouting (reveal) window
 *         opens: participants reveal (answer, salt) and the contract verifies
 *         the shell, opening the seed into a bloom. Once sprouting ends the
 *         owner feeds every revealed bloom to Ritual's LLM in ONE batch call
 *         (`judgeAll`); the model recommends, and a human owner harvests the
 *         winner and releases the reward.
 *
 *         The garden flow: planted seed -> verified bloom -> batch AI review
 *         -> human harvest -> reward paid.
 *
 *         Notes:
 *         - Phase is an explicit enum (`phaseOf`).
 *         - Shells use `abi.encode` (not encodePacked) to avoid dynamic-string
 *           boundary ambiguity; the client must hash identically.
 *         - Custom errors instead of string requires.
 *         - `reclaimReward` frees a reward if nobody ever reveals.
 *         - judging never reverts on an LLM-side error (a revert would roll back
 *           the whole async replay and wedge the bounty); the completion is
 *           stored only when clean, and the human still harvests.
 */
contract CipherBloomJudge is PrecompileConsumer {
    // ----------------------------------------------------------- constants
    uint256 public constant MAX_SEEDS = 12;
    uint256 public constant MAX_ANSWER_BYTES = 2_000;
    uint256 public constant NO_WINNER = type(uint256).max;

    IRitualWallet public constant RITUAL_WALLET =
        IRitualWallet(0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948);

    // ----------------------------------------------------------- types
    enum Phase {
        Commit, // planting: accepting sealed seeds
        Reveal, // sprouting: accepting reveals
        Judging, // sprouting closed, awaiting judgeAll
        Judged, // AI verdict recorded, awaiting harvest
        Finalized // winner harvested, reward paid (or reclaimed)
    }

    struct Seed {
        address author;
        bytes32 shell; // commitment hash
        bool revealed; // opened into a bloom
        string answer; // empty until revealed
    }

    struct Bounty {
        address owner;
        string title;
        string rubric;
        uint256 reward;
        uint64 plantClose; // seeds accepted strictly before this (ms)
        uint64 sproutClose; // reveals accepted in [plantClose, sproutClose) (ms)
        bool judged;
        bool finalized;
        bool reclaimed;
        uint256 winner; // NO_WINNER until finalized
        uint256 bloomCount; // number of revealed seeds
        bytes aiVerdict; // raw LLM completion (advisory only)
        Seed[] seeds;
    }

    // The conversation-history tuple the LLM precompile appends to its response.
    struct ConvoHistory {
        string storageType;
        string path;
        string secretsName;
    }

    // ----------------------------------------------------------- storage
    uint256 public nextBountyId = 1;
    mapping(uint256 => Bounty) private _bounties;
    // bountyId => author => 1-based seed index (0 = none)
    mapping(uint256 => mapping(address => uint256)) private _seedSlot;

    // ----------------------------------------------------------- events
    event BountyPlanted(
        uint256 indexed bountyId,
        address indexed owner,
        string title,
        uint256 reward,
        uint64 plantClose,
        uint64 sproutClose
    );
    event SeedSealed(uint256 indexed bountyId, uint256 indexed seedIndex, address indexed author, bytes32 shell);
    event SeedBloomed(uint256 indexed bountyId, uint256 indexed seedIndex, address indexed author);
    event GardenJudged(uint256 indexed bountyId, uint256 bloomCount, bytes aiVerdict);
    event WinnerHarvested(uint256 indexed bountyId, uint256 indexed winner, address indexed author, uint256 reward);
    event RewardReclaimed(uint256 indexed bountyId, address indexed owner, uint256 reward);

    // ----------------------------------------------------------- errors
    error NotOwner();
    error UnknownBounty();
    error RewardRequired();
    error BadWindow();
    error PlantingClosed();
    error EmptyShell();
    error AlreadyPlanted();
    error TooManySeeds();
    error SproutNotOpen();
    error SproutClosed();
    error BadAnswerLength();
    error NoSeed();
    error AlreadyRevealed();
    error ShellMismatch();
    error SproutNotFinished();
    error AlreadyJudged();
    error AlreadyFinalized();
    error NoBlooms();
    error NotJudged();
    error BadIndex();
    error WinnerNotRevealed();
    error PayoutFailed();
    error CannotReclaim();

    // ----------------------------------------------------------- modifiers
    modifier onlyOwner(uint256 bountyId) {
        if (msg.sender != _bounties[bountyId].owner) revert NotOwner();
        _;
    }

    modifier exists(uint256 bountyId) {
        if (_bounties[bountyId].owner == address(0)) revert UnknownBounty();
        _;
    }

    // ----------------------------------------------------------- create
    function createBounty(
        string calldata title,
        string calldata rubric,
        uint256 submissionDeadline,
        uint256 revealDeadline
    ) external payable returns (uint256 bountyId) {
        if (msg.value == 0) revert RewardRequired();
        if (submissionDeadline <= block.timestamp) revert BadWindow();
        if (revealDeadline <= submissionDeadline) revert BadWindow();

        bountyId = nextBountyId++;
        Bounty storage b = _bounties[bountyId];
        b.owner = msg.sender;
        b.title = title;
        b.rubric = rubric;
        b.reward = msg.value;
        b.plantClose = uint64(submissionDeadline);
        b.sproutClose = uint64(revealDeadline);
        b.winner = NO_WINNER;

        emit BountyPlanted(bountyId, msg.sender, title, msg.value, b.plantClose, b.sproutClose);
    }

    // --------------------------------------------------- required: commit
    function submitCommitment(uint256 bountyId, bytes32 commitment) external exists(bountyId) {
        Bounty storage b = _bounties[bountyId];
        if (block.timestamp >= b.plantClose) revert PlantingClosed();
        if (commitment == bytes32(0)) revert EmptyShell();
        if (_seedSlot[bountyId][msg.sender] != 0) revert AlreadyPlanted();
        if (b.seeds.length >= MAX_SEEDS) revert TooManySeeds();

        b.seeds.push(Seed({author: msg.sender, shell: commitment, revealed: false, answer: ""}));
        uint256 index = b.seeds.length - 1;
        _seedSlot[bountyId][msg.sender] = index + 1; // 1-based

        emit SeedSealed(bountyId, index, msg.sender, commitment);
    }

    // --------------------------------------------------- required: reveal
    function revealAnswer(uint256 bountyId, string calldata answer, bytes32 salt) external exists(bountyId) {
        Bounty storage b = _bounties[bountyId];
        if (block.timestamp < b.plantClose) revert SproutNotOpen();
        if (block.timestamp >= b.sproutClose) revert SproutClosed();

        uint256 len = bytes(answer).length;
        if (len == 0 || len > MAX_ANSWER_BYTES) revert BadAnswerLength();

        uint256 slot = _seedSlot[bountyId][msg.sender];
        if (slot == 0) revert NoSeed();

        Seed storage s = b.seeds[slot - 1];
        if (s.revealed) revert AlreadyRevealed();

        // NOTE: abi.encode (not encodePacked) — the client must match exactly.
        if (keccak256(abi.encode(answer, salt, msg.sender, bountyId)) != s.shell) revert ShellMismatch();

        s.answer = answer;
        s.revealed = true;
        b.bloomCount += 1;

        emit SeedBloomed(bountyId, slot - 1, msg.sender);
    }

    // --------------------------------------------------- required: judge
    /// @param llmInput ABI-encoded Ritual LLM request carrying ALL revealed
    ///        answers in ONE batch (built off-chain). Empty on non-Ritual chains.
    function judgeAll(uint256 bountyId, bytes calldata llmInput) external exists(bountyId) onlyOwner(bountyId) {
        Bounty storage b = _bounties[bountyId];
        if (block.timestamp < b.sproutClose) revert SproutNotFinished();
        if (b.judged) revert AlreadyJudged();
        if (b.finalized) revert AlreadyFinalized();
        if (b.bloomCount == 0) revert NoBlooms();

        if (llmInput.length > 0) {
            bytes memory output = _executePrecompile(LLM_INFERENCE_PRECOMPILE, llmInput);
            if (output.length > 0) {
                // Decode the Ritual LLM envelope. We deliberately do NOT revert
                // on hasError: reverting here would roll back the entire async
                // replay (including judged=true) and wedge the bounty forever.
                (bool hasError, bytes memory completion,,,) =
                    abi.decode(output, (bool, bytes, bytes, string, ConvoHistory));
                if (!hasError) {
                    b.aiVerdict = completion;
                }
            }
        }

        b.judged = true;
        emit GardenJudged(bountyId, b.bloomCount, b.aiVerdict);
    }

    // --------------------------------------------------- required: finalize
    function finalizeWinner(uint256 bountyId, uint256 winnerIndex) external exists(bountyId) onlyOwner(bountyId) {
        Bounty storage b = _bounties[bountyId];
        if (!b.judged) revert NotJudged();
        if (b.finalized) revert AlreadyFinalized();
        if (winnerIndex >= b.seeds.length) revert BadIndex();

        Seed storage win = b.seeds[winnerIndex];
        if (!win.revealed) revert WinnerNotRevealed();

        b.finalized = true;
        b.winner = winnerIndex;

        uint256 reward = b.reward;
        b.reward = 0;
        (bool ok, ) = payable(win.author).call{value: reward}("");
        if (!ok) revert PayoutFailed();

        emit WinnerHarvested(bountyId, winnerIndex, win.author, reward);
    }

    // --------------------------------------------------- escape hatch
    /// @notice If sprouting passed with zero blooms, the owner can recover the
    ///         locked reward instead of it being stuck forever.
    function reclaimReward(uint256 bountyId) external exists(bountyId) onlyOwner(bountyId) {
        Bounty storage b = _bounties[bountyId];
        if (b.finalized || b.reclaimed) revert AlreadyFinalized();
        if (block.timestamp < b.sproutClose) revert CannotReclaim();
        if (b.bloomCount != 0) revert CannotReclaim();

        b.reclaimed = true;
        b.finalized = true;
        uint256 reward = b.reward;
        b.reward = 0;
        (bool ok, ) = payable(b.owner).call{value: reward}("");
        if (!ok) revert PayoutFailed();

        emit RewardReclaimed(bountyId, b.owner, reward);
    }

    // ----------------------------------------------------------- views
    function phaseOf(uint256 bountyId) public view exists(bountyId) returns (Phase) {
        Bounty storage b = _bounties[bountyId];
        if (b.finalized) return Phase.Finalized;
        if (b.judged) return Phase.Judged;
        if (block.timestamp < b.plantClose) return Phase.Commit;
        if (block.timestamp < b.sproutClose) return Phase.Reveal;
        return Phase.Judging;
    }

    function getBounty(uint256 bountyId)
        external
        view
        exists(bountyId)
        returns (
            address owner,
            string memory title,
            string memory rubric,
            uint256 reward,
            uint256 submissionDeadline,
            uint256 revealDeadline,
            bool judged,
            bool finalized,
            uint256 submissionCount,
            uint256 revealedCount,
            uint256 winnerIndex,
            bytes memory aiVerdict
        )
    {
        Bounty storage b = _bounties[bountyId];
        return (
            b.owner,
            b.title,
            b.rubric,
            b.reward,
            b.plantClose,
            b.sproutClose,
            b.judged,
            b.finalized,
            b.seeds.length,
            b.bloomCount,
            b.winner,
            b.aiVerdict
        );
    }

    function getSubmission(uint256 bountyId, uint256 index)
        external
        view
        exists(bountyId)
        returns (address author, bytes32 commitment, bool revealed, string memory answer)
    {
        Bounty storage b = _bounties[bountyId];
        if (index >= b.seeds.length) revert BadIndex();
        Seed storage s = b.seeds[index];
        return (s.author, s.shell, s.revealed, s.answer);
    }

    function entrySlot(uint256 bountyId, address author) external view returns (uint256) {
        return _seedSlot[bountyId][author];
    }

    function entryCount(uint256 bountyId) external view exists(bountyId) returns (uint256) {
        return _bounties[bountyId].seeds.length;
    }

    /// @notice Build a commitment exactly like the contract does (abi.encode).
    function computeCommitment(
        string calldata answer,
        bytes32 salt,
        address author,
        uint256 bountyId
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(answer, salt, author, bountyId));
    }
}
