import z from "zod";
import { userSchema } from "./user-schema";

export const contextSchema = z.object({
  user: userSchema,
});

export type ContextSchemaType = z.infer<typeof contextSchema>;
