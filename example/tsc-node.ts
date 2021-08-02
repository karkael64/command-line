import { promises as fs } from "fs";
import path from "path";
import { command, helper } from "./tsc-node.command-line";
import { spawnInline, spawnWrapped } from "../src/spawn";

async function isFile(path: string) {
  try {
    const stat = await fs.lstat(path);
    return stat.isFile();
  } catch (e) {
    return false;
  }
}

async function removeFolder(path: string) {
  return fs.rm(path, { recursive: true, force: true });
}

async function getArgs() {
  const args = process.argv.slice(
    process.argv.findIndex((arg) => arg === __filename) + 1
  );

  const { cacheFolder, keepCache, help, verbose } = command.extractArgs(args);

  if (help) {
    console.log(helper);
    return;
  }

  const tsfile = args.shift();
  const tsconfig = args.length
    ? args
    : [
        "--esModuleInterop",
        "--declaration",
        "--target",
        "ESNext",
        "--moduleResolution",
        "Node",
        "--module",
        "CommonJS",
      ];

  if (!tsfile) {
    throw new Error(`Expect a typescript file as parameter`);
  }
  if (!(await isFile(tsfile))) {
    throw new Error(`Path ${JSON.stringify(tsfile)} is not a valid file`);
  }
  if (!tsfile.match(/\.tsx?$/)) {
    throw new Error(`Path ${JSON.stringify(tsfile)} is not a typescript file`);
  }

  return {
    tsfile,
    cacheFolder,
    keepCache,
    verbose,
    tsconfig,
  };
}

async function tscompile(
  entry: string,
  outDir: string,
  tsconfig = []
) {
  await spawnWrapped(["tsc", entry, "--outDir", outDir, ...tsconfig]);
  return path.resolve(outDir, path.basename(entry).replace(/\.tsx?/, ".js"));
}

async function run(entry: string) {
  return spawnInline(["node", entry]);
}

async function main(): Promise<number> {
  const dtStart = Date.now();

  // command line args
  const result = await getArgs();
  if (!result) {
    return 0;
  }
  const {
    tsfile,
    tsconfig,
    cacheFolder = "./node_modules/.tsc-node",
    keepCache,
    verbose,
  } = result;
  const dtGetArgs = Date.now();
  if (verbose) {
    console.log(`Found entry… ${dtGetArgs - dtStart}ms`);
  }

  // compile ts to js
  const jsfile = await tscompile(tsfile, cacheFolder, tsconfig);
  if (!(await isFile(jsfile))) {
    throw new Error("Failed to find the output file");
  }
  const dtCompile = Date.now();
  if (verbose) {
    console.log(`Compiled… ${dtCompile - dtGetArgs}ms`);
  }

  // execute
  await run(jsfile);
  const dtEnd = Date.now();
  if (verbose) {
    console.log(`End script… ${dtEnd - dtCompile}ms`);
  }

  // clean cache
  if (!keepCache) {
    await removeFolder(cacheFolder);
    const dtRm = Date.now();
    if (verbose) {
      console.log(`Remove cache… ${dtRm - dtEnd}ms`);
    }
  }

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch(console.error);
