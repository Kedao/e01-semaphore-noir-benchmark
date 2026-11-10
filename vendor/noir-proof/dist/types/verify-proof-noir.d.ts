import { SemaphoreNoirProof } from "./types";
import { SemaphoreNoirBackend } from "./semaphore-noir-backend";
/**
 * Verifies whether a Semahpore Noir proof is valid.
 * Note that the correct backend.honkBackend must be used for the proof.
 * If unsure, initialize new SemaphoreNoirBackend with proof.merkleTreeDepth.
 *
 * @param proof The Semaphore Noir proof
 * @param backend The SemaphoreNoirBackend used to generate the proof
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyNoirProof(proof: SemaphoreNoirProof, backend: SemaphoreNoirBackend): Promise<boolean>;
