import z from "zod";
export const evaluatorSchema = z.object({
  success_criteria: z.string().optional().describe("성공 기준입니다."),
  feedback: z.string().optional().describe("어시스턴트의 응답에 대한 피드백입니다."),
  success_criteria_met: z.boolean().optional().describe("성공 기준이 충족되었는지 여부입니다."),
  user_input_needed: z.boolean().optional().describe("사용자의 추가 입력이 필요한지 여부입니다."),
});

export type EvaluatorStateType = z.infer<typeof evaluatorSchema>;
