import z from "zod";
import { ecommerceSchema } from "../schema/ecommerce-schema";

/**
 * 대화 기록을 문자열로 포맷팅하는 헬퍼 함수입니다.
 * @param messages - 포맷팅할 메시지 배열
 * @returns 대화 기록을 나타내는 단일 문자열
 */
export function formatConversation(messages: z.infer<typeof ecommerceSchema>["messages"]): string {
  return messages.map(msg => `${msg.type}: ${msg.content}`).join("\n");
}
