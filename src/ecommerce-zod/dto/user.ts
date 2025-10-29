import { UserType } from "../schema/user-schema";
import { cart } from "./cart";

export const user: UserType = {
  id: "1",
  name: "",
  email: "",
  address: "",
  phone: "",
  paymentMethod: "credit_card",
  cart,
};
