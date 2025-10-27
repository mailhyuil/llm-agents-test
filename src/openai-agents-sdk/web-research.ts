import { Agent, fileSearchTool, webSearchTool } from "@openai/agents";

const agent = new Agent({
  name: "Travel assistant",
  tools: [
    webSearchTool({
      searchContextSize: "low",
    }),
    fileSearchTool("VS_ID"),
  ],
  modelSettings: {
    toolChoice: "required",
  },
});
