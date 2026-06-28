# Cipher Bloom — Privacy-Preserving AI Bounty Judge for Ritual L1

A fork of the Ritual workshop starter, rebuilt into **Cipher Bloom**: a private
cryptographic garden where answers are planted as sealed seeds, revealed as
verified blooms, judged by the Ritual AI in **one batch**, and harvested by a
human owner who releases the reward.

> private idea → sealed seed → verified bloom → batch AI review → human harvest → reward paid
>
> **AI recommends. Human decides.**

## Live demo

https://adnanmrabet.github.io/ritual-chain-workshop/

## Structure

```
/hardhat   Solidity — CipherBloomJudge (commit-reveal, AI batch judging)
/web       Frontend — Cipher Bloom (React + Vite + TS + Tailwind + viem)
```

## On-chain

- **Contract:** `CipherBloomJudge` — commit-reveal bounties judged in one batch
  by Ritual's LLM precompile, finalized by a human owner.
- **Deployed (Ritual):** `0x23eDD86A3312b2ea951A1A27D8F975370aA3466b`
- **Commitment:** `keccak256(abi.encode(answer, salt, sender, bountyId))`

### Ritual specifics honored
- `block.timestamp` is in **milliseconds** — all deadlines are ms.
- `judgeAll` pins **`gas: 6_000_000`** (async LLM replay ~1.09M gas; auto-estimate is too low).
- AI judge escrow ≈ 0.31 RITUAL per batch; the UI deposits ≈ 0.4 into the RitualWallet.

## Contract — develop

```bash
cd hardhat
npm install
npx hardhat test solidity          # 32 passing
# deploy (needs DEPLOYER_PRIVATE_KEY env var):
npx hardhat ignition deploy ignition/modules/CipherBloomJudge.ts --network ritual
```

## Frontend — develop

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build
```

The 10 guided stages: connect → create → status → commit → reveal → fund AI →
judge → verdict → finalize → submissions.
