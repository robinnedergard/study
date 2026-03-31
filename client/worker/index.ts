import { acronyms } from "./acronyms.js";

interface Env {
  ASSETS: Fetcher;
  PASSCODE: string;
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/quiz") {
      const authError = await verifyAuth(request, env);
      if (authError) return authError;
      return handleQuiz(url);
    }

    if (url.pathname === "/api/categories") {
      const authError = await verifyAuth(request, env);
      if (authError) return authError;
      return handleCategories();
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// --- Auth ---

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as { passcode: string };

  if (body.passcode !== env.PASSCODE) {
    return Response.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const token = await createJWT(env.JWT_SECRET);
  return Response.json({ token });
}

async function createJWT(secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsigned = `${encode(header)}.${encode(payload)}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsigned}.${sig}`;
}

async function verifyAuth(request: Request, env: Env): Promise<Response | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = auth.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const [header, payload, sig] = parts;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Decode signature
  const sigBytes = Uint8Array.from(
    atob(sig.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  if (!valid) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check expiry
  const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  if (decoded.exp < Math.floor(Date.now() / 1000)) {
    return Response.json({ error: "Token expired" }, { status: 401 });
  }

  return null;
}

// --- Quiz ---

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
