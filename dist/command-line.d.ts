export declare function buildCommandOption<S extends "detached" | "attached" | "value" | "alone" = "alone">(keys: string[], description: string, varname?: string, type?: S): {
    type: S;
    keys: string[];
    description: string;
    getItemToString(padKeys: number): string;
    getKeysStringLength(): number;
    extractArg(args: string[], forbiddenValues: string[], joinners: string[]): string | boolean | void;
};
export declare function buildCommand<T extends Record<string, ReturnType<typeof buildCommandOption>>>(description: string, options: T, examples: string[], joinners?: string[]): {
    description: string;
    options: T;
    examples: string[];
    getOptionsKeys(): string[];
    getOptionsNames(): string[];
    getOptionsToString(): string;
    extractArgs(args: string[]): { [k in keyof T]: T[k]["type"] extends "alone" ? boolean | void : string | void; };
    toString(): string;
};
