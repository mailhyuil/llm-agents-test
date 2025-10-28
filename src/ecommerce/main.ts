import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Command, END, INTERRUPT, isInterrupted, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { EcommerceAnnotation } from "./annotations/ecommerce-annotation";
import { config } from "./config";
import { user } from "./dto/user";
import { ask } from "./helpers/ask";
import { tools } from "./models/worker";
import { callWorker } from "./nodes/call-worker";
import { confirm } from "./nodes/confirm";
import { evaluate } from "./nodes/evaluate";
import { routeBasedOnEvaluation } from "./routers/evaluator-router";
import { workerRouter } from "./routers/worker-router";
dotenv.config();

const workflow = new StateGraph(EcommerceAnnotation)
  .addNode("worker", callWorker)
  .addNode("tools", new ToolNode(tools))
  .addNode("evaluate", evaluate)
  .addNode("confirm", confirm, { ends: [END] })
  .addEdge(START, "worker")
  .addEdge("tools", "evaluate")
  .addConditionalEdges("evaluate", routeBasedOnEvaluation, { worker: "worker", confirm: "confirm" })
  .addConditionalEdges("worker", workerRouter, { tools: "tools", evaluate: "evaluate" });

const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

async function invokePaymentWorkflow(message: string) {
  const initialState: typeof EcommerceAnnotation.State = {
    status: "processing",
    success_criteria: `address, paymentMethod, name, email, phone 이 모두 입력되어야 합니다.
phone은 /^010-\d{4}-\d{4}$/ 정규식 형식으로 입력되어야 합니다.
paymentMethod는 credit card, paypal, bank transfer 중 하나로 입력되어야 합니다.
이메일은 이메일 형식으로 입력되어야 합니다.
`,
    feedback_on_work: "",
    success_criteria_met: false,
    user_input_needed: false,
    messages: [
      new SystemMessage(
        `당신은 전자상거래 결제 어시스턴트입니다. 도구를 사용하여 사용자의 결제 정보를 수집하고 처리합니다.

중요한 규칙:
1. 사용자가 결제를 요청했을 때, name, email, address, paymentMethod 중 하나라도 누락되면 반드시 "input-user-data"을 호출하세요.
2. 모든 정보가 완성되면 "payment-tool"을 호출하세요.
3. 절대로 사용자에게 직접 텍스트로 정보를 요청하지 마세요. 반드시 도구를 사용하세요.

사용 가능한 도구:
- input-user-data: 사용자 정보를 검증하고 누락된 정보를 요청합니다.
- payment: 결제를 처리합니다.

현재 사용자 정보:
- 이름: ${user.name}
- 이메일: ${user.email}
- 주소: ${user.address}
- 결제방법: ${user.paymentMethod}
`,
      ),
      new HumanMessage(message),
    ],
  };
  const result = await app.invoke(initialState, config);
  // confirm //
  if (isInterrupted(result)) {
    let res = "";
    while (true) {
      res = await ask(result[INTERRUPT][0].value as string);
      if (res === "예" || res === "아니오") {
        break;
      }
      console.log("예 또는 아니오를 입력해주세요.");
    }
    const result2 = await app.invoke(new Command({ resume: res }), config);
    console.log(result2.messages[result2.messages.length - 1].content);
  }
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
