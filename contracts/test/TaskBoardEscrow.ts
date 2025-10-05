import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const CLAIM_TYPES = {
  Claim: [
    { name: "taskId", type: "uint256" },
    { name: "hunter", type: "address" },
    { name: "workHash", type: "bytes32" },
  ],
};

async function deployEscrowFixture() {
  const [creator, hunter, other] = await ethers.getSigners();
  const Escrow = await ethers.getContractFactory("TaskBoardEscrow");
  const contract = await Escrow.deploy();
  await contract.waitForDeployment();

  return { contract, creator, hunter, other };
}

async function signClaim(
  creator: HardhatEthersSigner,
  contractAddress: string,
  chainId: bigint,
  taskId: bigint,
  hunter: string,
  workHash: string,
) {
  const domain = {
    name: "TaskBoardEscrow",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: contractAddress,
  } as const;
  const message = {
    taskId,
    hunter,
    workHash,
  } as const;

  const signature = await creator.signTypedData(domain, CLAIM_TYPES, message);
  return { domain, message, signature };
}

describe("TaskBoardEscrow", () => {
  describe("createTask", () => {
    it("stores the task metadata and emits an event", async () => {
      const { contract, creator } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 7 * 24 * 60 * 60;
      const value = ethers.parseEther("1");

      await expect(contract.connect(creator).createTask(deadline, { value }))
        .to.emit(contract, "TaskCreated")
        .withArgs(1n, creator.address, value, BigInt(deadline));

      const task = await contract.getTask(1n);
      expect(task.creator).to.equal(creator.address);
      expect(task.amount).to.equal(value);
      expect(task.deadline).to.equal(BigInt(deadline));
      expect(task.claimed).to.equal(false);
      expect(task.refunded).to.equal(false);
      expect(task.workHash).to.equal(ethers.ZeroHash);

      expect(await contract.nextTaskId()).to.equal(2n);
    });

    it("reverts when creating an empty bounty", async () => {
      const { contract } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 1;

      await expect(contract.createTask(deadline)).to.be.revertedWithCustomError(
        contract,
        "InvalidAmount",
      );
    });
  });

  describe("claim", () => {
    it("releases funds when provided with a valid signature", async () => {
      const { contract, creator, hunter } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 7 * 24 * 60 * 60;
      const value = ethers.parseEther("0.5");
      const taskId = 1n;

      await contract.connect(creator).createTask(deadline, { value });

      const workHash = ethers.id("ipfs://work");
      const { chainId } = await ethers.provider.getNetwork();
      const { domain, message, signature } = await signClaim(
        creator,
        await contract.getAddress(),
        chainId,
        taskId,
        hunter.address,
        workHash,
      );

      const recovered = ethers.verifyTypedData(domain, CLAIM_TYPES, message, signature);
      expect(recovered).to.equal(creator.address);

      const tx = contract.connect(hunter).claim(taskId, hunter.address, workHash, signature);
      await expect(tx).to.changeEtherBalances([contract, hunter], [-value, value]);
      await expect(tx).to.emit(contract, "TaskClaimed").withArgs(taskId, hunter.address, workHash);

      const task = await contract.getTask(taskId);
      expect(task.claimed).to.equal(true);
      expect(task.workHash).to.equal(workHash);

      await expect(
        contract.connect(hunter).claim(taskId, hunter.address, workHash, signature),
      ).to.be.revertedWithCustomError(contract, "AlreadyClaimed");
    });

    it("rejects claims signed by anyone other than the creator", async () => {
      const { contract, creator, hunter, other } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 7 * 24 * 60 * 60;
      const value = ethers.parseEther("0.25");
      const taskId = 1n;

      await contract.connect(creator).createTask(deadline, { value });

      const workHash = ethers.id("ipfs://bad");
      const { chainId } = await ethers.provider.getNetwork();
      const { signature } = await signClaim(
        other,
        await contract.getAddress(),
        chainId,
        taskId,
        hunter.address,
        workHash,
      );

      await expect(
        contract.claim(taskId, hunter.address, workHash, signature),
      ).to.be.revertedWithCustomError(contract, "InvalidSignature");
    });
  });

  describe("refund", () => {
    it("allows the creator to reclaim funds after the deadline", async () => {
      const { contract, creator } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 3 * 24 * 60 * 60;
      const value = ethers.parseEther("0.75");
      const taskId = 1n;

      await contract.connect(creator).createTask(deadline, { value });
      await time.increaseTo(BigInt(deadline + 1));

      const tx = contract.connect(creator).refund(taskId);
      await expect(tx).to.changeEtherBalances([contract, creator], [-value, value]);
      await expect(tx).to.emit(contract, "TaskRefunded").withArgs(taskId);

      await expect(contract.connect(creator).refund(taskId)).to.be.revertedWithCustomError(
        contract,
        "AlreadyRefunded",
      );
    });

    it("blocks refunds before the deadline", async () => {
      const { contract, creator } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 10;
      const value = ethers.parseEther("0.1");
      const taskId = 1n;

      await contract.connect(creator).createTask(deadline, { value });

      await expect(contract.connect(creator).refund(taskId)).to.be.revertedWithCustomError(
        contract,
        "DeadlineNotReached",
      );
    });

    it("prevents non-creators from triggering refunds", async () => {
      const { contract, creator, other } = await loadFixture(deployEscrowFixture);
      const deadline = (await time.latest()) + 10;
      const value = ethers.parseEther("0.2");
      const taskId = 1n;

      await contract.connect(creator).createTask(deadline, { value });
      await time.increaseTo(BigInt(deadline + 1));

      await expect(contract.connect(other).refund(taskId)).to.be.revertedWithCustomError(
        contract,
        "NotCreator",
      );
    });
  });
});
