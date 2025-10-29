import worker from "../agents/worker";
import { config } from "../config";
import { EcommerceStateType } from "../schema/ecommerce-schema";

export async function callWorker(state: EcommerceStateType) {
  const response = await worker.invoke(state, config);
  return {
    messages: response.messages,
  };
}
