import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { Question, MissedQuestion } from '../types'
import QuestionCard from '../components/QuestionCard'

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const count = searchParams.get('count') || '20';
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    fetch(`/api/quiz?count=${count}&category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, [count, category]);

  function handleAnswer(correct: boolean) {
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissed((m) => [...m, { ...questions[current], userAnswer: '' }]);
    }

    const next = current + 1;
    if (next >= questions.length) {
      const finalCorrect = correct ? correctCount + 1 : correctCount;
      const finalMissed = correct
        ? missed
        : [...missed, { ...questions[current], userAnswer: '' }];

      navigate('/results', {
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
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No questions found for this category.</div>;
  }

  return (
    <QuestionCard
      key={current}
      question={questions[current]}
      current={current}
      total={questions.length}
      onAnswer={handleAnswer}
    />
  )
}
