import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { acronyms } from "./acronyms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const PASSCODE = process.env.PASSCODE || "secplus";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

// --- Auth helpers ---

function base64url(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function createJWT(): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    }),
  );
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${sig}`;
}

function verifyJWT(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, sig] = parts;
  const expected = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  if (sig !== expected) return false;

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  return decoded.exp > Date.now() / 1000;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ") || !verifyJWT(auth.slice(7))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// --- Routes ---

app.post("/api/login", (req, res) => {
  if (req.body?.passcode !== PASSCODE) {
    res.status(401).json({ error: "Invalid passcode" });
    return;
  }
  res.json({ token: createJWT() });
});

app.get("/api/quiz", requireAuth, (req, res) => {
  const count = Math.min(Number(req.query.count) || 20, acronyms.length);
  const category = req.query.category as string | undefined;
  const mode = (req.query.mode as string) || "acronym";

  const pool =
    category && category !== "all" ? acronyms.filter((a) => a.category === category) : acronyms;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  if (mode === "term-match") {
    const questions = selected.map((correct) => {
      const wrong = acronyms
        .filter((a) => a.acronym !== correct.acronym)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [correct, ...wrong]
        .map((a) => ({ acronym: a.acronym, meaning: a.meaning }))
        .sort(() => Math.random() - 0.5);

      return {
        explanation: correct.explanation,
        category: correct.category,
        correctAcronym: correct.acronym,
        correctMeaning: correct.meaning,
        options,
      };
    });

    res.json(questions);
    return;
  }

  const questions = selected.map((correct) => {
    const options = [correct.meaning, ...correct.distractors].sort(() => Math.random() - 0.5);

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

app.get("/api/categories", requireAuth, (_req, res) => {
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
