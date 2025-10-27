import { AIMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { pushTool } from "./helpers/push";

// Define the tools for the agent to use
const tools = [pushTool];

// Create a model and give it access to the tools
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

/*#### 1. Define State Classes ####*/
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

const toolNode = new ToolNode(tools);

/*#### 2. Start the Graph Builder ####*/
const workflow = new StateGraph(MessagesAnnotation)
  /*#### 3. Create a Node ####*/
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  /*#### 4. Create Edges ####*/
  .addEdge(START, "agent") // __start__ is a special name for the entrypoint
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

/*#### 5. Compile the Graph ####*/
const app = workflow.compile();

/*#### 6. Use the Graph ####*/
