// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EIP712} from "./utils/EIP712.sol";
import {ECDSA} from "./utils/ECDSA.sol";

/// @title TaskBoardEscrow
/// @notice Escrow contract that holds bounty funds and releases them when
///         the task creator signs an EIP-712 payout authorization for a hunter.
contract TaskBoardEscrow is EIP712 {
    using ECDSA for bytes32;

    /// @dev Typed structured data hash for a claim.
    /// keccak256("Claim(uint256 taskId,address hunter,bytes32 workHash)")
    bytes32 private constant CLAIM_TYPEHASH =
        0x5fde8480c1ecfb5d735d1f618eb5d286276f4e5a3815014a4f14f7a64de79539;

    struct Task {
        address creator;
        uint96 amount;
        uint64 deadline;
        bool claimed;
        bool refunded;
        bytes32 workHash;
    }

    uint256 private _taskIdTracker;
    mapping(uint256 => Task) private _tasks;

    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 amount, uint64 deadline);
    event TaskClaimed(uint256 indexed taskId, address indexed hunter, bytes32 workHash);
    event TaskRefunded(uint256 indexed taskId);

    error NotCreator();
    error InvalidAmount();
    error TaskNotFound();
    error AlreadyClaimed();
    error AlreadyRefunded();
    error DeadlineNotReached();
    error InvalidSignature();

    constructor() EIP712("TaskBoardEscrow", "1") {}

    /// @notice Creates and funds a new task.
    /// @param deadline Timestamp after which the creator can reclaim the funds.
    /// @return taskId The identifier of the newly created task.
    function createTask(uint64 deadline) external payable returns (uint256 taskId) {
        if (msg.value == 0) revert InvalidAmount();
        unchecked {
            taskId = ++_taskIdTracker;
        }
        _tasks[taskId] = Task({
            creator: msg.sender,
            amount: uint96(msg.value),
            deadline: deadline,
            claimed: false,
            refunded: false,
            workHash: bytes32(0)
        });

        emit TaskCreated(taskId, msg.sender, msg.value, deadline);
    }

    /// @notice Claims the escrowed funds using a creator signature.
    /// @param taskId Identifier of the task to claim.
    /// @param hunter Address receiving the payout.
    /// @param workHash Hash of the work submission (e.g. IPFS CID hash).
    /// @param signature Creator's EIP-712 signature authorizing the payout.
    function claim(
        uint256 taskId,
        address hunter,
        bytes32 workHash,
        bytes calldata signature
    ) external {
        Task storage task = _tasks[taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.claimed) revert AlreadyClaimed();
        if (task.refunded) revert AlreadyRefunded();

        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, taskId, hunter, workHash));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        if (signer != task.creator) revert InvalidSignature();

        task.claimed = true;
        task.workHash = workHash;

        emit TaskClaimed(taskId, hunter, workHash);

        (bool ok, ) = hunter.call{value: task.amount}("");
        require(ok, "transfer failed");
    }

    /// @notice Refunds the creator after the deadline if the task is not claimed.
    /// @param taskId Identifier of the task to refund.
    function refund(uint256 taskId) external {
        Task storage task = _tasks[taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (msg.sender != task.creator) revert NotCreator();
        if (task.claimed) revert AlreadyClaimed();
        if (task.refunded) revert AlreadyRefunded();
        if (block.timestamp <= task.deadline) revert DeadlineNotReached();

        task.refunded = true;

        emit TaskRefunded(taskId);

        (bool ok, ) = task.creator.call{value: task.amount}("");
        require(ok, "refund failed");
    }

    /// @notice Returns metadata about a task.
    function getTask(uint256 taskId) external view returns (Task memory) {
        Task memory task = _tasks[taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        return task;
    }

    /// @notice Returns the next task id (useful for UI pre-computation).
    function nextTaskId() external view returns (uint256) {
        return _taskIdTracker + 1;
    }
}
