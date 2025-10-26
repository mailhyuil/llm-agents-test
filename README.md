# Career Conversation - AI Agent

이 프로젝트는 4_lab4.ipynb의 Python 코드를 TypeScript로 포팅한 AI Agent 애플리케이션입니다. Vercel AI SDK와 OpenAI를 사용하여 구현되었습니다.

## 주요 기능

- 🤖 OpenAI GPT-4o-mini를 사용한 대화형 AI Agent
- 📱 Pushover API를 통한 실시간 알림
- 📄 PDF 및 텍스트 파일 업로드 및 처리
- 🌐 Express.js 기반 웹 서버
- 💬 실시간 채팅 인터페이스

## 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`env.example` 파일을 `.env`로 복사하고 필요한 값들을 설정하세요:

```bash
cp env.example .env
```

`.env` 파일에 다음 값들을 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
PUSHOVER_USER=your_pushover_user_key_here
PUSHOVER_TOKEN=your_pushover_token_here
PORT=3000
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

### 4. 프로덕션 빌드 및 실행

```bash
pnpm build
pnpm start
```

## 사용법

1. 브라우저에서 `http://localhost:3000`을 열어주세요
2. 채팅 인터페이스에서 AI와 대화할 수 있습니다
3. PDF나 텍스트 파일을 업로드하여 AI의 컨텍스트에 추가할 수 있습니다

## 프로젝트 구조

```
src/
├── pushover/
│   ├── helpers/
│   │   ├── chat.ts          # AI 채팅 로직
│   │   ├── push.ts          # Pushover 알림
│   │   ├── recordUserDetails.ts
│   │   └── recordUnknownQuestion.ts
│   └── main.ts
├── helpers/
│   └── pdfReader.ts         # PDF 및 텍스트 파일 읽기
├── app.ts                   # 메인 애플리케이션
└── server.ts                # Express 서버

me/
├── summary.txt              # 개인 요약 정보
└── linkedin.pdf            # LinkedIn 프로필 (선택사항)
```

## API 엔드포인트

- `POST /chat` - 채팅 메시지 전송
- `POST /upload` - 파일 업로드 (PDF, TXT)
- `GET /` - 웹 인터페이스

## 테스트

테스트 채팅을 실행하려면:

```bash
pnpm dev -- --test
```

## 원본 Python 코드와의 차이점

- Python의 Gradio 대신 Express.js와 HTML/CSS/JavaScript 사용
- Python의 pypdf 대신 pdf-parse 라이브러리 사용
- Vercel AI SDK를 사용하여 더 현대적인 AI 통합 구현
- TypeScript로 타입 안전성 확보

## 라이선스

ISC
