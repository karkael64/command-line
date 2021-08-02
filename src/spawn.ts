import { spawn } from "child_process";

export async function spawnInline(
  argv: string[],
  forceName?: string
): Promise<number> {
	const args = argv.slice();
	const firstArg = args.shift();
	if (!firstArg) {
		return Promise.reject(
			new Error('Please insert at least one string in first parameter list'),
		);
	}
	const name = forceName ?? firstArg;
  return new Promise((resolve, reject) => {
    const node = spawn(firstArg, args, { stdio: "inherit" });

    node.on("error", (error) => {
      reject(error);
    });

    node.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Unexpected error code ${code} for ${name} command.`)
        );
      }
      resolve(0);
    });
  });
}

export async function spawnOutput(argv: string[], forceName?: string): Promise<string> {
	const args = argv.slice();
	const firstArg = args.shift();
	if (!firstArg) {
		return Promise.reject(
			new Error('Please insert at least one string in first parameter list'),
		);
	}
	const name = forceName ?? firstArg;
	return new Promise((resolve, reject) => {
		const datas: Buffer[] = [];
		const errors: Buffer[] = [];
		const node = spawn(firstArg, args);

		node.on('error', (error) => {
			reject(error);
		});

		node.stdout.on('data', (data: Buffer) => datas.push(data));
		node.stderr.on('data', (data: Buffer) => errors.push(data));

		node.on('close', (code) => {
			if (errors.length) {
				return reject(Buffer.concat(errors).toString());
			}
			if (code !== 0) {
				return reject(
					new Error(`Unexpected error code ${code} for ${name} command.`),
				);
			}
			resolve(Buffer.concat(datas).toString());
		});
	});
}

export async function spawnWrapped(
  argv: string[],
	onData?: ((data: Buffer) => void),
	onError?: ((error: Buffer) => void),
): Promise<number> {
	const args = argv.slice();
	const name = args.shift();
	if (!name) {
		return Promise.reject(
			new Error('Please insert at least one string in first parameter list'),
		);
	}
  return new Promise((resolve, reject) => {
    const node = spawn(name, args);

    node.on("error", (error) => {
      reject(error);
    });

    node.stdout.on("data", onData ?? ((data) => console.log(`${name}: ${data}`)));
    node.stderr.on("data", onError ?? ((data) => console.error(`${name}: ${data}`)));

    node.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Unexpected error code ${code} for ${name} command.`)
        );
      }
      resolve(0);
    });
  });
}
