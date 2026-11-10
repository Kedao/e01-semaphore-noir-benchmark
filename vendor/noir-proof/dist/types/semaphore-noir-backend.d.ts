import { Group, MerkleProof } from "@semaphore-protocol/group";
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { Identity } from "@semaphore-protocol/identity";
import { UltraHonkBackend } from "./ultrahonk";
export type SemaphoreNoirBackend = {
    honkBackend: UltraHonkBackend;
    noir: Noir;
    merkleTreeDepth: number;
};
/** It initializes and returns a SemaphoreNoirBackend
 * UltraHonkBackend is tied to a circuit. Make sure to re-initialize it when changing merkleTreeDepth.
 * The merkleTreeDepth of the tree determines which zero-knowledge artifacts to use to generate the proof.
 * If unknown, use getMerkleTreeDepth() below to get the merkleTreeDepth from a Merkle proof or a group.
 * The compiled Noir circuit can be passed directly, or the correct circuit will be fetched.
 * @param merkleTreeDepth The depth of the tree for which the circuit was compiled
 * @param noirCompiledCircuit The precompiled Noir circuit
 * @param threads The number of threads to run the UltraHonk backend worker on.
 * For node this can be os.cpus().length, for browser it can be navigator.hardwareConcurrency

 */
export declare function initSemaphoreNoirBackend(merkleTreeDepth: number, noirCompiledCircuit?: CompiledCircuit, threads?: number): Promise<SemaphoreNoirBackend>;
/**
 * Calculates merkleTreeDepth with a group or a merkle proof
 * This method can be used to get merkleTreeDepth before calling initSemaphoreNoirBackend,
 * or check if the merkleTreeDepth in SemaphoreNoirBackend is big enough for a merkle proof.
 * @param identity The Semaphore Identity
 * @param groupOrMerkleProof The Semaphore group or the Merkle proof for the identity
 */
export declare function getMerkleTreeDepth(identity: Identity, groupOrMerkleProof: Group | MerkleProof): number;
