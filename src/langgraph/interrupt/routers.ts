import { EcommerceAnnotation } from "./ecommerce-annotation";

export const workerRouter = async (state: typeof EcommerceAnnotation.State) => {
  if (state.cart.length <= 0) {
    return "getCartNode";
  }
  if (!state.shippingAddress) {
    return "addressNode";
  }
  if (!state.paymentMethod) {
    return "paymentMethodNode";
  }
  return "confirmNode";
};
