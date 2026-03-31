import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../auth'
import styles from './Login.module.css'

export default function Login() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        setError('Invalid passcode');
        setLoading(false);
        return;
      }

      const { token } = await res.json();
      setToken(token);
      navigate('/', { replace: true });
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Enter Passcode</h2>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className={styles.input}
          autoFocus
        />

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={loading || !passcode}>
          {loading ? 'Checking...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
