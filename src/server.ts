import express from "express";
import path from "path";
import { acronyms } from "./acronyms";

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));

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

app.listen(PORT, () => {
  console.log(`Study helper running at http://localhost:${PORT}`);
});
