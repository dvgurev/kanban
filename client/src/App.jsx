import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import styles from './App.module.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Имитация загрузки (можно убрать позже)
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка доски...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Task Board</h1>
      </header>
      <main className={styles.main}>
        <Board />
      </main>
    </div>
  );
}

export default App;