import { Command, END, interrupt, Runtime } from "@langchain/langgraph";
import { AIMessage } from "langchain";
import { ContextSchemaType } from "../schema/context-schema";
import { EcommerceSchemaType } from "../schema/ecommerce-schema";

export const confirm = async (state: EcommerceSchemaType, runtime: Runtime<ContextSchemaType>) => {
  const user = runtime.context?.user;
  if (!user) throw new Error("User not found");
  const res = interrupt(`결제정보를 확인해주세요.
상품: ${user.cart.map(item => item.name).join(", ")}
결제방법: ${user.paymentMethod}
배송지: ${user.address}
결제금액: ${user.cart.reduce((acc, item) => acc + item.price, 0)}

결제를 진행하시겠습니까? (예/아니오)`);

  if (res === "예") {
    return new Command({
      goto: "worker",
      update: {
        status: "success",
        messages: [new AIMessage({ content: "payment tool을 호출합니다." })],
      },
    });
  } else {
    return new Command({
      goto: END,
      update: {
        status: "error",
        messages: [new AIMessage({ content: "결제가 취소되었습니다." })],
      },
    });
  }
};
