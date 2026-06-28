/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_RITUAL_EXECUTOR_ADDRESS?: string;
  readonly VITE_RITUAL_CHAIN_ID?: string;
  readonly VITE_RITUAL_RPC_URL?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
