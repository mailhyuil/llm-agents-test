import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const EvaluatorAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  success_criteria: Annotation<string>({
    default: () => "",
    reducer: (state, value) => {
      return value;
    },
  }),
  feedback_on_work: Annotation<string>({
    default: () => "",
    reducer: (state, value) => {
      return value;
    },
  }),
  success_criteria_met: Annotation<boolean>({
    default: () => false,
    reducer: (state, value) => {
      return value;
    },
  }),
  user_input_needed: Annotation<boolean>({
    default: () => false,
    reducer: (state, value) => {
      return value;
    },
  }),
});
