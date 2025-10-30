import { StateGraph } from "@langchain/langgraph";
import z from "zod";

const testSchema = z.object({
  test: z.string(),
});
const contextSchema = z.object({
  userId: z.string(),
});
const graph = new StateGraph(testSchema, contextSchema).compile();
const result = await graph.invoke(
  { test: "test" },
  {
    context: { userId: "user-id" },
    configurable: { thread_id: "thread-id" },
  },
);
