import { user } from "./dto/user";

export const threadId = "demo-" + Math.random().toString(36).slice(2);
export const config = { configurable: { thread_id: threadId, user } };
