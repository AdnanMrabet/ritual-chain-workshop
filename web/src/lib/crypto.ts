import { keccak256, encodeAbiParameters, parseAbiParameters, type Hex } from "viem";

/* ============================================================================
   Commit-reveal cryptography helpers.
   The commitment binds: answer + salt + sender + bountyId.
   This matches the on-chain check a Ritual bounty contract would perform on
   reveal, so the same hashing runs here and (later) in Solidity.
   ========================================================================== */

/** Generate a cryptographically-random 32-byte salt as 0x-hex. */
export function generateSalt(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return ("0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")) as Hex;
}

/**
 * Compute the commitment hash.
 * keccak256(abi.encode(answer, salt, sender, bountyId))
 */
export function computeCommitment(
  answer: string,
  salt: Hex,
  sender: `0x${string}`,
  bountyId: bigint
): Hex {
  const encoded = encodeAbiParameters(
    parseAbiParameters("string, bytes32, address, uint256"),
    [answer, salt, sender, bountyId]
  );
  return keccak256(encoded);
}

/** Verify a reveal against an original commitment. */
export function verifyReveal(
  answer: string,
  salt: Hex,
  sender: `0x${string}`,
  bountyId: bigint,
  original: Hex
): boolean {
  return (
    computeCommitment(answer, salt, sender, bountyId).toLowerCase() ===
    original.toLowerCase()
  );
}
