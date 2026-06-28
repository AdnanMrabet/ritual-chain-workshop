# Cipher Bloom

**Privacy-Preserving AI Bounty Judge for Ritual L1.**

A premium Web3 dApp frontend built as a *private cryptographic garden*. Answers
are planted as **sealed seeds** (only a commitment hash is published), revealed
as **verified blooms** after the deadline, judged by the Ritual AI in **one
batch**, and **harvested** by a human owner who releases the reward nectar.

> The full journey: private idea → sealed seed → verified bloom → batch AI
> review → human harvest → reward paid.
>
> **AI recommends. Human decides.**

## Tech stack

- **React + Vite + TypeScript** — app foundation
- **Tailwind CSS v4** — the entire bioluminescent-greenhouse design system
- **Radix UI** — accessible Dialog / Drawer primitives, heavily restyled
- **Motion (Framer Motion)** — page/stage transitions, micro-interactions
- **GSAP** — available for the heavier cinematic sequences
- **Zustand** — app state (stage, role, bounty, submissions, verdict, demo)
- **viem** — commit-reveal hashing today; Web3-ready service layer for later
- **lucide-react** — icons

## The 10 stages

| # | Stage | Scene | What happens |
|---|-------|-------|--------------|
| 0 | Connect | Wake the Garden | Connect wallet to Ritual |
| 1 | Create | Plant the Bounty | Owner sets rubric, deadlines, locks reward |
| 2 | Status | Growth State | Phase + two draining time drops |
| 3 | Commit | Seal the Seed | Submit only the commitment hash |
| 4 | Reveal | Open the Sprout | Reveal answer + salt; hash roots compared |
| 5 | Fund AI | Feed the Oracle | Owner deposits inference nectar |
| 6 | Judge | Bloom Review | Ritual AI judges all blooms in one batch |
| 7 | Verdict | Oracle's Recommendation | Ranked blooms; AI pick glows |
| 8 | Finalize | Harvest the Winner | Human confirms/overrides, pays reward |
| 9 | Submissions | Submission Garden | Every seed, sprout and bloom |

## Layout skeleton

```
┌──────────────── Floating Garden Header ────────────────┐
│ Stage Card Ribbon (0…9)                                 │
│ ┌───────────────── Main Bloom Stage ──┬ Right Action ─┐ │
│ │  the active scene                    │  Greenhouse   │ │
│ └──────────────────────────────────────┴───────────────┘ │
│ Bottom Growth Timeline (growing branch of leaf events)  │
└──────────────────────────────────────────────────────────┘
        + Submissions Garden Drawer (slides from right)
```

## Background

The host page background is **never replaced**. The app paints glass, blur,
depth and a faint bioluminescent veil *on top* via `.cb-atmosphere`, which is
`pointer-events: none` and keeps text readable.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Web3 architecture

The UI talks to a single service interface (`BountyService`). The on-chain
implementation lives in `src/services/web3BountyService.ts`, with `TODO`s where
each viem/wagmi call against the deployed contract goes.

Ritual specifics baked into the scaffold:
- `block.timestamp` is in **milliseconds** — all deadlines stay in ms.
- `judgeAll` must **pin `gas: 6_000_000n`** (async LLM replay ~1.09M gas).
- AI judge escrow ≈ 0.31 RITUAL per batch; deposit ≈ 0.4.
- Commitment = `keccak256(abi.encode(answer, salt, sender, bountyId))`.

## Project structure

```
src/
  components/
    layout/    Header, Ribbon, MainStage, RightGreenhouse, Timeline, Drawer
    stages/    one scene per stage (0–9)
    visual/    garden glyphs, time drop, hash tag, submission card
    modals/    SafetyConfirmModal, HelpModal
    ui/        Button, Field, Badge, Toaster (restyled Radix)
  hooks/
  store/       useBloomStore (Zustand)
  services/    web3BountyService (Ritual contract) + shared interface
  lib/         crypto, utils, stages, revealKit
  types/
  styles/      globals.css (design system)
```
