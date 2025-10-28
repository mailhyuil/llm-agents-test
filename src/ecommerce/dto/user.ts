import z from "zod";
import { cart, CartItem } from "./cart";
export type User = {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  paymentMethod: string;
  cart: CartItem[];
};
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  address: z.string(),
  phone: z.string(),
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]),
  cart: z.array(z.object({ id: z.number(), name: z.string(), price: z.number() })),
});
export const user: User = {
  id: "1",
  name: "",
  email: "",
  address: "",
  phone: "",
  paymentMethod: "",
  cart,
};
