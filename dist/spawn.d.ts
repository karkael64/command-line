/// <reference types="node" />
export declare function spawnWrapped(argv: string[], onData?: ((data: Buffer) => void), onError?: ((error: Buffer) => void)): Promise<number>;
export declare function spawnInline(argv: string[], forceName?: string): Promise<number>;
export declare function spawnOutput(argv: string[], forceName?: string): Promise<string>;
