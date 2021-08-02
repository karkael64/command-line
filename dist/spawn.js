import { spawn } from "child_process";
export async function spawnWrapped(argv, onData, onError) {
    const args = argv.slice();
    const name = args.shift();
    if (!name) {
        return Promise.reject(new Error('Please insert at least one string in first parameter list'));
    }
    return new Promise((resolve, reject) => {
        const node = spawn(args.shift(), args);
        node.on("error", (error) => {
            reject(error);
        });
        node.stdout.on("data", onData !== null && onData !== void 0 ? onData : ((data) => console.log(`${name}: ${data}`)));
        node.stderr.on("data", onError !== null && onError !== void 0 ? onError : ((data) => console.error(`${name}: ${data}`)));
        node.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`Unexpected error code ${code} for ${name} command.`));
            }
            resolve(0);
        });
    });
}
export async function spawnInline(argv, forceName) {
    const args = argv.slice();
    const firstArg = args.shift();
    if (!firstArg) {
        return Promise.reject(new Error('Please insert at least one string in first parameter list'));
    }
    const name = forceName !== null && forceName !== void 0 ? forceName : firstArg;
    return new Promise((resolve, reject) => {
        const node = spawn(args.shift(), args, { stdio: "inherit" });
        node.on("error", (error) => {
            reject(error);
        });
        node.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`Unexpected error code ${code} for ${name} command.`));
            }
            resolve(0);
        });
    });
}
export async function spawnOutput(argv, forceName) {
    const args = argv.slice();
    const firstArg = args.shift();
    if (!firstArg) {
        return Promise.reject(new Error('Please insert at least one string in first parameter list'));
    }
    const name = forceName !== null && forceName !== void 0 ? forceName : firstArg;
    return new Promise((resolve, reject) => {
        const datas = [];
        const errors = [];
        const node = spawn(firstArg, args);
        node.on('error', (error) => {
            reject(error);
        });
        node.stdout.on('data', (data) => datas.push(data));
        node.stderr.on('data', (data) => errors.push(data));
        node.on('close', (code) => {
            if (errors.length) {
                return reject(Buffer.concat(errors).toString());
            }
            if (code !== 0) {
                return reject(new Error(`Unexpected error code ${code} for ${name} command.`));
            }
            resolve(Buffer.concat(datas).toString());
        });
    });
}
//# sourceMappingURL=spawn.js.map