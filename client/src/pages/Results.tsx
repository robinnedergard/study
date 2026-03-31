import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import type { MissedQuestion } from '../types'
import styles from './Results.module.css'

interface ResultsState {
  correctCount: number;
  total: number;
  missed: MissedQuestion[];
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  if (!state) return <Navigate to="/" replace />;

  const { correctCount, total, missed } = state;
  const pct = Math.round((correctCount / total) * 100);
  const grade = pct >= 80 ? 'great' : pct >= 60 ? 'ok' : 'bad';

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Quiz Complete!</h2>

      <div className={`${styles.circle} ${styles[grade]}`}>
        <span className={styles.pct}>{pct}%</span>
        <span className={styles.label}>score</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.num} style={{ color: '#22c55e' }}>{correctCount}</div>
          <div className={styles.statLabel}>Correct</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.num} style={{ color: '#ef4444' }}>{total - correctCount}</div>
          <div className={styles.statLabel}>Wrong</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.num}>{total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
      </div>

      {missed.length > 0 ? (
        <div className={styles.missedList}>
          <h3>Review These:</h3>
          {missed.map((m, i) => (
            <div key={i} className={styles.missedItem}>
              <strong>{m.acronym}</strong> &mdash; {m.correctAnswer}
              <div className={styles.missedExplanation}>{m.explanation}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.perfect}>Perfect score! Well done!</p>
      )}

      <button className={styles.restartBtn} onClick={() => navigate('/')}>
        Try Again
      </button>
    </div>
  )
}
