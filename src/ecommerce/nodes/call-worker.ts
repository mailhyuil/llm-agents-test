import { EcommerceAnnotation } from "../ecommerce-annotation";
import worker from "../models/worker";

export async function callWorker(state: typeof EcommerceAnnotation.State): Promise<typeof EcommerceAnnotation.State> {
  const messages = state.messages;
  const response = await worker.invoke(messages);
  console.log(response.content);
  return {
    ...state,
    messages: [...state.messages, response],
  };
}
