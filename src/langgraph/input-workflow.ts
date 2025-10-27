import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Command, MemorySaver, MessagesAnnotation, StateGraph, interrupt } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { pushTool } from "./helpers/push";

/** ---- 0) Tools & Model ---- **/
const tools = [pushTool];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

/** ---- 1) Routing ---- **/
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  console.log("shouldContinue");
  const last = messages[messages.length - 1] as AIMessage;
  if (last.tool_calls?.length) return "tools";
  return "__end__";
}

/** ---- 2) Model call ---- **/
async function callModel(state: typeof MessagesAnnotation.State) {
  console.log("callModel");
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

/** ---- 3) 사용자 입력 2번을 요구 + 입력값으로 pushTool 실행 ---- **/
const nodeWithInterrupts = async (_state: typeof MessagesAnnotation.State) => {
  console.log("nodeWithInterrupts");
  // 1차 중단: name 입력 대기
  const name = interrupt({ prompt: "input your name" });
  // 2차 중단: email 입력 대기
  const email = interrupt({ prompt: "input your email" });
  return {
    messages: [
      new AIMessage({
        content: `✅ push done for ${String(name)} <${String(email)}>}`,
      }),
    ],
  };
};

/** ---- 4) 그래프 빌드 ---- **/
const checkpointer = new MemorySaver(); // 재개를 위해 필수
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("input", nodeWithInterrupts) // 사용자 입력 2번 받는 노드
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "input") // 시작 → 입력 대기 노드
  .addEdge("input", "agent") // 입력을 마치면 에이전트로
  .addEdge("tools", "agent") // shouldContinue 함수에 따라 툴 노드 또는 종료 노드로 이동
  .addConditionalEdges("agent", shouldContinue); // 에이전트 실행 후 툴 실행 여부에 따라 툴 노드 또는 종료 노드로 이동

const app = workflow.compile({ checkpointer });

/** ---- 5) 터미널에서 입력 받아 재개하기 ---- **/
const thread_id = "demo-" + Math.random().toString(36).slice(2);

// 터미널 입력 헬퍼
const rl = createInterface({ input, output });
const ask = (q: string) => rl.question(q);

async function work(message: string) {
  // 1) 최초 실행 → awaits 노드에서 interrupt(1)에서 멈춤
  for await (const _ of await app.stream({ messages: [new HumanMessage(message)] }, { configurable: { thread_id } })) {
    if (_.agent) {
      console.log(_.agent.messages[_.agent.messages.length - 1].content);
    }
  }

  // 2) 첫 재개(name)
  const name = await ask("📝 name: ");
  for await (const _ of await app.stream(new Command({ resume: name }), { configurable: { thread_id } })) {
  }

  // 3) 두 번째 재개(email)
  const email = await ask("📧 email: ");
  for await (const _ of await app.stream(new Command({ resume: email }), { configurable: { thread_id } })) {
  }

  rl.close();

  // 4) 최종 상태 출력
  const finalState = await app.getState({ configurable: { thread_id } });
  const last = finalState.values.messages[finalState.values.messages.length - 1] as AIMessage;
  console.log("\n=== FINAL ===\n" + last.content + "\n");
}

function main() {
  work("Would you push a notification to the user?");
}
main();
