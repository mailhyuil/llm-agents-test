import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Command, END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { user } from "./dto/user";
import { EcommerceAnnotation } from "./ecommerce-annotation";
import { ask } from "./helpers/ask";
import { evaluator } from "./models/evaluator";
import { tools } from "./models/worker";
import { callWorker } from "./nodes/call-worker";
import { confirm } from "./nodes/confirm";
import { routeBasedOnEvaluation } from "./routers/evaluator-router";
import { workerRouter } from "./routers/worker-router";
dotenv.config();

const workflow = new StateGraph(EcommerceAnnotation)
  .addNode("worker", callWorker)
  .addNode("tools", new ToolNode(tools))
  .addNode("evaluator", evaluator)
  .addNode("confirm", confirm, { ends: [END] })
  .addEdge(START, "worker")
  .addEdge("tools", "worker")
  .addConditionalEdges("evaluator", routeBasedOnEvaluation, { worker: "worker", confirm: "confirm" })
  .addConditionalEdges("worker", workerRouter, { tools: "tools", evaluator: "evaluator" });

const checkpointer = new MemorySaver();
const threadId = "demo-" + Math.random().toString(36).slice(2);
const app = workflow.compile({ checkpointer });

async function invokePaymentWorkflow(message: string) {
  const initialState: typeof EcommerceAnnotation.State = {
    user: user,
    status: "processing",
    success_criteria: "address, paymentMethod, name, email 이 모두 입력되어야 합니다.",
    feedback_on_work: "",
    success_criteria_met: false,
    user_input_needed: false,
    messages: [
      new SystemMessage(
        `당신은 고객의 장바구니에 있는 물건을 결제해주는 어시스턴트입니다.
결제 프로세스는 다음과 같습니다.
1. 사용자가 결제를 요청하면 "validate-form-tool"을 실행하세요.
2. "validate-form-tool"의 결과를 evaluator에게 전달하세요.
3. evaluator의 결과를 확인하고 이상이 없다면 "payment-tool"을 실행하세요.`,
      ),
      new HumanMessage(message),
    ],
  };
  const result = await app.invoke(initialState, { configurable: { thread_id: threadId } });
  console.log(result.messages[result.messages.length - 1].content);
  // confirm
  const res = await ask();
  const result2 = await app.invoke(new Command({ resume: res }));
  console.log(result2.messages[result2.messages.length - 1].content);
}

async function main() {
  try {
    await invokePaymentWorkflow("결제해주세요");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
