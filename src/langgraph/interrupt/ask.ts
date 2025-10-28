import { stdin, stdout } from "process";
import { createInterface } from "readline";

const rl = createInterface({ input: stdin, output: stdout });

export const ask = (q: string): Promise<string> => new Promise(resolve => rl.question(q, resolve));
