import { Outlet, Link, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout() {
  const { pathname } = useLocation();
  const showBack = pathname !== "/" && pathname !== "/login";

  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.titleLink}>
          <h1>CompTIA Security+ SY0-701</h1>
          <p>Acronym Quiz</p>
        </Link>
      </header>
      <div className={styles.container}>
        {showBack && (
          <Link to="/" className={styles.backBtn}>
            &larr; Back to menu
          </Link>
        )}
        <Outlet />
      </div>
    </>
  );
}
