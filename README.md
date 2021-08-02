# Command-Line

This package creates a simple command-line script. The two main functions are creating a manual (or helper panel) and extracting arguments from a string list like process `argv`. It works by registering command-line description, available arguments and some examples.

## Installation

```
npm install karkael64/command-line
yarn install karkael64/command-line
```

## Output a manual

The below configuration writes this manual output:

```
Build and execute a typescript file with its dependencies, following tsconfig file

Options:
  -h,--help                Show this helper
  -f,--cacheFolder <path>  Define the folder for javacript generated files
  -k,--keepCache           Tell that you want to keep cache at the end of execution
  -v,--verbose             Writes steps and times

Examples:
  tsc-node ./script/serverless.ts
  tsc-node ./script/serverless.ts -f ./tmp
```

The manual string is available in `toString` method:

```ts
const manual = `${command}`;
```

## Extract arguments

The below configuration helps you to extract arguments from proccess `argv`

```ts
const args = process.argv.slice();
const { cacheFolder, keepCache, help, verbose } = command.extractArgs(args);
```

## Configure and create command instance

```ts
import { buildCommand, buildCommandOption } from "command-line";

const commandDescription = `Build and execute a typescript file with its dependencies`;

const commandOptions = {
  help: buildCommandOption(
    ["-h", "--help"],
    "Show this helper"
  ),
  cacheFolder: buildCommandOption(
    ["-f", "--cacheFolder"],
    "Define the folder for javacript generated files",
    "path",
    "detached"
  ),
  keepCache: buildCommandOption(
    ["-k", "--keepCache"],
    "Tell that you want to keep cache at the end of execution"
  ),
  verbose: buildCommandOption(
    ["-v", "--verbose"],
    "Writes steps and times"
    ),
};

const commandExamples = [
  "tsc-node ./script/serverless.ts",
  "tsc-node ./script/serverless.ts -f ./tmp",
];

export const command = buildCommand(
  commandDescription,
  commandOptions,
  commandExamples
);

export const helper = `${command}`;
```

## Child process

User often needs to spawn a child process while you run your command line. You can load three type of child process spawning:

* `spawnInline`: executes a command, the output is displayed in parent process.
* `spawnOutput`: executes a command, the buffer is returned (error rejected or output resolved).
* `spawnWrapped`: executes a command, the buffer is catched (onData, onError) in parameters callbacks or logged with program name displayed.

```ts
function spawnInline(argv: string[], forceName?: string): Promise<number>;
function spawnOutput(argv: string[], forceName?: string): Promise<string>;
function spawnWrapped(argv: string[], onData?: ((data: Buffer) => void), onError?: ((error: Buffer) => void)): Promise<number>;
```