import { acronyms } from "../acronyms.js";

interface Env {}

export const onRequestGet: PagesFunction<Env> = async () => {
  const categories = [...new Set(acronyms.map((a) => a.category))].sort();

  return new Response(JSON.stringify(categories), {
    headers: { "Content-Type": "application/json" },
  });
};
