import { ChatOpenAI } from "@langchain/openai";
import { evaluatorSchema } from "../schema/evaluator-schema";

const evaluatorModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 1000,
});
export const evaluator = evaluatorModel.withStructuredOutput(evaluatorSchema);
