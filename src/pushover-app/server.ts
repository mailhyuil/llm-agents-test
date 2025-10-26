import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { chat } from "../pushover/helpers/chat.js";
import { readPdf, readTextFile } from "./helpers/pdfReader.js";

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

// multer 설정 (파일 업로드용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// 정적 파일 서빙을 위한 public 디렉토리 생성
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}

// HTML 파일 생성
const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Conversation - 유상백</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .chat-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            height: 400px;
            overflow-y: auto;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #fafafa;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
        }
        .user-message {
            background-color: #007bff;
            color: white;
            margin-left: 20%;
        }
        .assistant-message {
            background-color: #e9ecef;
            color: #333;
            margin-right: 20%;
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        input[type="text"] {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
        }
        button {
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Career Conversation - 유상백</h1>
        <div id="chatContainer" class="chat-container">
            <div class="message assistant-message">
                안녕하세요! 저는 유상백입니다. 제 경력, 배경, 기술과 경험에 대해 궁금한 것이 있으시면 언제든지 물어보세요!
            </div>
        </div>
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="메시지를 입력하세요..." />
            <button id="sendButton">전송</button>
        </div>
    </div>

    <script>
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        let history = [];

        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
            messageDiv.textContent = content;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, true);
            messageInput.value = '';
            sendButton.disabled = true;
            sendButton.textContent = '전송 중...';

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, history })
                });

                const data = await response.json();
                addMessage(data.text);
                history = data.history;
            } catch (error) {
                addMessage('죄송합니다. 오류가 발생했습니다.');
                console.error('Error:', error);
            } finally {
                sendButton.disabled = false;
                sendButton.textContent = '전송';
            }
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
`;

// HTML 파일 저장
fs.writeFileSync("./public/index.html", htmlContent);

// 채팅 엔드포인트
app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "메시지가 필요합니다." });
    }

    const result = await chat(message, history);
    res.json(result);
  } catch (error) {
    console.error("채팅 오류:", error);
    res.status(500).json({ error: "채팅 처리 중 오류가 발생했습니다." });
  }
});

// 파일 업로드 엔드포인트 (PDF 및 텍스트 파일)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let content = "";

    if (fileExtension === ".pdf") {
      content = await readPdf(filePath);
    } else if (fileExtension === ".txt") {
      content = await readTextFile(filePath);
    } else {
      return res.status(400).json({ error: "지원하지 않는 파일 형식입니다. PDF 또는 TXT 파일을 업로드해주세요." });
    }

    // 파일 삭제 (보안상 이유로)
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      content: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""),
      fullLength: content.length,
    });
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    res.status(500).json({ error: "파일 처리 중 오류가 발생했습니다." });
  }
});

// 루트 경로에서 HTML 파일 서빙
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/pushover-app/public/index.html"));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`브라우저에서 http://localhost:${PORT} 를 열어보세요.`);
});
