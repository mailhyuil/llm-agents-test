import { Command, END, interrupt } from "@langchain/langgraph";
import { EcommerceAnnotation } from "../ecommerce-annotation";

export const confirm = async (state: typeof EcommerceAnnotation.State) => {
  let res = "";
  while (true) {
    res = interrupt(`결제정보를 확인해주세요.
상품: ${state.user.cart.map(item => item.name).join(", ")}
결제방법: ${state.user.paymentMethod}
배송지: ${state.user.address}
결제금액: ${state.user.cart.reduce((acc, item) => acc + item.price, 0)}

결제를 진행하시겠습니까? (예/아니오)
`);
    if (res !== "예" && res !== "아니오") {
      console.log("예 또는 아니오를 입력해주세요.");
      continue;
    }
    break;
  }
  if (res === "예") {
    return new Command({
      goto: END,
      update: {
        status: "success",
        message: "결제가 완료되었습니다.",
      },
    });
  } else {
    return new Command({
      goto: END,
      update: {
        status: "error",
        message: "결제가 취소되었습니다.",
      },
    });
  }
};
