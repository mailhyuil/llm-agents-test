import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

import z from "zod";
import { evaluator } from "../agents/evaluator";
import { config } from "../config";
import { formatConversation } from "../helpers/format-conversation";
import { ecommerceSchema } from "../schema/ecommerce-schema";

/**
 * 어시스턴트의 응답을 평가하여 작업 완료 여부를 결정하는 함수입니다.
 * @param state - 현재 상태 객체
 * @returns 평가 결과가 포함된 새로운 상태 객체
 */
export async function evaluate(
  state: z.infer<typeof ecommerceSchema>,
): Promise<Partial<z.infer<typeof ecommerceSchema>>> {
  const lastResponse = state.messages[state.messages.length - 1].content;

  const systemMessage = `당신은 어시스턴트가 작업을 성공적으로 완료했는지 평가하는 평가자입니다.
  주어진 기준에 따라 어시스턴트의 마지막 응답을 평가하세요. 피드백과 함께 성공 기준 충족 여부, 
  그리고 사용자의 추가 입력이 필요한지에 대한 결정을 응답으로 보내주세요.`;

  let userMessage = `당신은 사용자와 어시스턴트 간의 대화를 평가하고 있습니다. 어시스턴트의 마지막 응답을 기반으로 다음에 수행할 작업을 결정합니다.
  
  사용자의 원래 요청과 모든 응답을 포함한 전체 대화 내용은 다음과 같습니다:
  ${formatConversation(state.messages)}
  
  이 과제의 성공 기준은 다음과 같습니다:
  ${state.success_criteria}
  
  당신이 평가할 어시스턴트의 최종 응답은 다음과 같습니다:
  ${lastResponse}
  
  피드백과 함께 이 응답이 성공 기준을 충족하는지 결정하여 응답하세요.
  또한, 어시스턴트가 질문이 있거나, 명확한 설명이 필요하거나, 도움이 없이는 답변할 수 없는 상태로 보이는 경우 등 사용자의 추가 입력이 필요한지 결정하세요.`;

  if (state.feedback_on_work) {
    userMessage += `\n\n참고로, 어시스턴트의 이전 시도에 대해 다음과 같은 피드백을 제공했습니다: ${state.feedback_on_work}\n`;
    userMessage += "어시스턴트가 동일한 실수를 반복하는 경우, 사용자 입력이 필요하다고 응답하는 것을 고려하세요.";
  }

  const evaluatorMessages: BaseMessage[] = [
    new SystemMessage({ content: systemMessage }),
    new HumanMessage({ content: userMessage }),
  ];

  try {
    const evalResult = await evaluator.invoke({ messages: evaluatorMessages }, config);

    const newMessages: AIMessage[] = [
      new AIMessage({ content: `평가자 피드백: ${evalResult.structuredResponse.feedback}` }),
    ];

    const newState: Partial<z.infer<typeof ecommerceSchema>> = {
      ...state,
      messages: newMessages,
      feedback_on_work: evalResult.structuredResponse.feedback,
      success_criteria_met: evalResult.structuredResponse.success_criteria_met,
      user_input_needed: evalResult.structuredResponse.user_input_needed,
    };

    return newState;
  } catch (error) {
    console.error("평가자 실행 중 오류 발생:", error);
    // 오류 발생 시 기본 상태 반환 또는 오류 처리
    const newState: Partial<z.infer<typeof ecommerceSchema>> = {
      messages: [new SystemMessage({ content: "평가 중 오류가 발생했습니다." })],
      user_input_needed: true, // 오류 발생 시 사용자 입력이 필요하다고 가정
    };
    return newState;
  }
}
