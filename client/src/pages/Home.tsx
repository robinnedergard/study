import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../auth";
import type { QuizMode } from "../types";
import styles from "./Home.module.css";

const MODES: { id: QuizMode; title: string; description: string }[] = [
  {
    id: "acronym",
    title: "Acronym Quiz",
    description: "See an acronym, pick the correct meaning from 4 options.",
  },
  {
    id: "term-match",
    title: "Term Match",
    description: "Read a description, identify which acronym it refers to.",
  },
];

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("all");
  const [count, setCount] = useState(20);
  const [selectedMode, setSelectedMode] = useState<QuizMode>("acronym");
  const navigate = useNavigate();

  useEffect(() => {
    authFetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function handleStart() {
    const route = selectedMode === "term-match" ? "/term-match" : "/quiz";
    navigate(`${route}?count=${count}&category=${encodeURIComponent(category)}`);
  }

  return (
    <div>
      <div className={styles.modes}>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.modeCard} ${selectedMode === mode.id ? styles.modeActive : ""}`}
            onClick={() => setSelectedMode(mode.id)}
          >
            <div className={styles.modeTitle}>{mode.title}</div>
            <div className={styles.modeDesc}>{mode.description}</div>
          </button>
        ))}
      </div>

      <div className={styles.setup}>
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label htmlFor="count">Number of Questions</label>
        <input
          id="count"
          type="number"
          value={count}
          min={5}
          max={140}
          onChange={(e) => setCount(Number(e.target.value))}
        />

        <button onClick={handleStart}>Start Quiz</button>
      </div>
    </div>
  );
}
