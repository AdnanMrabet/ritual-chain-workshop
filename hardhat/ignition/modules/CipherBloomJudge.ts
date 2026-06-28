import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CipherBloomJudgeModule", (m) => {
  const judge = m.contract("CipherBloomJudge");
  return { judge };
});
