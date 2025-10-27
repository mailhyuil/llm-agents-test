import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

// Create a model
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Define the agent function
async function callModel(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Define the conditional logic
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

// Create the workflow
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue);

// Initialize SQLite checkpointer (더 간단하고 안정적)
const checkpointer = new SqliteSaver("memory.db");
const threadId = "demo-" + Math.random().toString(36).slice(2);

// Compile the graph
const app = workflow.compile({ checkpointer });
const config = {
  configurable: {
    thread_id: threadId,
  },
};

// Main work function
async function work() {
  try {
    console.log("🚀 LangGraph SQLite 메모리 테스트 시작");
    console.log(`📝 Thread ID: ${threadId}`);
    
    // First message
    console.log("\n1️⃣ 첫 번째 메시지 전송...");
    const first = await app.invoke(
      {
        messages: [new HumanMessage("hello i'm sangbaek")],
      },
      config,
    );
    console.log("✅ 첫 번째 응답:", first.messages[first.messages.length - 1].content);
    
    // Second message (memory test)
    console.log("\n2️⃣ 두 번째 메시지 전송 (메모리 테스트)...");
    const second = await app.invoke(
      {
        messages: [new HumanMessage("what is my name?")],
      },
      config,
    );
    console.log("✅ 두 번째 응답:", second.messages[second.messages.length - 1].content);
    
    // Get conversation history
    console.log("\n📚 전체 대화 히스토리:");
    const histories = app.getStateHistory(config);
    let messageCount = 0;
    for await (const state of histories) {
      const lastMessage = state.values.messages[state.values.messages.length - 1];
      if (lastMessage?.content) {
        messageCount++;
        console.log(`  ${messageCount}. ${lastMessage.content}`);
      }
    }
    
    // Get current state
    console.log("\n🔍 현재 상태:");
    const state = await app.getState(config);
    console.log("✅ 최종 메시지:", state.values.messages[state.values.messages.length - 1].content);
    
    console.log("\n🎉 테스트 완료!");
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw new Error("an error occurred while working");
  }
}

// Main function
async function main() {
  try {
    await work();
  } catch (error) {
    console.error("메인 함수 오류:", error);
    process.exit(1);
  }
}

main();
