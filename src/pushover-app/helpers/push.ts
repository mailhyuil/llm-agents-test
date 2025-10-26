import dotenv from "dotenv";

dotenv.config();
const pushoverToken = process.env.PUSHOVER_TOKEN;
const pushoverUser = process.env.PUSHOVER_USER;
const pushoverEndpoint = "https://api.pushover.net/1/messages.json";

export async function push(message: string) {
  console.log(`Push: ${message}`);

  if (!pushoverToken || !pushoverUser) {
    console.error("Pushover 토큰 또는 사용자 ID가 설정되지 않았습니다.");
    return;
  }

  const payload = {
    user: pushoverUser,
    token: pushoverToken,
    message,
  };

  try {
    const res = await fetch(pushoverEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    console.log(json);

    if (json.status === 1) {
      console.log("푸시 알림이 성공적으로 전송되었습니다!");
    } else {
      console.error("푸시 알림 전송 실패:", json.errors);
    }
  } catch (error) {
    console.error("푸시 알림 전송 중 오류 발생:", error);
  }
}
