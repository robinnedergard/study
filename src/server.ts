import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acronyms } from "./acronyms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve React build in production
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/api/quiz", (req, res) => {
  const count = Math.min(Number(req.query.count) || 20, acronyms.length);
  const category = req.query.category as string | undefined;

  const pool = category && category !== "all"
    ? acronyms.filter((a) => a.category === category)
    : acronyms;

  // Pick `count` random questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const questions = selected.map((correct) => {
    const options = [correct.meaning, ...correct.distractors]
      .sort(() => Math.random() - 0.5);

    return {
      acronym: correct.acronym,
      category: correct.category,
      correctAnswer: correct.meaning,
      explanation: correct.explanation,
      options,
    };
  });

  res.json(questions);
});

app.get("/api/categories", (_req, res) => {
  const categories = [...new Set(acronyms.map((a) => a.category))].sort();
  res.json(categories);
});

// SPA fallback for React Router (Express 5 syntax)
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Study helper running at http://localhost:${PORT}`);
});
