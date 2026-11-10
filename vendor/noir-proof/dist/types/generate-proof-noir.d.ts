import type { Group, MerkleProof } from "@semaphore-protocol/group";
import type { Identity } from "@semaphore-protocol/identity";
import type { BigNumberish } from "ethers";
import { SemaphoreNoirProof } from "./types";
import { SemaphoreNoirBackend } from "./semaphore-noir-backend";
/**
 * This generates a Semaphore Noir proof; a zero-knowledge proof that an identity that
 * is part of a group has shared an anonymous message.
 *
 * The message may be any arbitrary user-defined value (e.g. a vote), or the hash of that value.
 * The scope is a value used like a topic on which users can generate a valid proof only once,
 * for example the id of an election in which voters can only vote once.
 * The hash of the identity's scope and secret scalar is called a nullifier and can be
 * used to verify whether that identity has already generated a valid proof in that scope.
 * The backend determines which UltraHonkBackend and Noir instance to use to generate the proof.
 * It is tied to the Noir circuit / merkleTreeDepth, be sure to re-initiate the backend if it is changed.
 *
 * Please keep in mind that groups with 1 member or 2 members cannot be considered anonymous.
 *
 * @param identity The Semaphore Identity
 * @param groupOrMerkleProof The Semaphore group or the Merkle proof for the identity
 * @param message The Semaphore message
 * @param scope The Semaphore scope
 * @param backend The SemaphoreNoirBackend used to generate the proof
 * @param keccak Use this option when you're using the Solidity verifier.
 * By selecting this option, the challenges in the proof will be generated with the keccak hash function instead of poseidon.
 * @returns The Semaphore Noir proof ready to be verified.
 */
export default function generateNoirProof(identity: Identity, groupOrMerkleProof: Group | MerkleProof, message: BigNumberish | Uint8Array | string, scope: BigNumberish | Uint8Array | string, backend: SemaphoreNoirBackend, keccak?: boolean): Promise<SemaphoreNoirProof>;
