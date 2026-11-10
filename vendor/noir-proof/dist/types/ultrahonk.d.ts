import { BackendOptions, Barretenberg, ProofData } from "@aztec/bb.js";
/**
 * Options for the UltraHonkBackend.
 * https://github.com/AztecProtocol/aztec-packages/blob/v0.82.2/barretenberg/ts/src/barretenberg/backend.ts#L161
 */
export type UltraHonkBackendOptions = {
    /**Selecting this option will use the keccak hash function instead of poseidon
     * when generating challenges in the proof.
     * Use this when you want to verify the created proof on an EVM chain.
     */
    keccak: boolean;
};
export type CircuitOptions = {
    /** @description Whether to produce SNARK friendly proofs */
    recursive: boolean;
};
/**
 * This is a modified verson of UltraHonkBackend from @aztec/bb.js
 * https://github.com/AztecProtocol/aztec-packages/blob/v0.82.2/barretenberg/ts/src/barretenberg/backend.ts#L20
 * Most of the logic stays the same, except that numPublicInputs and vkBuf are added
 * as parameters of generateProof() and verifyProof(). So the verification keys
 * can be pre-calculated and reused.
 */
export declare class UltraHonkBackend {
    protected backendOptions: BackendOptions;
    protected circuitOptions: CircuitOptions;
    protected api: Barretenberg;
    protected acirUncompressedBytecode: Uint8Array;
    private destroyed;
    constructor(acirBytecode: string, backendOptions?: BackendOptions, circuitOptions?: CircuitOptions);
    /** @ignore */
    instantiate(): Promise<void>;
    generateProof(compressedWitness: Uint8Array, options?: UltraHonkBackendOptions, numPublicInputs?: number): Promise<ProofData>;
    verifyProof(proofData: ProofData, options?: UltraHonkBackendOptions, vkBuf?: Uint8Array): Promise<boolean>;
    destroy(): Promise<void>;
}
export declare function flattenFieldsAsArray(fields: string[]): Uint8Array;
export declare function deflattenFields(flattenedFields: Uint8Array): string[];
