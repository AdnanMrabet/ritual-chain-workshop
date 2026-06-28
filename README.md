<div align="center">

# 🌱 Cipher Bloom

### A privacy-preserving AI bounty garden on Ritual L1

*Plant an idea as a sealed seed. Let it bloom only when the time is right.*
*Let the Ritual AI read the whole garden at once — and let a human pick the harvest.*

[![Ritual L1](https://img.shields.io/badge/Ritual-L1-B7FF5A?style=flat-square)](https://ritualfoundation.org)
[![Contract](https://img.shields.io/badge/contract-CipherBloomJudge-57F2D1?style=flat-square)](https://explorer.ritualfoundation.org/address/0x23eDD86A3312b2ea951A1A27D8F975370aA3466b)
[![Tests](https://img.shields.io/badge/solidity%20tests-32%20passing-43D9A3?style=flat-square)](hardhat/contracts/CipherBloomJudge.t.sol)
[![Frontend](https://img.shields.io/badge/web-React%20%2B%20Vite%20%2B%20viem-F6C85F?style=flat-square)](web)

**▶ Live garden — [adnanmrabet.github.io/ritual-chain-workshop](https://adnanmrabet.github.io/ritual-chain-workshop/)**
*(connect a wallet on Ritual Chain, id 1979)*

</div>

---

## The one-line idea

> A sealed answer is a **seed**. While the garden is open you publish only the
> seed's shell — never the answer. When planting closes, you **reveal** and the
> seed opens into a **bloom**. The Ritual AI judges every bloom *together, in one
> batch*, recommends a winner, and a **human owner harvests** it and releases the
> reward.

```
   private idea → sealed seed → verified bloom → batch AI review → human harvest → reward
```

There is no chatbot, no answer-by-answer scoring, and no moment where the machine
gets the last word. **The AI recommends. The human decides.**

---

## How this answers the assignment

The workshop brief named a concrete flaw: the original judge made answers public
the instant they were submitted, so a latecomer could read the best idea and
re-submit a tweaked copy. Here is how Cipher Bloom fixes it and where each
required deliverable lives.

| Asked for | How it's solved in Cipher Bloom |
|-----------|----------------------------------|
| Hide answers until judging | During planting only the **shell** `keccak256(abi.encode(answer, salt, sender, bountyId))` is on-chain; `getSubmission` returns an empty answer until a verified reveal. |
| Commit-reveal flow in Solidity | `submitCommitment` → `revealAnswer` → `judgeAll` → `finalizeWinner` in [`CipherBloomJudge.sol`](hardhat/contracts/CipherBloomJudge.sol), the four required signatures, plus `createBounty` and the `reclaimReward` escape hatch. |
| Verify the commitment binds answer+salt+sender+bountyId | `revealAnswer` recomputes the shell and reverts `ShellMismatch` unless it matches; `sender` blocks reveal-theft, `bountyId` blocks replay. |
| Only valid reveals are eligible | unopened seeds can't be judged or finalized; `finalizeWinner` reverts `WinnerNotRevealed` on an unopened pick. |
| Batch AI judging (not one call per answer) | `judgeAll` sends every bloom in **one** request to the Ritual LLM precompile `0x0802` (GLM-4.7-FP8); the verdict is stored as `aiVerdict`. |
| AI recommends, human decides | `judgeAll` only writes bytes; `finalizeWinner` is owner-only and moves the reward. |
| Works on any EVM chain | off Ritual, pass empty `llmInput`; the lifecycle still completes (the 32 tests run this way). |

**Deliverables:** this README (lifecycle) · test plan in
[`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) · architecture note in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · reflection in
[`docs/REFLECTION.md`](docs/REFLECTION.md).

---

## Why a garden, and why it has to be sealed

Picture an open bounty where answers are public the second they land. The first
honest idea becomes everyone else's starting point — a latecomer reads *"use a
commit-reveal scheme"*, adds one sentence, and walks away with the prize. The
garden would be trampled before it ever grew.

Cipher Bloom fixes that by **sealing every seed until the season turns**. During
the planting window the chain only ever sees an irreversible shell:

```solidity
shell = keccak256(abi.encode(answer, salt, msg.sender, bountyId))
```

| Ingredient    | Role in the seal |
|---------------|------------------|
| `answer`      | your real idea — it stays on your device, never on-chain |
| `salt`        | a random secret you keep; the key that later opens the seed |
| `msg.sender`  | binds the seed to **you** — nobody can replant it under their name |
| `bountyId`    | binds it to **this** garden — no replaying it elsewhere |

Because a keccak hash is one-way, an observer sees only noise. At reveal you hand
back `answer + salt`; the contract recomputes the shell and only lets the seed
bloom if it matches the one you planted. Change a single character and the bloom
withers.

> **Design choice:** the seal uses `abi.encode`, not `abi.encodePacked`. The
> dynamic `string answer` is length-prefixed and 32-byte aligned, so there is no
> boundary ambiguity between adjacent dynamic fields. The frontend hashes with the
> **exact same encoding** — verified live against the on-chain `computeCommitment`.

---

## The seasons of a bounty

`CipherBloomJudge` models the lifecycle as an explicit `Phase` enum, surfaced by
`phaseOf(bountyId)` so the UI never has to guess:

```
 Commit ───▶ Reveal ───▶ Judging ───▶ Judged ───▶ Finalized
 plant a      open the     reveal       AI verdict   winner
 sealed       sprout;      window       recorded     harvested,
 seed         hash must    closed;      (advisory)   reward
              match        owner runs                released
                           batch judge
```

| Season | Garden act | On-chain call |
|--------|-----------|---------------|
| 🌑 **Commit** | plant a sealed seed | `submitCommitment(bountyId, shell)` |
| 🌿 **Reveal** | open the sprout into a bloom | `revealAnswer(bountyId, answer, salt)` |
| ✨ **Judging** | the oracle reads every bloom at once | `judgeAll(bountyId, llmInput)` |
| 🔮 **Judged** | the AI's recommendation is in | *(verdict stored as `aiVerdict`)* |
| 🏅 **Finalized** | the human harvests the winner | `finalizeWinner(bountyId, winnerIndex)` |

An escape hatch keeps the garden honest: if the reveal window passes with **zero
blooms**, `reclaimReward(bountyId)` lets the owner recover the locked reward
instead of it being stranded forever.

---

## What the contract guarantees

| Guarantee | Why it matters |
|-----------|----------------|
| Seeds accepted only **before** planting closes | the window must shut before anyone reveals |
| One seed per address per bounty | no spam, no second shots |
| Reveals only inside `[plantClose, sproutClose)` | reveals come *after* planting is locked |
| A bloom opens **only if its shell matches** | proof you never swapped your answer |
| Unrevealed seeds are **ineligible** | you can't win a bloom you never opened |
| `judgeAll` only **after** the reveal window | the AI sees the full, final garden |
| `finalizeWinner` is **owner-only, post-judging** | a human owns the payout |
| Reward zeroed on payout; single winner | winner-takes-all, no double spend |
| `reclaimReward` when nobody bloomed | funds never lock forever |

The whole surface is built on **custom errors** (not string requires) for cheaper,
typed failures — `ShellMismatch`, `SproutNotOpen`, `NoBlooms`, `AlreadyJudged`, …

> **Resilience detail:** `judgeAll` deliberately **does not revert** on an
> LLM-side error. On Ritual the call is replayed asynchronously after the TEE runs
> the model; reverting there would roll back the entire replay — including
> `judged = true` — and wedge the bounty permanently. Instead the verdict is
> stored only when the model returns cleanly, and the human can still finalize.

---

## How the Ritual AI reads the garden

When the reveal window closes, the owner triggers a **single batched inference**.
The frontend gathers every revealed bloom, builds one prompt, and encodes a
request for the Ritual LLM precompile (`0x0802`, model **GLM-4.7-FP8**). The
contract forwards it; the block builder runs the model inside a TEE executor and
replays the transaction with the signed verdict, which lands on-chain as
`aiVerdict`.

```
revealed blooms ─┐
                 ├─▶ one prompt ─▶ judgeAll(id, llmInput) ─▶ 0x0802 (TEE) ─▶ aiVerdict
   rubric ───────┘                  (gas pinned to 6,000,000)
```

The prompt is hardened against prompt-injection: submissions are treated as
untrusted content, the model judges strictly by the rubric, and it must return
plain JSON (`{ winnerIndex, summary }`). The recommendation is exactly that —
a recommendation. The owner reads it and harvests whoever they choose.

---

## Field notes for Ritual L1

Three things that are easy to get wrong on Ritual, and how Cipher Bloom handles
them:

- ⏱️ **Time is in milliseconds.** Ritual's `block.timestamp` is ms, not seconds.
  Every deadline — contract storage, frontend countdowns, phase transitions — is
  computed in ms end-to-end.
- ⛽ **`judgeAll` pins `gas: 6_000_000`.** The async replay that decodes the LLM
  response and writes it to storage costs ~1.09M gas; an auto-estimated tx only
  budgets for the cheap first pass and dies mid-settlement. The gas is pinned.
- 💧 **The oracle needs fuel.** The LLM precompile charges a prepaid escrow held
  in the `RitualWallet` (`0x532F0dF0…`), locked long enough to outlive the async
  callback. Worst-case escrow ≈ 0.31 RITUAL; the UI deposits ~0.4 with margin.

---

## On-chain

| | |
|---|---|
| **Network** | Ritual Chain · id `1979` |
| **Contract** | [`0x23eDD86A3312b2ea951A1A27D8F975370aA3466b`](https://explorer.ritualfoundation.org/address/0x23eDD86A3312b2ea951A1A27D8F975370aA3466b) |
| **Deploy tx** | [`0xbdc538c1…1eb54d7e`](https://explorer.ritualfoundation.org/tx/0xbdc538c1206080051e446e5185ddcb7aab469dad40d3f7ee868cab441eb54d7e) |
| **Commitment** | `keccak256(abi.encode(answer, salt, sender, bountyId))` |

---

## The frontend — a bioluminescent greenhouse

Cipher Bloom's UI is not a dashboard. It's a guided greenhouse with five fixed
zones — a floating command bar, a phase rail, a central bloom stage, a role-aware
action drawer, and a growing event timeline — that walks you through all ten
stages: **connect → create → status → commit → reveal → fund AI → judge → verdict
→ finalize → submissions.**

- Stages **unlock by phase and clock** — locked seasons stay dim and the app
  **auto-advances** as deadlines elapse.
- A countdown bar is **always visible**, so you always know how long until reveal
  closes and judging opens.
- Each stage is its own animated scene: a seed sealing shut, hash-roots aligning,
  the oracle flower opening, golden nectar flowing to the winner.

Built with **React + Vite + TypeScript + Tailwind v4 + Radix + Motion + viem** —
no wagmi, no mocks; the UI talks straight to the deployed contract through a single
viem-backed service.

---

## Run it locally

**Contract**
```bash
cd hardhat
npm install
npx hardhat test solidity        # 32 passing
# deploy (needs DEPLOYER_PRIVATE_KEY):
npx hardhat ignition deploy ignition/modules/CipherBloomJudge.ts --network ritual
```

**Frontend**
```bash
cd web
npm install
cp .env.example .env             # defaults already point at the live deployment
npm run dev                      # http://localhost:5173
```

---

## Repository layout

```
cipher-bloom/
├─ hardhat/                         Solidity workspace
│  ├─ contracts/
│  │  ├─ CipherBloomJudge.sol       the commit-reveal AI bounty garden
│  │  ├─ CipherBloomJudge.t.sol     32 tests — seal, bloom, judge, harvest, reclaim
│  │  └─ utils/PrecompileConsumer.sol
│  └─ ignition/modules/CipherBloomJudge.ts
└─ web/                             Cipher Bloom frontend (React + Vite + viem)
   └─ src/
      ├─ components/  layout · stages · visual · modals · ui
      ├─ services/    web3BountyService (live Ritual contract)
      ├─ store/       useBloomStore (Zustand) — phases + auto-transitions
      └─ lib/         crypto · ritualLlm · ritualWallet · stages
```

<div align="center">

*Forked from the Ritual workshop starter and grown into something of its own.*
**AI recommends. Human harvests.**

</div>
