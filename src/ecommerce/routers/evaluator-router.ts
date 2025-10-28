import { END } from "@langchain/langgraph";
import { EcommerceAnnotation } from "../ecommerce-annotation";

export function routeBasedOnEvaluation(state: typeof EcommerceAnnotation.State) {
  if (state.success_criteria_met || state.user_input_needed) {
    return END;
  }
  return "confirm";
}
