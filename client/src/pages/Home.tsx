import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch } from '../auth'
import styles from './Home.module.css'

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('all');
  const [count, setCount] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function handleStart() {
    navigate(`/quiz?count=${count}&category=${encodeURIComponent(category)}`);
  }

  return (
    <div className={styles.setup}>
      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
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
  )
}
