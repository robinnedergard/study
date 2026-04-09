import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { TermMatchQuestion, MissedItem } from "../types";
import { authFetch } from "../auth";
import TermMatchCard from "../components/TermMatchCard";

export default function TermMatch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<TermMatchQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<MissedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const count = searchParams.get("count") || "20";
  const category = searchParams.get("category") || "all";

  useEffect(() => {
    authFetch(`/api/quiz?mode=term-match&count=${count}&category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, [count, category]);

  function handleAnswer(correct: boolean) {
    const q = questions[current];

    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissed((m) => [
        ...m,
        {
          acronym: q.correctAcronym,
          correctAnswer: q.correctMeaning,
          explanation: q.explanation,
        },
      ]);
    }

    const next = current + 1;
    if (next >= questions.length) {
      const finalCorrect = correct ? correctCount + 1 : correctCount;
      const finalMissed = correct
        ? missed
        : [
            ...missed,
            {
              acronym: q.correctAcronym,
              correctAnswer: q.correctMeaning,
              explanation: q.explanation,
            },
          ];

      navigate("/results", {
        state: {
          correctCount: finalCorrect,
          total: questions.length,
          missed: finalMissed,
        },
      });
    } else {
      setCurrent(next);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
        Loading questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
        No questions found for this category.
      </div>
    );
  }

  return (
    <TermMatchCard
      key={current}
      question={questions[current]}
      current={current}
      total={questions.length}
      onAnswer={handleAnswer}
    />
  );
}
