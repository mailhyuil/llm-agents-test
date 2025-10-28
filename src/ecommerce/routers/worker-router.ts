import { AIMessage } from "@langchain/core/messages";
import { EcommerceAnnotation } from "../annotations/ecommerce-annotation";

export const workerRouter = async (state: typeof EcommerceAnnotation.State) => {
  if ((state.messages[state.messages.length - 1] as AIMessage).tool_calls?.length) {
    return "tools";
  }
  return "evaluate";
};
