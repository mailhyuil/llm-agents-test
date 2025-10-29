import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { checkpointer } from "../config";
import { evaluatorSchema } from "../schema/evaluator-schema";

const evaluatorModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 1000,
});

export const evaluator = createAgent({
  name: "evaluator",
  model: evaluatorModel,
  checkpointer: checkpointer,
  responseFormat: evaluatorSchema,
});
