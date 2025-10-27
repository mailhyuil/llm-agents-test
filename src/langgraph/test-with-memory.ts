import { AIMessage, HumanMessage } from "@langchain/core/messages";
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
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

async function callModel(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

/*#### 2. Start the Graph Builder ####*/
const workflow = new StateGraph(MessagesAnnotation)
  /*#### 3. Create a Node ####*/
  .addNode("agent", callModel)
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
