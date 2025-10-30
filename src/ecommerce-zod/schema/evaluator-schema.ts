import z from "zod";
export const evaluatorSchema = z.object({
  success_criteria: z.string(),
  feedback: z.string(),
  success_criteria_met: z.boolean(),
  user_input_needed: z.boolean(),
});

export type EvaluatorStateType = z.infer<typeof evaluatorSchema>;
