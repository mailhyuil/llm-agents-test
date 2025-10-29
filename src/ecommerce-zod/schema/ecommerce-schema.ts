import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import z from "zod";

export const ecommerceSchema = z.object({
  messages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta),
  status: z.enum(["processing", "canceled", "succeeded"]).default("processing").describe("상태입니다."),
  success_criteria: z.string().describe("성공 기준입니다."),
  feedback_on_work: z.string().describe("피드백입니다."),
  success_criteria_met: z.boolean().describe("성공 기준이 충족되었는지 여부입니다."),
  user_input_needed: z.boolean().describe("사용자의 추가 입력이 필요한지 여부입니다."),
});
