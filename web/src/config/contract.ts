import type { Address } from "viem";
import cipherBloomAbi from "@/abi/CipherBloomJudge";

/**
 * On-chain config the UI needs. Read from Vite `VITE_*` env vars so the same
 * build can target different Ritual deployments without code changes. Sensible
 * defaults point at the live CipherBloomJudge deployment.
 */

export const bloomAbi = cipherBloomAbi;

const rawAddress = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined)?.trim();

/** Deployed CipherBloomJudge address. Defaults to the live Ritual deployment. */
export const contractAddress: Address =
  rawAddress && /^0x[0-9a-fA-F]{40}$/.test(rawAddress)
    ? (rawAddress as Address)
    : "0x23eDD86A3312b2ea951A1A27D8F975370aA3466b";

export const isContractConfigured = true;

/** Ritual LLM executor / callback address used when encoding judgeAll input. */
export const executorAddress: Address =
  ((import.meta.env.VITE_RITUAL_EXECUTOR_ADDRESS as string | undefined)?.trim() as
    | Address
    | undefined) ?? "0xB42e435c4252A5a2E7440e37B609F00c61a0c91B";

export const ritualChainId = Number(
  (import.meta.env.VITE_RITUAL_CHAIN_ID as string | undefined) ?? "1979"
);

export const ritualRpcUrl =
  (import.meta.env.VITE_RITUAL_RPC_URL as string | undefined) ??
  "https://rpc.ritualfoundation.org";

export const walletConnectProjectId = (
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined
)?.trim();
