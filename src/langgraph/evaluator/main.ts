import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { inputDataTool } from "../helpers/input-data";
import { pushTool } from "../helpers/push";
import { EvaluatorAnnotation } from "./annotation";
import { evaluator } from "./evaluator";
dotenv.config();
const tools = [pushTool, inputDataTool];
// Create a model and give it access to the tools
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

/*#### 1. Define State Classes ####*/
function workerRouter({ messages }: typeof EvaluatorAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "evaluator";
}

/**
 * 워커 노드에서 툴 및 성공 조건을 참고하여 LLM 호출을 담당하는 함수입니다.
 * @param state - CustomAnnotation.State 타입의 상태 객체
 * @returns 업데이트된 메시지 배열을 포함하는 Partial 상태 객체
 */
async function worker(state: typeof EvaluatorAnnotation.State): Promise<Partial<typeof EvaluatorAnnotation.State>> {
  // 시스템 메시지 작성
  let systemMessage = `당신은 도구(tool)를 활용해 작업을 완료하는 도움이 되는 어시스턴트입니다.
과제의 성공 기준이 만족되거나, 사용자에게 추가 질문/명확화가 필요할 때까지 계속 작업을 진행합니다.
다음은 성공 기준입니다:
${state.success_criteria}
이 과제와 관련해, 사용자에게 추가 질문이 있을 경우에는 명확하게 질문을 작성해서 답변하고,
완전히 해결했다면 바로 최종 답변을 해주세요. 예시:
질문: 요약이 필요한지, 상세 답이 필요한지 명확히 해주세요.

작업이 끝났다면, 질문을 하지 말고 최종 답변만 보내세요.
`;

  // 피드백이 존재하는 경우 시스템 메시지에 추가
  if (state.feedback_on_work) {
    systemMessage += `
이전에 작업을 완료했다고 판단했으나, 성공 기준이 충족되지 않아 반려되었습니다.
반려 사유 피드백:
${state.feedback_on_work}
피드백을 참고하여, 성공 기준을 충족하거나 사용자에게 질문이 있다면 질문을 작성해 주세요.
`;
  }

  // 메시지 배열 복사 및 시스템 메시지 삽입
  let foundSystemMessage = false;
  const messages: BaseMessage[] = state.messages.map(msg => {
    if (msg instanceof SystemMessage) {
      foundSystemMessage = true;
      // SystemMessage의 내용을 새로운 systemMessage로 교체
      return new SystemMessage({ content: systemMessage });
    }
    return msg;
  });

  if (!foundSystemMessage) {
    messages.unshift(new SystemMessage({ content: systemMessage }));
  }

  try {
    // LLM에 툴 포함하여 호출
    const response = await model.invoke(messages);

    return {
      messages: [response],
    };
  } catch (error) {
    console.error("worker 실행 오류:", error);
    // 에러 발생 시 사용자 입력이 필요하도록 안내
    return {
      messages: [new SystemMessage({ content: "작업 처리 중 오류가 발생했습니다. 다시 시도해 주세요." })],
    };
  }
}
function routeBasedOnEvaluation(state: typeof EvaluatorAnnotation.State) {
  if (state.success_criteria_met || state.user_input_needed) {
    return END;
  } else {
    return "worker";
  }
}

/*#### 2. Start the Graph Builder ####*/
const workflow = new StateGraph(EvaluatorAnnotation)
  /*#### 3. Create a Node ####*/
  .addNode("worker", worker)
  .addNode("tools", new ToolNode(tools))
  .addNode("evaluator", evaluator)
  /*#### 4. Create Edges ####*/
  .addEdge(START, "worker") // __start__ is a special name for the entrypoint
  .addEdge("tools", "worker")
  .addConditionalEdges("evaluator", routeBasedOnEvaluation, { worker: "worker", [END]: END })
  .addConditionalEdges("worker", workerRouter, { tools: "tools", evaluator: "evaluator" });
/*#### 5. Compile the Graph ####*/
const app = workflow.compile();
const systemPrompt = `
You are an assistant that can use tools.

Your goal:
- If user asks to send a notification but name, email, or message is missing, 
  you MUST call the tool "input-data-tool" to ask the user for that info.
- Once you have all of them, call the tool "push-tool" to send the notification.
- Do NOT ask the user directly in text. Use the tools.
`;
/*#### 6. Use the Graph ####*/
async function work() {
  try {
    const task =
      "사용자에게 '이름', '이메일', '추가 메세지'를 물어보고 오후 3시에 미팅이 있다고 푸시 알림을 보내주세요.";
    const success_criteria =
      "푸시 알림이 성공적으로 전송되어야 합니다. 알림 메시지에는 사용자의 '이름', '이메일'과 '추가 메세지'가 반드시 포함되어야 합니다. 또한 '미팅'과 '오후 3시'라는 단어가 반드시 포함되어야 합니다.";

    console.log("--- 테스트 시작: 푸시 알림 전송 ---");
    console.log(`요청: ${task}`);
    console.log(`성공 기준: ${success_criteria}\n`);

    const stream = await app.stream(
      {
        messages: [new SystemMessage(systemPrompt), new HumanMessage(task)],
        success_criteria: success_criteria,
      },
      {
        // To see all intermediate steps
        streamMode: "values",
      },
    );

    for await (const step of stream) {
      console.log("--- 중간 상태 ---");
      console.log(step.messages[step.messages.length - 1].content);
      console.log(step.success_criteria);
      console.log(step.feedback_on_work);
      console.log(step.success_criteria_met);
      console.log(step.user_input_needed);
      console.log("-----------------\n");
    }
  } catch (error) {
    console.error("작업 실행 중 오류가 발생했습니다:", error);
  }
}

function main() {
  work();
}
main();
