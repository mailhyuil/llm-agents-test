import { HumanMessage } from "@langchain/core/messages";
import { Command, END, interrupt, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { ask } from "./ask";
import { cart } from "./cart";
import { EcommerceAnnotation } from "./ecommerce-annotation";
import { workerRouter } from "./routers";
dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
const getCartNode = async (state: typeof EcommerceAnnotation.State) => {
  if (cart.length <= 0) {
    console.log("장바구니가 비어있습니다.");
    return END;
  }
  console.log(`장바구니: ${cart.map(item => `${item.name} - ${item.price}`).join(", ")}`);
  return { ...state, cart };
};
const addressNode = async (state: typeof EcommerceAnnotation.State) => {
  if (!state.shippingAddress) {
    // 배송지가 없는 경우 사용자 입력을 기다린다
    interrupt("배송지를 입력해주세요 (ex: 서울시...)");
    const address = await ask("배송지를 입력해주세요 (ex: 서울시...)");
    return new Command({ resume: true, update: { shippingAddress: address } });
  }
  return state;
};
const paymentMethodNode = async (state: typeof EcommerceAnnotation.State) => {
  if (!state.paymentMethod) {
    interrupt("결제 방법을 선택해주세요 (ex: credit card, paypal, bank transfer)");
    const paymentMethod = await ask("결제 방법을 선택해주세요 (ex: credit card, paypal, bank transfer)");
    return new Command({ resume: true, update: { paymentMethod } });
  }
  return state;
};

const confirmNode = async (state: typeof EcommerceAnnotation.State) => {
  if (!state.isConfirmed) {
    const confirm = await interrupt("결제를 진행할까요? [yes/no]");
    if (confirm !== "yes") {
      console.log("결제를 취소했습니다.");
      return END;
    }
    console.log("결제를 진행합니다.");
    return { ...state, isConfirmed: true };
  }
  return state;
};

const completeNode = async (state: typeof EcommerceAnnotation.State) => {
  if (state.isConfirmed && state.shippingAddress && state.paymentMethod) {
    console.log(`결제가 완료되었습니다.
        배송지: ${state.shippingAddress}
        결제 방법: ${state.paymentMethod}
        장바구니: ${cart.map(item => `${item.name} - ${item.price}`).join(", ")}
        `);
    return END;
  }
  return "router";
};

async function worker(state: typeof EcommerceAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

const workflow = new StateGraph(EcommerceAnnotation)
  .addNode("worker", worker)
  .addNode("getCartNode", getCartNode)
  .addNode("addressNode", addressNode)
  .addNode("paymentMethodNode", paymentMethodNode)
  .addNode("confirmNode", confirmNode)
  .addNode("completeNode", completeNode)
  .addEdge(START, "worker")
  .addEdge("confirmNode", "completeNode")
  .addConditionalEdges("worker", workerRouter, {
    addressNode: "addressNode",
    paymentMethodNode: "paymentMethodNode",
    getCartNode: "getCartNode",
    confirmNode: "confirmNode",
  });

const checkpointer = new MemorySaver();
const threadId = "1234";
const app = workflow.compile({ checkpointer });

async function work() {
  const state: typeof EcommerceAnnotation.State = {
    shippingAddress: "",
    paymentMethod: "",
    isConfirmed: false,
    cart: [],
    messages: [new HumanMessage("결제해주세요.")],
  };
  const result = await app.invoke(state, { configurable: { thread_id: threadId } });
  console.log(result.messages[result.messages.length - 1].content);
}

function main() {
  work();
}

main();
