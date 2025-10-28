import { ChatOpenAI } from "@langchain/openai";
import { ecommerceSchema } from "../ecommerce-annotation";
import { paymentTool } from "../tools/payment-tool";
import { validateFormTool } from "../tools/validate-form-tool";

export const tools = [validateFormTool, paymentTool];
const worker = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 1000,
});
worker.withStructuredOutput(ecommerceSchema);
worker.bindTools(tools);
export default worker;
