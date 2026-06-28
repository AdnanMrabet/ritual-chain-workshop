Cipher Bloom — Test Plan
========================

    cd hardhat && npx hardhat test solidity     →  32 passing

Tests live in `hardhat/contracts/CipherBloomJudge.t.sol`. The contract uses
custom errors, so every negative case asserts with
`vm.expectRevert(CipherBloomJudge.<Error>.selector)`. Time is moved with
`vm.warp`, balances funded with `vm.deal`.

The plan below is grouped by the question each test answers, not by function.


────────────────────────────────────────────────────────────
 "Does the seal actually hide the seed?"
────────────────────────────────────────────────────────────

  test_AnswerHiddenBeforeReveal     after commit, getSubmission returns
                                    revealed=false and an empty answer string —
                                    the contents are not on-chain
  test_ComputeCommitmentMatches     the on-chain computeCommitment equals an
                                    off-chain keccak256(abi.encode(...)) — client
                                    and contract seal identically


────────────────────────────────────────────────────────────
 "Can a seed only be opened by the right person, with the
  right answer, at the right time?"   (the reveal core)
────────────────────────────────────────────────────────────

  VALID
  test_RevealValid                  in-window reveal with correct answer+salt →
                                    status Opened, answer stored, eligible

  WRONG CONTENTS
  test_RevertReveal_WrongAnswer     wrong answer            → ShellMismatch
  test_RevertReveal_WrongSalt       wrong salt             → ShellMismatch
  test_StolenCommitmentCannotBeRevealed
                                    a thief reveals another's shell under their
                                    own address → ShellMismatch (sender is bound)
  test_RevertReveal_EmptyAnswer     empty answer           → BadAnswerLength

  WRONG TIME
  test_RevertReveal_BeforeWindow    reveal during planting → SproutNotOpen
  test_RevertReveal_AfterWindow     reveal after customs    → SproutClosed

  WRONG STATE
  test_RevertReveal_NoSeed          reveal with no seed planted → NoSeed
  test_RevertReveal_Twice           reveal an already-open seed → AlreadyRevealed


────────────────────────────────────────────────────────────
 "Can someone plant badly or out of turn?"   (the commit core)
────────────────────────────────────────────────────────────

  test_SubmitCommitment             a normal commit records a sealed seed
  test_RevertCommit_Twice           second commit by same address → AlreadyPlanted
  test_RevertCommit_AfterDeadline   commit past the loading cutoff → PlantingClosed
  test_RevertCommit_Empty           zero commitment → EmptyShell
  test_RevertCommit_UnknownBounty   commit to a missing bounty → UnknownBounty


────────────────────────────────────────────────────────────
 "Is the money path safe — created, judged, and paid in order?"
────────────────────────────────────────────────────────────

  CREATE
  test_CreateBounty                 funded, winner = NO_WINNER, phase = Commit
  test_RevertCreate_NoReward        no reward attached → RewardRequired
  test_RevertCreate_BadWindow       reveal ≤ submission → BadWindow
  test_RevertCreate_DeadlineInPast  submission in the past → BadWindow

  JUDGE
  test_JudgeAll_NonRitualChain      empty llmInput off Ritual → judged, phase=Judged
  test_RevertJudge_NotOwner         non-owner calls judge → NotOwner
  test_RevertJudge_BeforeRevealDeadline   judge too early → SproutNotFinished
  test_RevertJudge_NoRevealed       judge with zero blooms → NoBlooms
  test_RevertJudge_Twice            judge again → AlreadyJudged

  FINALIZE
  test_Finalize_PaysWinner          reward transferred, phase = Finalized
  test_RevertFinalize_BeforeJudge   finalize before judging → NotJudged
  test_RevertFinalize_UnrevealedWinner   pick an unopened seed → WinnerNotRevealed

  ESCAPE HATCH
  test_ReclaimReward_WhenNoReveals  no blooms after customs → owner refunded
  test_RevertReclaim_WhenSomeoneRevealed   a bloom exists → CannotReclaim
  test_RevertReclaim_BeforeRevealClose     too early → CannotReclaim

  END-TO-END
  test_FullLifecycle                create → commit → reveal → judge → finalize


────────────────────────────────────────────────────────────
 Live integration on Ritual L1  (manual)
────────────────────────────────────────────────────────────

The deployed contract is 0x23eDD86A3312b2ea951A1A27D8F975370aA3466b.

  1. Create a bounty with MILLISECOND deadlines (Ritual block.timestamp is ms).
  2. Commit from two addresses; confirm getSubmission shows an empty answer.
  3. After the loading cutoff, reveal: a wrong salt reverts, a correct one opens
     the seed into a bloom.
  4. After the reveal cutoff, fund the RitualWallet escrow (~0.4 RITUAL), then
     call judgeAll WITH gas: 6_000_000 and read aiVerdict from getBounty.
  5. finalizeWinner and confirm the reward lands with the chosen revealed author.
  6. Edge run: let a bounty's reveal window lapse with zero blooms, then call
     reclaimReward and confirm the owner is refunded.

The commitment parity check (frontend keccak256 == on-chain computeCommitment)
was run against this live deployment and matched byte-for-byte.
