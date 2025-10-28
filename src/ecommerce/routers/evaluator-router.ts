import { EcommerceAnnotation } from "../annotations/ecommerce-annotation";

export function routeBasedOnEvaluation(state: typeof EcommerceAnnotation.State) {
  if (state.success_criteria_met && !state.user_input_needed) {
    return "confirm";
  }
  return "worker";
}
