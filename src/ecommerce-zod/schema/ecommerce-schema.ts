import { MessagesZodMeta } from "@langchain/langgraph";
import "@langchain/langgraph/zod";
import { registry } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import z from "zod";
export const ecommerceSchema = z.object({
  messages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta),
  status: z.enum(["processing", "canceled", "succeeded"]),
  success_criteria: z.string(),
  feedback_on_work: z.string(),
  success_criteria_met: z.boolean(),
  user_input_needed: z.boolean(),
});

export type EcommerceSchemaType = z.infer<typeof ecommerceSchema>;
