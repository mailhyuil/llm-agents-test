import dotenv from "dotenv";
import { chat } from "./helpers/chat.js";
// 환경 변수 로드
dotenv.config();

async function main() {
  try {
    console.log("Career Conversation 앱을 시작합니다...");

    console.log("서버를 시작합니다...");

    // 서버 시작
    await import("./server.js");
  } catch (error) {
    console.error("애플리케이션 시작 중 오류 발생:", error);
    process.exit(1);
  }
}

// 테스트 채팅 함수
async function testChat() {
  console.log("\\n=== 테스트 채팅 시작 ===");

  try {
    const result = await chat("안녕하세요! 유상백님의 경력에 대해 궁금합니다.", []);
    console.log("AI 응답:", result.text);
    console.log("채팅 히스토리:", result.history);
  } catch (error) {
    console.error("테스트 채팅 오류:", error);
  }
}

// 명령행 인수에 따라 다른 동작
const args = process.argv.slice(2);

if (args.includes("--test")) {
  testChat();
} else {
  main();
}
