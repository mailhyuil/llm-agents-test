import { EcommerceAnnotation } from "../annotations/ecommerce-annotation";
import { config } from "../config";
import worker from "../models/worker";

export async function callWorker(state: typeof EcommerceAnnotation.State): Promise<typeof EcommerceAnnotation.State> {
  const messages = state.messages;
  const response = await worker.invoke(messages, config);
  return {
    ...state,
    messages: [response],
  };
}
