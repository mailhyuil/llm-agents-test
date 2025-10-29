import { AIMessage } from "@langchain/core/messages";
import z from "zod";
import { ecommerceSchema } from "../schema/ecommerce-schema";

export const workerRouter = async (state: z.infer<typeof ecommerceSchema>) => {
  if ((state.messages[state.messages.length - 1] as AIMessage).tool_calls?.length) {
    return "tools";
  }
  return "evaluate";
};
