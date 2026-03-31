import { acronyms } from "./acronyms.js";

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/quiz") {
      return handleQuiz(url);
    }

    if (url.pathname === "/api/categories") {
      return handleCategories();
    }

    // Everything else: static assets (with SPA fallback via wrangler config)
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

function handleQuiz(url: URL): Response {
  const count = Math.min(Number(url.searchParams.get("count")) || 20, acronyms.length);
  const category = url.searchParams.get("category") || undefined;

  const pool =
    category && category !== "all"
      ? acronyms.filter((a) => a.category === category)
      : acronyms;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const questions = selected.map((correct) => ({
    acronym: correct.acronym,
    category: correct.category,
    correctAnswer: correct.meaning,
    explanation: correct.explanation,
    options: [correct.meaning, ...correct.distractors].sort(() => Math.random() - 0.5),
  }));

  return Response.json(questions);
}

function handleCategories(): Response {
  const categories = [...new Set(acronyms.map((a) => a.category))].sort();
  return Response.json(categories);
}
