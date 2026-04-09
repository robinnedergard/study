import { useState } from "react";
import type { TermMatchQuestion } from "../types";
import styles from "./TermMatchCard.module.css";

interface Props {
  question: TermMatchQuestion;
  current: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}

export default function TermMatchCard({ question, current, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAcronym;

  function handleSelect(acronym: string) {
    if (isAnswered) return;
    setSelected(acronym);
  }

  function getButtonClass(acronym: string) {
    if (!isAnswered) return styles.option;
    const classes = [styles.option, styles.answered];
    if (acronym === question.correctAcronym) classes.push(styles.correct);
    else if (acronym === selected) classes.push(styles.wrong);
    else classes.push(styles.dimmed);
    return classes.join(" ");
  }

  return (
    <div>
      <div className={styles.progressBar}>
        <div className={styles.fill} style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div className={styles.progressText}>
        {current + 1} / {total}
      </div>

      <div className={styles.card}>
        <span className={styles.badge}>{question.category}</span>

        <div className={styles.prompt}>
          <div className={styles.promptLabel}>Which acronym matches this description?</div>
          <div className={styles.promptText}>{question.explanation}</div>
        </div>

        <div className={styles.options}>
          {question.options.map((opt) => (
            <button
              key={opt.acronym}
              className={getButtonClass(opt.acronym)}
              onClick={() => handleSelect(opt.acronym)}
            >
              <span className={styles.optAcronym}>{opt.acronym}</span>
              <span className={styles.optMeaning}>{opt.meaning}</span>
            </button>
          ))}
        </div>

        {isAnswered && (
          <>
            <button className={styles.nextBtn} onClick={() => onAnswer(isCorrect)}>
              {current + 1 < total ? "Next" : "See Results"}
            </button>

            <div
              className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
            >
              {isCorrect
                ? "Correct!"
                : `Wrong! The answer is: ${question.correctAcronym} — ${question.correctMeaning}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
