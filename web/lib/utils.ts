export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const envAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "").trim();

export const CONTRACT_ADDRESS = (envAddress.length > 0
  ? (envAddress as `0x${string}`)
  : ZERO_ADDRESS) as `0x${string}`;

export const CONTRACT_CONFIGURED = CONTRACT_ADDRESS !== ZERO_ADDRESS;

export const TASK_ESCROW_ABI = [
  {
    "type": "function",
    "name": "createTask",
    "stateMutability": "payable",
    "inputs": [{ "name": "deadline", "type": "uint64" }],
    "outputs": [{ "name": "taskId", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "claim",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "taskId", "type": "uint256" },
      { "name": "hunter", "type": "address" },
      { "name": "workHash", "type": "bytes32" },
      { "name": "signature", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "refund",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "taskId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "nextTaskId",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getTask",
    "stateMutability": "view",
    "inputs": [{ "name": "taskId", "type": "uint256" }],
    "outputs": [
      {
        "components": [
          { "name": "creator", "type": "address" },
          { "name": "amount", "type": "uint96" },
          { "name": "deadline", "type": "uint64" },
          { "name": "claimed", "type": "bool" },
          { "name": "refunded", "type": "bool" },
          { "name": "workHash", "type": "bytes32" }
        ],
        "name": "",
        "type": "tuple"
      }
    ]
  }
] as const;

export const CLAIM_TYPED_DATA = {
  types: {
    Claim: [
      { name: "taskId", type: "uint256" },
      { name: "hunter", type: "address" },
      { name: "workHash", type: "bytes32" }
    ]
  },
  primaryType: "Claim"
} as const;
