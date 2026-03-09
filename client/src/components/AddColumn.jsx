import React, { useState } from 'react';
import styles from './AddColumn.module.css';

function AddColumn({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        className={styles.addColumnButton}
        onClick={() => setIsAdding(true)}
      >
        + Добавить колонку
      </button>
    );
  }

  return (
    <div className={styles.addColumnForm}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Введите название колонки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton}>
            Добавить
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsAdding(false)}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddColumn;