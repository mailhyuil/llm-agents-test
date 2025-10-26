import { push } from "./push.js";

export async function recordUserDetails(email: string, name = "Name not Provided", notes = "not provided") {
  await push(`Recording ${name} with email ${email} and notes ${notes}`);
  return { recorded: "ok" };
}
