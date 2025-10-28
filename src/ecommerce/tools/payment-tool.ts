import { tool } from "@langchain/core/tools";
import { User, userSchema } from "../dto/user";

export const payment = async (user: User) => {
  try {
    console.log("결제를 요청합니다.");
    console.log("결제가 완료되었습니다.");
    return {
      status: "success",
      message: "결제가 완료되었습니다.",
      user,
    };
  } catch (error) {
    return {
      status: "error",
      message: "결제에 실패했습니다.",
      user,
    };
  }
};
export const paymentTool = tool(payment, {
  name: "payment",
  description: "결제를 요청합니다.",
  schema: userSchema,
});
