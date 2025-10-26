import { chat } from "./helpers/chat";

async function main() {
  const { history } = await chat(`Please record following
  user: 유상백
  email: mailhyuil@gmail.com
  notes: 유상백님은 AI Agent 개발자입니다.`);
  console.log(history);
}

main();
