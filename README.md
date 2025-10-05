# Base-Bounties-V1
Freelance app onchain
# Base Bounties MVP

A lean, no-admin bounty board for Base that combines an onchain escrow contract, a Next.js dashboard, and a Farcaster
Frame for discovery. The repository contains everything required to deploy the escrow primitive, run the web
experience, and publish a shareable bounty card.

## Repository layout

- `contracts/` – Hardhat project containing the escrow contract, utilities, and integration tests.
- `web/` – Next.js app that lets creators post and fund tasks while guiding hunters through submitting claims.

## Onchain escrow (TaskBoardEscrow.sol)

The `TaskBoardEscrow` contract holds ETH for each task and only releases funds after the creator authorizes a claim.

Key behaviours:

- `createTask(uint40 deadline)` – Creator escrows ETH for a task. The contract stores the creator, amount, deadline,
  optional work hash, and status. Deadlines must be in the future and deposits larger than `type(uint96).max` wei are
  rejected to preserve tight storage packing.
- `claim(uint256 taskId, address hunter, bytes32 workHash, bytes signature)` – Verifies an EIP-712 typed message signed
  by the creator and sends the escrowed ETH to the hunter. Empty work hashes and zero-address hunters are rejected.
- `refund(uint256 taskId)` – Lets the creator recover escrow if the task expires without an accepted claim.
- Local `EIP712` and `ECDSA` helpers keep the bytecode minimal and avoid external dependencies.

## Web dashboard (web/)

The Next.js app serves both creators and bounty hunters:

- Wallet onboarding via RainbowKit and Wagmi, configured for Base.
- Task creation UI that requires a configured contract address and deadline, then calls `createTask` with the supplied
  escrow value.
- Claim helper that derives the typed data, previews it for review, and produces the signature hunters submit onchain.
- IPFS CID → `bytes32` work-hash helper so creators can easily reference offchain deliverables when approving claims.
- Tailwind styling with no backend dependencies; all interactions are client-side.

## Farcaster Frame

The `/api/frame` route returns a frame payload that showcases a bounty and deep links users back into the dashboard.
Users can optionally provide a task ID to jump hunters directly into the claim workflow.

## Getting started

### Prerequisites

- Node.js 18+
- npm
- A deployed instance of `TaskBoardEscrow`
- A WalletConnect Project ID for RainbowKit

### Deploy the escrow contract

Deploy `contracts/src/TaskBoardEscrow.sol` using your preferred toolchain (the repository now ships with a configured Hardhat setup under `contracts/`). Record the deployed
address for use in the web app.

To run the included test suite that validates the escrow flows:

```bash
cd contracts
npm install
npm test
```

### Configure and run the web app

```bash
cd web
npm install
npm run dev
```

Create a `.env.local` file inside `web/` with the following entries:

```env
NEXT_PUBLIC_SITE_URL= # Used when generating Frame payloads
NEXT_PUBLIC_WALLETCONNECT_ID= # WalletConnect Project ID required by RainbowKit
NEXT_PUBLIC_CONTRACT_ADDRESS= # Address of the deployed TaskBoardEscrow contract
```

Start the development server (`npm run dev`) to interact with the dashboard locally.

## Claim flow recap

1. Creator funds escrow with `createTask` and shares task details (e.g. IPFS metadata) through the dashboard or Frame.
2. Hunter completes the work and submits a deliverable hash (IPFS CID → `bytes32`).
3. Creator signs the typed `Claim` payload generated in the dashboard; hunters can verify the fields before submission.
4. Hunter calls `claim` on the contract with the signature and work hash to release escrowed funds.
5. If no claim is accepted before the deadline, the creator can call `refund` to recover escrow.

## Notes

- Task metadata storage is left to creators (IPFS, hosted JSON, etc.). Only the work hash is recorded onchain.
- For optimistic, signature-free flows, the contract can be extended with a challenge window and dispute bond in a
  follow-up iteration.