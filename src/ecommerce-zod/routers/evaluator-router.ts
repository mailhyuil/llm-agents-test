import z from "zod";
import { ecommerceSchema } from "../schema/ecommerce-schema";

export function routeBasedOnEvaluation(state: z.infer<typeof ecommerceSchema>) {
  if (state.success_criteria_met && !state.user_input_needed) {
    return "confirm";
  }
  return "worker";
}
