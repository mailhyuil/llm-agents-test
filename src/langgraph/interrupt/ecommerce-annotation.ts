import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { CartItem } from "./cart";

export const EcommerceAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  shippingAddress: Annotation<string>({
    default: () => "",
    reducer: (state, value) => {
      return value;
    },
  }),
  paymentMethod: Annotation<string>({
    default: () => "",
    reducer: (state, value) => {
      return value;
    },
  }),
  isConfirmed: Annotation<boolean>({
    default: () => false,
    reducer: (state, value) => {
      return value;
    },
  }),
  cart: Annotation<CartItem[]>({
    default: () => [],
    reducer: (state, value) => {
      return value;
    },
  }),
});
