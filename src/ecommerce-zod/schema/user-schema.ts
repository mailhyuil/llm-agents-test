import z from "zod";

export const userSchema = z
  .object({
    id: z.string().describe("사용자 ID입니다."),
    name: z.string().describe("사용자 이름입니다."),
    email: z.string().describe("사용자 이메일입니다."),
    address: z.string().describe("사용자 주소입니다."),
    phone: z.string().describe("사용자 전화번호입니다."),
    paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]).describe("사용자 결제 방법입니다."),
    cart: z.array(z.object({ id: z.number(), name: z.string(), price: z.number() })).describe("사용자 장바구니입니다."),
  })
  .describe("사용자 정보입니다.");
export type UserType = z.infer<typeof userSchema>;
