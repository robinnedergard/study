import { useState } from "react";
import type { Question } from "../types";
import styles from "./QuestionCard.module.css";

interface Props {
  question: Question;
  current: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}

export default function QuestionCard({ question, current, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAnswer;

  function handleSelect(option: string) {
    if (isAnswered) return;
    setSelected(option);
  }

  function getButtonClass(option: string) {
    if (!isAnswered) return styles.option;
    const classes = [styles.option, styles.answered];
    if (option === question.correctAnswer) classes.push(styles.correct);
    else if (option === selected) classes.push(styles.wrong);
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
        <div className={styles.acronym}>{question.acronym}</div>

        <div className={styles.options}>
          {question.options.map((opt) => (
            <button key={opt} className={getButtonClass(opt)} onClick={() => handleSelect(opt)}>
              {opt}
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
              {isCorrect ? "Correct!" : `Wrong! The answer is: ${question.correctAnswer}`}
            </div>

            <div className={styles.explanation}>
              <div className={styles.explanationLabel}>What is it?</div>
              <div>{question.explanation}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
