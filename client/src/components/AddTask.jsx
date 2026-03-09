import React, { useState } from 'react';
import styles from './AddTask.module.css';

function AddTask({ columnId, onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(columnId, content.trim());
      setContent('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        className={styles.addTaskButton}
        onClick={() => setIsAdding(true)}
      >
        + Добавить задачу
      </button>
    );
  }

  return (
    <div className={styles.addTaskForm}>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder="Введите содержание задачи"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          rows="3"
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

export default AddTask;