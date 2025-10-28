import { EcommerceAnnotation } from "../annotations/ecommerce-annotation";

export function routeBasedOnEvaluation(state: typeof EcommerceAnnotation.State) {
  console.log("routeBasedOnEvaluation called with state:", state);
  if (state.success_criteria_met && !state.user_input_needed) {
    return "confirm";
  }
  console.log("routeBasedOnEvaluation returning worker");
  return "worker";
}
