import { Agent, OpenAIChatCompletionsModel, OutputGuardrail, run, withTrace } from "@openai/agents";
import dotenv from "dotenv";
import OpenAI from "openai";
import z from "zod";
import { push } from "../pushover/helpers/push";
dotenv.config();

const geminiClient = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
});

const geminiModel = new OpenAIChatCompletionsModel(geminiClient, "gemini-2.5-flash");
const GreetingOutput = z.object({
  massage: z.string(),
  charmingRating: z.number().min(0).max(10),
  isGreeting: z.boolean(),
});
const geminiAgent = new Agent({
  name: "Professional Agent",
  instructions: `greet the user`,
  model: geminiModel,
  outputType: GreetingOutput,
});
const mathGuardrail: OutputGuardrail<typeof GreetingOutput> = {
  name: "Greeting Guardrail",
  async execute({ agentOutput, context }) {
    const result = await run(geminiAgent, agentOutput.response, {
      context,
    });
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isGreeting ?? false,
    };
  },
};
async function main() {
  const message = "안녕하세요 유휴일입니다. 저는 5살이고 제 이메일은 mailhyuil@gmail.com 입니다.";
  await withTrace("greeting_workflow", async () => {
    const result = await run(geminiAgent, message);
    if (!result.finalOutput) {
      throw new Error("No output from Gemini agent");
    }
    push(result.finalOutput);
  });
}
main();
