import { EcommerceSchemaType } from "../schema/ecommerce-schema";

export function routeBasedOnEvaluation(state: EcommerceSchemaType) {
  if (state.success_criteria_met && !state.user_input_needed) {
    return "confirm";
  }
  return "worker";
}
