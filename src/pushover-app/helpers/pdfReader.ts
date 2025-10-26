import fs from "fs";
import pdf from "pdf-parse";

export async function readPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF 읽기 오류:", error);
    throw new Error("PDF 파일을 읽을 수 없습니다.");
  }
}

export async function readTextFile(filePath: string): Promise<string> {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("텍스트 파일 읽기 오류:", error);
    throw new Error("텍스트 파일을 읽을 수 없습니다.");
  }
}
