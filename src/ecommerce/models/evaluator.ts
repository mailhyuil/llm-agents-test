import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const evaluatorSchema = z.object({
  feedback: z.string().describe("어시스턴트의 응답에 대한 피드백입니다."),
  success_criteria_met: z.boolean().describe("성공 기준이 충족되었는지 여부입니다."),
  user_input_needed: z.boolean().describe("사용자의 추가 입력이 필요한지 여부입니다."),
});

const evaluatorLlm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export const evaluatorLlmWithOutput = evaluatorLlm.withStructuredOutput(evaluatorSchema);
