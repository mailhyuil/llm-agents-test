import z from "zod";

export type CartItem = {
  id: number;
  name: string;
  price: number;
};
export const cartItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
});
export const cart: z.TypeOf<typeof cartItemSchema>[] = [
  { id: 1, name: "아이폰 17", price: 1_200_000 },
  { id: 2, name: "고양이 사료", price: 10_000 },
  { id: 3, name: "홈런볼", price: 1_000 },
];
