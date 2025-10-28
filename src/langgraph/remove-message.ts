import { AIMessage, HumanMessage, RemoveMessage, trimMessages } from "@langchain/core/messages";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();
// Create a model and give it access to the tools
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

/*#### 1. Define State Classes ####*/
function shouldContinue({ messages }: typeof MessagesAnnotation.State): string {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // 도구 호출이 있으면 도구 실행
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  // 메시지가 3개를 초과하면 트림 실행
  if (messages.length > 3) {
    return "trim";
  }

  // 일반적인 응답이면 종료
  return END;
}

async function callModel(state: typeof MessagesAnnotation.State): Promise<{ messages: AIMessage[] }> {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}
async function removeMessage(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  if (messages.length > 3) {
    return {
      messages: [
        new RemoveMessage({
          id: messages[0].id!, // 가장 처음 메시지를 제거
        }),
      ],
    };
  }
}
async function trimMessage(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  console.log("token count", await model.getNumTokens(messages.map(message => message.content).join("\n")));
  const trimmedMessages = await trimMessages(messages, {
    maxTokens: 10,
    strategy: "last",
    tokenCounter: model,
    includeSystem: true,
  });
  console.log(
    "trimmed token count",
    await model.getNumTokens(trimmedMessages.map(message => message.content).join("\n")),
  );
  return { messages: trimmedMessages };
}
/*#### 2. Start the Graph Builder ####*/
const workflow = new StateGraph(MessagesAnnotation)
  /*#### 3. Create a Node ####*/
  .addNode("agent", callModel)
  .addNode("trim", trimMessage)
  /*#### 4. Create Edges ####*/
  .addEdge(START, "agent") // __start__ is a special name for the entrypoint
  .addConditionalEdges("agent", shouldContinue);
const checkpointer = new MemorySaver();
const threadId = "demo-" + Math.random().toString(36).slice(2);
/*#### 5. Compile the Graph ####*/
const app = workflow.compile({ checkpointer });
const config = {
  configurable: {
    thread_id: threadId,
  },
};
/*#### 6. Use the Graph ####*/
async function work() {
  try {
    const first = await app.invoke(
      {
        messages: [new HumanMessage("hello i'm sangbaek")],
      },
      config,
    );
    console.log(first.messages[first.messages.length - 1].content);
    const second = await app.invoke(
      {
        messages: [new HumanMessage("what is my name?")],
      },
      config,
    );
    console.log(second.messages[second.messages.length - 1].content);
    const histories = app.getStateHistory(config);
    console.log("histories");
    for await (const state of histories) {
      if (state.values.messages[state.values.messages.length - 1]?.content) {
        console.log(state.values.messages[state.values.messages.length - 1].content);
      }
    }
    console.log("getState");
    const state = await app.getState(config);
    console.log(state.values.messages[state.values.messages.length - 1].content);
  } catch (error) {
    console.error(error);
    throw new Error("an error occurred while working");
  }
}

function main() {
  work();
}
main();
