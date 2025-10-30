import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { tool } from "langchain";
import z from "zod";
import { ask } from "../helpers/ask";
const inputUserDataSchema = z.object({});
export const inputUserData = async (_: z.infer<typeof inputUserDataSchema>, config: LangGraphRunnableConfig) => {
  const user = config.context?.user;
  if (!user) throw new Error("User not found");
  if (!user.cart) {
    console.log("장바구니가 비어있습니다.");
    return {
      status: "error",
      message: "장바구니가 비어있습니다.",
    };
  }
  if (!user.name) {
    const name = await ask("이름을 입력해주세요 : ");
    if (!name) {
      return {
        status: "error",
        message: "이름을 입력해주세요.",
      };
    }
    user.name = name;
  }
  if (!user.email) {
    const email = await askAndValidate("이메일을 입력해주세요 : ", z.email("이메일 형식이 잘못됨"));
    if (typeof email === "string") {
      user.email = email;
    } else
      return {
        status: "error",
        message: "이메일 형식이 잘못됨",
      };
  }
  if (!user.paymentMethod) {
    const paymentMethod = await askAndValidate(
      "결제 방법을 선택해주세요 [credit card / paypal / bank transfer] : ",
      z.enum(["credit card", "paypal", "bank transfer"]),
    );

    if (typeof paymentMethod === "string") {
      user.paymentMethod = paymentMethod as "credit_card" | "paypal" | "bank_transfer";
    } else
      return {
        status: "error",
        message: "결제 방법을 선택해주세요.",
      };
  }
  if (!user.address) {
    const address = await askAndValidate(
      "배송지를 입력해주세요 (ex: 서울시...) : ",
      z.string().describe("배송지를 입력해주세요"),
    );
    if (typeof address === "string") {
      user.address = address;
    } else
      return {
        status: "error",
        message: "배송지를 입력해주세요.",
      };
  }
  if (!user.phone) {
    const phone = await askAndValidate(
      "전화번호를 입력해주세요 (ex: 010-1234-5678) : ",
      z.string().regex(/^010-\d{4}-\d{4}$/, "전화번호 형식이 잘못됨"),
    );
    if (typeof phone === "string") {
      user.phone = phone;
    } else
      return {
        status: "error",
        message: "전화번호를 입력해주세요.",
      };
  }
  return {
    status: "success",
    message: "결제 프로세스가 완료되었습니다.",
    user,
  };
};
export const inputUserDataTool = tool(inputUserData, {
  name: "input-user-data",
  description: "input name, email, paymentMethod, address from user and return user",
  schema: inputUserDataSchema,
});

async function askAndValidate(prompt: string, schema: z.ZodTypeAny) {
  while (true) {
    const input = await ask(prompt);
    if (!input) {
      console.log("❌ 입력이 필요합니다.");
      continue;
    }

    const res = schema.safeParse(input);
    if (!res.success) {
      console.log(`❌ ${res.error.issues[0].message}`);
      continue;
    }

    return res.data; // 유효하면 반환
  }
}
