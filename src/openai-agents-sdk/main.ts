import { Agent, run, withTrace } from "@openai/agents";
import dotenv from "dotenv";
dotenv.config();
const instructions1 = `You are a sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write professional, serious cold emails.`;

const instructions2 = `You are a humorous, engaging sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write witty, engaging cold emails that are likely to get a response.`;

const instructions3 = `You are a busy sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write concise, to the point cold emails.`;

const agent1 = new Agent({
  name: "Professional Sales Agent",
  instructions: instructions1,
  model: "gpt-4o-mini",
});
const agent2 = new Agent({
  name: "Engaging Sales Agent",
  instructions: instructions2,
  model: "gpt-4o-mini",
});
const agent3 = new Agent({
  name: "Busy Sales Agent",
  instructions: instructions3,
  model: "gpt-4o-mini",
});

async function main() {
  const message = "Write a cold sales email";
  await withTrace("Joke workflow", async () => {
    const results = await Promise.all([run(agent1, message), run(agent2, message), run(agent3, message)]);
    const texts = results.map(result => result.finalOutput).filter(text => text !== undefined);
    console.log(texts);
  });
}
main();
