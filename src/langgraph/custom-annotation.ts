import { HumanMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const MessagesWithUserInfoAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  userInfo: Annotation<{ name: string; email: string }>({
    default: () => ({ name: "", email: "" }),
    reducer: (state, value) => {
      const { name, email } = value;
      if (name && email) {
        return {
          name,
          email,
        };
      }
      return state;
    },
  }),
});

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

async function callLLM(state: typeof MessagesWithUserInfoAnnotation.State) {
  const { messages, userInfo } = state;
  const response = await model.invoke([
    ...messages,
    new HumanMessage(`name: ${userInfo.name}, email: ${userInfo.email}`),
  ]);
  return { messages: [response], userInfo: { name: userInfo.name, email: userInfo.email } };
}
