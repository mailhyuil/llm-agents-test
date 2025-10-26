import { openai } from "@ai-sdk/openai";
import { generateText, tool, ToolSet } from "ai";
import z from "zod";
import { readPdf, readTextFile } from "./pdfReader.js";
import { recordUnknownQuestion } from "./recordUnknownQuestion.js";
import { recordUserDetails } from "./recordUserDetails.js";

const recordUserDetailsTool = tool({
  name: "recordUserDetails",
  description: "Record user details",
  inputSchema: z.object({
    email: z.string(),
    name: z.string().optional(),
    notes: z.string().optional(),
  }),
  outputSchema: z.object({
    recorded: z.literal("ok"),
  }),
  execute: async ({ email, name, notes }) => {
    return await recordUserDetails(email, name, notes);
  },
});
const recordUnknownQuestionTool = tool({
  name: "recordUnknownQuestion",
  description: "Record unknown question",
  inputSchema: z.object({
    question: z.string(),
  }),
  outputSchema: z.object({
    recorded: z.literal("ok"),
  }),
  execute: async ({ question }) => {
    return await recordUnknownQuestion(question);
  },
});
const tools: ToolSet = {
  recordUserDetails: recordUserDetailsTool,
  recordUnknownQuestion: recordUnknownQuestionTool,
};
async function createSystemPrompt() {
  const name = "유상백";

  let linkedinContent = "";
  let summaryContent = "";

  try {
    // LinkedIn PDF 읽기
    linkedinContent = await readPdf(`${process.cwd()}/src/pushover-app/me/linkedin.pdf`);
    console.log("LinkedIn PDF를 성공적으로 읽었습니다.");
  } catch (error) {
    console.log("LinkedIn PDF 파일을 찾을 수 없습니다. 기본 설정으로 진행합니다.");
  }

  try {
    // 요약 텍스트 파일 읽기
    summaryContent = await readTextFile("src/pushover-app/me/summary.txt");
    console.log("요약 파일을 성공적으로 읽었습니다.");
  } catch (error) {
    console.log("요약 파일을 찾을 수 없습니다. 기본 설정으로 진행합니다.");
  }

  console.log("시스템 프롬프트가 설정되었습니다.");
  // 시스템 프롬프트 생성
  const systemPrompt = `You are acting as ${name}. You are answering questions on ${name}'s website, \
    particularly questions related to ${name}'s career, background, skills and experience. \
    Your responsibility is to represent ${name} for interactions on the website as faithfully as possible. \
    You are given a summary of ${name}'s background and LinkedIn profile which you can use to answer questions. \
    Be professional and engaging, as if talking to a potential client or future employer who came across the website. \
    If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career. \
    If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your record_user_details tool. 

    ## Summary:
    ${summaryContent}

    ## LinkedIn Profile:
    ${linkedinContent}

    With this context, please chat with the user, always staying in character as ${name}.`;
  return systemPrompt;
}
const systemPrompt = await createSystemPrompt();

export async function chat(message: string, history: { role: "user" | "assistant"; content: string }[] = []) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    tools,
    prompt: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
  });
  console.log(text);
  return {
    text,
    history: [...history, { role: "user", content: message }, { role: "assistant", content: text }],
  };
}
