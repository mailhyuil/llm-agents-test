import z from "zod";
import worker from "../agents/worker";
import { config } from "../config";
import { ecommerceSchema } from "../schema/ecommerce-schema";

export async function callWorker(state: z.infer<typeof ecommerceSchema>) {
  const response = await worker.invoke(state, config);
  return {
    messages: response.messages,
  };
}
