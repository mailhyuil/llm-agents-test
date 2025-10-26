import { push } from "./push.js";

export async function recordUnknownQuestion(question: string) {
  await push(`Recording question "${question}" asked that I couldn't answer`);
  return { recorded: "ok" };
}
