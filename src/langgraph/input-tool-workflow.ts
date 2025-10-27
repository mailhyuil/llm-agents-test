import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { inputDataTool } from "./helpers/input-data";
import { pushTool } from "./helpers/push";

/** ---- 0) Tools & Model ---- **/
const tools = [pushTool, inputDataTool];
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
async function callModel(state: typeof MessagesAnnotation.State): Promise<typeof MessagesAnnotation.State> {
  console.log("callModel");
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

/** ---- 4) 그래프 빌드 ---- **/
const checkpointer = new MemorySaver(); // 재개를 위해 필수
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent") // 시작 → 입력 대기 노드
  .addEdge("tools", "agent") // shouldContinue 함수에 따라 툴 노드 또는 종료 노드로 이동
  .addConditionalEdges("agent", shouldContinue); // 에이전트 실행 후 툴 실행 여부에 따라 툴 노드 또는 종료 노드로 이동

const app = workflow.compile({ checkpointer });

/** ---- 5) 터미널에서 입력 받아 재개하기 ---- **/
const thread_id = "demo-" + Math.random().toString(36).slice(2);

const systemPrompt = `
You are an assistant that can use tools.

Your goal:
- If user asks to send a notification but name, email, or message is missing, 
  you MUST call the tool "input-data-tool" to ask the user for that info.
- Once you have all of them, call the tool "push-tool" to send the notification.
- Do NOT ask the user directly in text. Use the tools.
`;

async function work(message: string) {
  for await (const _ of await app.stream(
    { messages: [new AIMessage(systemPrompt), new HumanMessage(message)] },
    { configurable: { thread_id } },
  )) {
    if (_.agent) {
      console.log(_.agent.messages[_.agent.messages.length - 1].content);
    }
  }
  const finalState = await app.getState({ configurable: { thread_id } });
  const values: typeof MessagesAnnotation.State = finalState.values;
  const last = values.messages[values.messages.length - 1];
  console.log("\n=== FINAL ===\n" + last.content + "\n");
}

function main() {
  work("Would you push a notification to the user?");
}
main();
