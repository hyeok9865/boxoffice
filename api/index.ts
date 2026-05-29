import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "443053acefeb89b06086f94ac71c730e";

// Lazy-loaded Gemini client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// CORS and JSON middleware
app.use(express.json());

// API Router
app.get("/api/boxoffice", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string" || !/^\d{8}$/.test(date)) {
      res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
      return;
    }

    const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from KOBIS: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching box office:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.get("/api/movie", async (req, res) => {
  try {
    const { movieCd } = req.query;
    if (!movieCd || typeof movieCd !== "string") {
      res.status(400).json({ error: "movieCd parameter is required." });
      return;
    }

    const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// AI Review Generation Endpoint (Gemini 3.5-flash)
app.post("/api/review", async (req, res) => {
  try {
    const { movieNm, genres, keywords } = req.body;
    
    if (!movieNm || typeof movieNm !== "string") {
      res.status(400).json({ error: "movieNm parameter is required and must be a string." });
      return;
    }
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      res.status(400).json({ error: "keywords parameter is required and must be a non-empty array." });
      return;
    }

    const cleanKeywords = keywords.map(k => String(k).trim()).filter(Boolean);
    if (cleanKeywords.length === 0) {
      res.status(400).json({ error: "At least one non-empty keyword is required." });
      return;
    }

    // Initialize client securely on-demand
    const ai = getGeminiClient();

    const genreText = genres && Array.isArray(genres) ? genres.join(", ") : (genres || "기타");
    const keywordsText = cleanKeywords.map(k => `#${k}`).join(" ");

    const prompt = `영화 제목: "${movieNm}"
장르: ${genreText}
사용자가 입력한 키워드 3개: [${cleanKeywords.join(", ")}]

위 세부 정보와 키워드들을 자연스럽게 활용하여 매력적이고 공감 가는 3~4줄 내외의 개인적인 한 줄 정리 영화 감상평(리뷰)을 작성해주세요.
- 키워드(${cleanKeywords.join(", ")})가 리뷰 텍스트 안에 자연스럽게 스며들어야 합니다.
- 지나치게 로봇 같지 않고, 마치 SNS에 남기는 따뜻하고 트렌디한 어조를 기본으로 합니다.
- 리뷰 하단에 관련 어울리는 해시태그들도 함께 출력해주세요 (예: #영화추천 #영화리뷰 ${keywordsText}).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "당신은 매력적이고 섬세하며 대중적인 한글 영화 평론가이자 영화 마니아 블로거입니다. 부드럽고 설득력 있는 문체로 읽는 사람의 마음을 사로잡는 영화 감상평을 작성합니다.",
        temperature: 0.8,
      }
    });

    res.json({ review: response.text });
  } catch (error: any) {
    console.error("Error generating review:", error);
    res.status(500).json({ error: error.message || "감상평 생성 도중 예기치 않은 오류가 발생했습니다." });
  }
});

export default app;
