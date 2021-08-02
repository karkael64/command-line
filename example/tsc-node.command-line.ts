import { buildCommand, buildCommandOption } from "../src/command-line";

const commandDescription = `Build and execute a typescript file with its dependencies`;

const commandOptions = {
  help: buildCommandOption(["-h", "--help"], "Show this helper"),
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
  verbose: buildCommandOption(["-v", "--verbose"], "Writes steps and times"),
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
