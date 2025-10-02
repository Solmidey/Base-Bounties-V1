# Base-Bounties-V1
Freelance app onchain
# Base Bounties MVP

Lean, no-admin bounty board for Base with an onchain escrow contract, a Next.js dashboard, and a Farcaster Frame for
discovery.

## Architecture

### Onchain (TaskBoardEscrow.sol)
- `createTask(deadline)` escrows ETH per task. The contract tracks creator, amount, deadline, status and optional work hash.
  Deadlines must be in the future and ETH values larger than 2^96-1 wei are rejected to preserve storage packing.
- `claim(taskId, hunter, workHash, signature)` verifies an EIP-712 typed message signed by the creator and transfers the
  escrowed ETH to the hunter.
- `refund(taskId)` lets creators recover funds if the task expired without a claim.
- ERC-712 domain helper utilities live in `contracts/utils` (no external deps).

### Offchain (Next.js app in `/web`)
- Dashboard explains the flow, lets creators fund a task, and provides a claim/explorer tool for hunters.
- Wallet connectivity via RainbowKit + Wagmi.
- Typed data helper for generating claim signatures + submitting claims.
- Built-in IPFS CID → `bytes32` hash helper so creators can easily generate claim-ready work hashes.
- Styling with Tailwind; no backend dependencies.
- Store task descriptions however you want (e.g. JSON pinned to IPFS). Convert IPFS CID to a bytes32 hash when calling
  `claim` so the onchain record references the delivered work.

### Farcaster Frame
- `/api/frame` returns a frame payload with a CTA to open the task board.
- Optional text input lets users deep link to `/tasks/:id` pages that nudge hunters directly into the claim flow.

## Getting started

```bash
cd web
npm install
npm run dev
```

Set the following environment variables for the web app:

- `NEXT_PUBLIC_SITE_URL` before deploying (used in the Frame payloads).
- `NEXT_PUBLIC_WALLETCONNECT_ID` with your WalletConnect Project ID (RainbowKit requirement).
- `NEXT_PUBLIC_CONTRACT_ADDRESS` with your deployed `TaskBoardEscrow` address (UI is read-only until this is set).

Deploy `contracts/TaskBoardEscrow.sol` (example: Foundry or Hardhat) and update `NEXT_PUBLIC_CONTRACT_ADDRESS` accordingly.

```ts
// Example helper to derive a bytes32 work hash from an IPFS CID using viem
import { keccak256, stringToBytes } from "viem";

const workHash = keccak256(stringToBytes("ipfs://bafy..."));
```

## Claim flow recap
1. Creator funds escrow (`createTask`) and posts the task metadata (IPFS hash or description) in the Frame.
2. Hunter ships work and shares an IPFS hash or link.
3. Creator signs a `Claim` typed data payload; the UI generates the signature and shows a typed-data preview for auditing.
4. Hunter submits `claim` with the signature and work hash. Funds release trustlessly.
5. If no claim occurs by deadline, creator can `refund` to recover escrow
