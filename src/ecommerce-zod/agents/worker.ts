import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { checkpointer } from "../config";
import { ecommerceSchema } from "../schema/ecommerce-schema";
import { inputUserDataTool } from "../tools/input-user-data-tool";
import { paymentTool } from "../tools/payment-tool";
export const tools = [inputUserDataTool, paymentTool];

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 1000,
});
const worker = createAgent({
  name: "worker",
  model: model,
  tools,
  systemPrompt: `
  You are a helpful assistant that can help with user data input and payment.
  `,
  description: `You are a helpful assistant that can help with user data input and payment.`,
  stateSchema: ecommerceSchema,
  checkpointer: checkpointer,
});

export default worker;
