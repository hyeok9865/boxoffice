import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "443053acefeb89b06086f94ac71c730e";

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

// Serve frontend assets
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
