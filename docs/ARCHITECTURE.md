Cipher Bloom — Architecture
===========================

A short field guide to how the garden is built: where secrets live, what the
chain can and cannot see, and how the Ritual AI reads the whole bed at once.


The two layers of secrecy
-------------------------

There are two different ways to keep an answer private, and Cipher Bloom
implements the first while leaving the door open to the second.

* **Temporal secrecy (shipped).** An answer is hidden *while planting is open*
  and becomes public the moment it is revealed. This is the commit-reveal
  garden. It is enough to kill the copy-the-winner race, because by reveal time
  the planting window is already shut — a copier has nothing left to plant.

* **Total secrecy (sketched).** An answer stays hidden *even through judging*,
  decrypted only inside a TEE. This is the Ritual-native greenhouse described at
  the end. Cipher Bloom's contract is shaped so this can be layered on later
  without changing the lifecycle the UI already speaks.


What the chain holds, and what it never sees
--------------------------------------------

During the planting phase the only thing the chain ever receives is a sealed
shell:

    shell = keccak256(abi.encode(answer, salt, sender, bountyId))

That is a one-way function, so the shell leaks nothing about the seed inside it.

   PLANTING (commit)              SPROUTING (reveal)            after reveal
   ─────────────────              ──────────────────            ────────────
   answer  → stays on your        answer + salt sent;           answer is public
             device               contract re-derives the       on-chain
   salt    → stays on your        shell and compares
             device (reveal kit)
   shell   → on-chain             a match opens the seed
             (Seed.shell)         into a bloom (Seed.answer set)

Put plainly: the contract stores the shell at commit time and the plaintext only
after a verified reveal. Read any `getSubmission` during planting and the answer
field is empty — that emptiness *is* the privacy guarantee.

Four ingredients are folded into the shell, each for a reason:

* `answer` — what is being committed to.
* `salt` — high entropy, so a short or guessable answer can't be brute-forced
  back out of the hash.
* `sender` — binds the seed to its planter; nobody can reveal someone else's
  shell under their own address (the re-derived hash wouldn't match).
* `bountyId` — scopes the seed to one bounty; a shell can't be replayed elsewhere.

The frontend hashes with the identical `abi.encode` layout, and that parity was
checked live against the contract's own `computeCommitment` view — same bytes on
both sides.


Lifecycle as explicit state
---------------------------

The contract does not infer where a bounty is from scattered booleans; it
exposes a `Phase` enum directly through `phaseOf(bountyId)`:

    Commit ──▶ Reveal ──▶ Judging ──▶ Judged ──▶ Finalized

`Commit` and `Reveal` are gated by the two millisecond deadlines; `Judging`
opens once the reveal window closes; `Judged` and `Finalized` are set by the
owner's two actions. The UI reads this enum so the stage rail and the
auto-advance logic never drift from on-chain truth.


The batch oracle
----------------

When the reveal window closes the owner runs **one** inference over the whole
garden. The frontend gathers every bloom (revealed answer), builds a single
prompt, and encodes a request for the Ritual LLM precompile at `0x0802`
(model `zai-org/GLM-4.7-FP8`). The contract forwards it; the block builder runs
the model inside a TEE executor and replays the transaction with the signed
verdict, which lands on-chain as `aiVerdict`.

It is one call for all blooms — never one inference per answer. Two operational
facts make this work on Ritual:

* `judgeAll` is sent with **`gas: 6_000_000`**. The async replay that decodes
  the model response and writes it to storage costs around 1.09M gas; an
  auto-estimated transaction only budgets for the cheap first pass and dies
  mid-replay.
* `judgeAll` **does not revert on an LLM-side error.** A revert inside the async
  replay would roll back `judged = true` and strand the bounty forever, so the
  verdict is stored only on a clean response and the human can always finalize.


The AI advises; the human decides
----------------------------------

`judgeAll` only writes bytes — it never moves money. Releasing the reward is a
separate, owner-only `finalizeWinner` that must point at a revealed bloom. So a
hallucinated score or a prompt-injected response can never drain the reward; a
person ratifies the outcome and is accountable for it.


If the garden never blooms
--------------------------

If the reveal window passes with zero blooms, the reward would otherwise be
locked forever. `reclaimReward` is the escape hatch: after the reveal deadline,
with `revealedCount == 0`, the owner can pull the locked reward back out.


Beyond commit-reveal: the sealed greenhouse (advanced)
------------------------------------------------------

To keep answers secret *through* judging, the answer would be ECIES-encrypted to
a live Ritual TEE executor's public key instead of hashed. The chain would store
only a ciphertext reference plus a digest; `judgeAll` would hand the encrypted
blooms to the precompile as `encryptedSecrets[]`; the TEE would decrypt
privately, judge the batch, and return a ranking — plaintext never touching the
public chain. After judging, a bundle reference and `keccak256(bundle)` would be
published so the result stays auditable without having leaked anything early.
Plaintext would then exist only on the planter's device, inside the attested
TEE, and (optionally) in a post-judging bundle.

Commit-reveal trades that confidentiality-through-judging for something simpler:
it runs on any EVM chain, costs one hash per planter, and is trivially audited by
re-hashing each reveal. Cipher Bloom ships the simple, robust version and keeps
the greenhouse as a clean upgrade path.
