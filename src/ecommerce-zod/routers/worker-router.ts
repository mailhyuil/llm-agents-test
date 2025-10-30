import { AIMessage } from "langchain";
import { EcommerceSchemaType } from "../schema/ecommerce-schema";

export const workerRouter = async (state: EcommerceSchemaType) => {
  if ((state.messages[state.messages.length - 1] as AIMessage).tool_calls?.length) {
    return "tools";
  }
  return "evaluate";
};
