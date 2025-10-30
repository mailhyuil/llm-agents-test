import { worker } from "../agents/worker";
import { config } from "../config";
import { EcommerceSchemaType } from "../schema/ecommerce-schema";

export async function callWorker(state: EcommerceSchemaType) {
  const response = await worker.invoke(state.messages, config);
  console.log(response.content);
  return {
    messages: [response],
  };
}
