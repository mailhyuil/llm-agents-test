import { ChatOpenAI } from "@langchain/openai";
import { inputUserDataTool } from "../tools/input-user-data-tool";
import { paymentTool } from "../tools/payment-tool";
export const tools = [inputUserDataTool, paymentTool];
export const worker = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 1000,
}).bindTools(tools);
