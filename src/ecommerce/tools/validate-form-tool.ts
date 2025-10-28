import { tool } from "@langchain/core/tools";
import { User, userSchema } from "../dto/user";
import { ask } from "../helpers/ask";

export const validateForm = async (user: User) => {
  console.log("validateForm");
  if (!user.cart) {
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
    const email = await ask("이메일을 입력해주세요 : ");
    if (!email) {
      return {
        status: "error",
        message: "이메일을 입력해주세요.",
      };
    }
    user.email = email;
  }
  if (!user.paymentMethod) {
    const paymentMethod = await ask("결제 방법을 선택해주세요 [credit card / paypal / bank transfer] : ");
    if (!paymentMethod) {
      return {
        status: "error",
        message: "결제 방법을 선택해주세요.",
      };
    }
    user.paymentMethod = paymentMethod;
  }
  if (!user.address) {
    const address = await ask("배송지를 입력해주세요 (ex: 서울시...) : ");
    if (!address) {
      return {
        status: "error",
        message: "배송지를 입력해주세요.",
      };
    }
    user.address = address;
  }
  return {
    status: "success",
    message: "결제 프로세스가 완료되었습니다.",
    user,
  };
};
export const validateFormTool = tool(validateForm, {
  name: "validate-form-tool",
  description: "입력된 정보를 검증하고 필요한 정보를 입력으로 받습니다.",
  schema: userSchema,
});
