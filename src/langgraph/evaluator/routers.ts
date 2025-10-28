import { AIMessage } from "@langchain/core/messages";
import { END } from "@langchain/langgraph";
import { EvaluatorAnnotation } from "./annotation";

export function workerRouter({ messages }: typeof EvaluatorAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "evaluator";
}

export function routeBasedOnEvaluation(state: typeof EvaluatorAnnotation.State) {
  if (state.success_criteria_met || state.user_input_needed) {
    return END;
  }
  return "worker";
}
