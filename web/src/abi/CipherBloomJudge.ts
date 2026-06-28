// ABI for CipherBloomJudge (commit-reveal, AI batch-judged bounty garden on Ritual).
// Generated from the compiled artifact; do not edit by hand.
const abi = [
    {
        "inputs":  [

                   ],
        "name":  "AlreadyFinalized",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyJudged",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyPlanted",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyRevealed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadAnswerLength",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadIndex",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadWindow",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "CannotReclaim",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "EmptyShell",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NoBlooms",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NoSeed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotJudged",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotOwner",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "PayoutFailed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "PlantingClosed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "RewardRequired",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ShellMismatch",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "SproutClosed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "SproutNotFinished",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "SproutNotOpen",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "TooManySeeds",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "UnknownBounty",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "WinnerNotRevealed",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "title",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "plantClose",
                           "type":  "uint64"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "sproutClose",
                           "type":  "uint64"
                       }
                   ],
        "name":  "BountyPlanted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "bloomCount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes",
                           "name":  "aiVerdict",
                           "type":  "bytes"
                       }
                   ],
        "name":  "GardenJudged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RewardReclaimed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "seedIndex",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "author",
                           "type":  "address"
                       }
                   ],
        "name":  "SeedBloomed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "seedIndex",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "author",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "shell",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "SeedSealed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "winner",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "author",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       }
                   ],
        "name":  "WinnerHarvested",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "MAX_ANSWER_BYTES",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "MAX_SEEDS",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "NO_WINNER",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "RITUAL_WALLET",
        "outputs":  [
                        {
                            "internalType":  "contract IRitualWallet",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "answer",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "salt",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "author",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "computeCommitment",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "pure",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "title",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "rubric",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "submissionDeadline",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "revealDeadline",
                           "type":  "uint256"
                       }
                   ],
        "name":  "createBounty",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "bountyId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "entryCount",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "author",
                           "type":  "address"
                       }
                   ],
        "name":  "entrySlot",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "winnerIndex",
                           "type":  "uint256"
                       }
                   ],
        "name":  "finalizeWinner",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getBounty",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "owner",
                            "type":  "address"
                        },
                        {
                            "internalType":  "string",
                            "name":  "title",
                            "type":  "string"
                        },
                        {
                            "internalType":  "string",
                            "name":  "rubric",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "reward",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "submissionDeadline",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "revealDeadline",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "judged",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "finalized",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "submissionCount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "revealedCount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "winnerIndex",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bytes",
                            "name":  "aiVerdict",
                            "type":  "bytes"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getSubmission",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "author",
                            "type":  "address"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "commitment",
                            "type":  "bytes32"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "revealed",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "string",
                            "name":  "answer",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes",
                           "name":  "llmInput",
                           "type":  "bytes"
                       }
                   ],
        "name":  "judgeAll",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "nextBountyId",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "phaseOf",
        "outputs":  [
                        {
                            "internalType":  "enum CipherBloomJudge.Phase",
                            "name":  "",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "reclaimReward",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "answer",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "salt",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "revealAnswer",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bountyId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "commitment",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "submitCommitment",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;

export default abi;

