import { Outlet, Link } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.titleLink}>
          <h1>CompTIA Security+ SY0-701</h1>
          <p>Acronym Quiz</p>
        </Link>
      </header>
      <div className={styles.container}>
        <Outlet />
      </div>
    </>
  )
}
