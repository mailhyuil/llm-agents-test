import { AIMessage } from "@langchain/core/messages";
import { EcommerceStateType } from "../schema/ecommerce-schema";

export const workerRouter = async (state: EcommerceStateType) => {
  if ((state.messages[state.messages.length - 1] as AIMessage).tool_calls?.length) {
    return "tools";
  }
  return "evaluate";
};
