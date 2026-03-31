import { acronyms } from "../acronyms.js";

interface Env {}

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const count = Math.min(Number(url.searchParams.get("count")) || 20, acronyms.length);
  const category = url.searchParams.get("category") || undefined;

  const pool =
    category && category !== "all"
      ? acronyms.filter((a) => a.category === category)
      : acronyms;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const questions = selected.map((correct) => {
    const options = [correct.meaning, ...correct.distractors].sort(
      () => Math.random() - 0.5
    );

    return {
      acronym: correct.acronym,
      category: correct.category,
      correctAnswer: correct.meaning,
      explanation: correct.explanation,
      options,
    };
  });

  return new Response(JSON.stringify(questions), {
    headers: { "Content-Type": "application/json" },
  });
};
