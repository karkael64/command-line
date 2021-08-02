function isString(item: any): item is string {
  return typeof item === "string";
}

function arrayFlat<Type extends any>(list: Type[][], depth = 1): Type[] {
  if (depth < 1) return list as Type[];
  return arrayFlat(list, depth - 1).reduce((acc, val) => {
    if (Array.isArray(val)) {
      return [...acc, ...val];
    }
    return [...acc, val];
  }, []);
}

function extractArgWithValueDetached(
  args: string[],
  keys: string[],
  forbiddenValues: string[],
  init: any = undefined
): string {
  if (!Array.isArray(args) || args.find((arg) => !isString(arg))) {
    throw new Error("First parameter should be a an array of strings");
  }
  if (!Array.isArray(keys) || keys.find((key) => !isString(key))) {
    throw new Error("Second parameter should be a an array of strings");
  }

  const foundKeys = keys.filter((key) => args.includes(key));

  if (foundKeys.length > 2) {
    throw new Error(
      `Options ${foundKeys} are both defined, but are same. Please use only one.`
    );
  }
  if (foundKeys.length < 1) {
    return init;
  }

  const index = args.findIndex((arg) => keys.includes(arg));

  if (
    args[index + 1] === undefined ||
    forbiddenValues.includes(args[index + 1])
  ) {
    throw new Error(
      `Option ${args[index]} is not followed by a correct value.`
    );
  }

  const [_key, value] = args.splice(index, 2);

  return value;
}

function extractArgWithValueAttached(
  args: string[],
  keys: string[],
  init: any = undefined,
  joinners: string[] = ["="]
): string {
  if (!Array.isArray(args) || args.find((arg) => !isString(arg))) {
    throw new Error("First parameter should be a an array of strings");
  }
  if (!Array.isArray(keys) || keys.find((key) => !isString(key))) {
    throw new Error("Second parameter should be a an array of strings");
  }
  if (!Array.isArray(joinners) || joinners.find((join) => !isString(join))) {
    throw new Error("Fourth parameter should be a an array of strings");
  }

  const starters = arrayFlat(
    keys.map((key) => joinners.map((join) => `${key}${join}`))
  );
  const foundStarters = starters.filter((start) =>
    args.find((arg) => arg.startsWith(start))
  );

  if (foundStarters.length > 2) {
    throw new Error(
      `Options ${foundStarters} are both defined, but are same. Please use only one.`
    );
  }
  if (foundStarters.length < 1) {
    return init;
  }

  const [starter] = foundStarters;
  const index = args.findIndex((arg) =>
    starters.find((start) => arg.startsWith(start))
  );

  const [fullArg] = args.splice(index, 1);

  return fullArg.slice(starter.length);
}

function extractArgAlone(args: string[], keys: string[]): boolean {
  if (!Array.isArray(args) || args.find((arg) => !isString(arg))) {
    throw new Error("First parameter should be a an array of strings");
  }
  if (!Array.isArray(keys) || keys.find((key) => !isString(key))) {
    throw new Error("Second parameter should be a an array of strings");
  }

  const foundKeys = keys.filter((key) => args.includes(key));

  if (foundKeys.length > 2) {
    throw new Error(
      `Options ${foundKeys} are both defined, but are same. Please use only one.`
    );
  }
  if (foundKeys.length < 1) {
    return false;
  }

  const index = args.findIndex((arg) => keys.includes(arg));
  args.splice(index, 1);

  return true;
}

export function buildCommandOption<
  S extends "detached" | "attached" | "value" | "alone" = "alone"
>(
  keys: string[],
  description: string,
  varname?: string,
  type: S = "alone" as S
) {
  return {
    type: type as S,
    keys,
    description,
    getItemToString(padKeys: number) {
      return `  ${`${keys}${varname ? ` <${varname}>` : ""}`.padEnd(
        padKeys,
        " "
      )}  ${description}`;
    },
    getKeysStringLength() {
      return `${keys}${varname ? ` <${varname}>` : ""}`.length;
    },
    extractArg(
      args: string[],
      forbiddenValues: string[],
      joinners: string[]
    ): string | boolean | void {
      switch (type) {
        case "detached":
          return extractArgWithValueDetached(
            args,
            keys,
            forbiddenValues,
            undefined
          );
        case "attached":
          return extractArgWithValueAttached(args, keys, undefined, joinners);
        case "value":
          try {
            return extractArgWithValueDetached(
              args,
              keys,
              forbiddenValues,
              undefined
            );
          } catch (e) {}
          return extractArgWithValueAttached(args, keys, undefined, joinners);
        default:
          return extractArgAlone(args, keys);
      }
    },
  };
}

export function buildCommand<
  T extends Record<string, ReturnType<typeof buildCommandOption>>
>(
  description: string,
  options: T,
  examples: string[],
  joinners: string[] = ["="]
) {
  return {
    description,
    options,
    examples,
    getOptionsKeys() {
      return arrayFlat(Object.values(options).map((op) => op.keys));
    },
    getOptionsNames() {
      return Object.keys(options);
    },
    getOptionsToString() {
      const padLength = Math.max(
        ...this.getOptionsNames().map((name) =>
          options[name].getKeysStringLength()
        )
      );
      return Object.values(options)
        .map((op) => op.getItemToString(padLength))
        .join("\n");
    },
    extractArgs(
      args: string[]
    ): { [k in keyof T]: T[k]["type"] extends "alone" ? boolean | void : string | void } {
      const forbiddenValues = this.getOptionsKeys();
      return this.getOptionsNames().reduce((acc, name) => {
        acc[name] = options[name].extractArg(args, forbiddenValues, joinners);
        return acc;
      }, {});
    },
    toString() {
      const optionsString = examples.length
        ? `\n\nOptions:\n${this.getOptionsToString()}`
        : "";
      const examplesString = examples.length
        ? `\n\nExamples:\n${examples.map((ex) => `  ${ex}`).join("\n")}`
        : "";
      return `\n${description}${optionsString}${examplesString}\n`;
    },
  };
}
