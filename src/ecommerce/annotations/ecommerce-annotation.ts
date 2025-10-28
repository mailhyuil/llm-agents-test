import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import z from "zod";

type Status = "processing" | "canceled" | "succeeded";

export const ecommerceSchema = z.object({
  status: z.enum(["processing", "canceled", "succeeded"]),
  success_criteria: z.string(),
  feedback_on_work: z.string(),
  success_criteria_met: z.boolean(),
  user_input_needed: z.boolean(),
});

export const EcommerceAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  status: Annotation<Status>({
    default: () => "processing",
    reducer: (state, value) => {
      return value;
    },
  }),
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
