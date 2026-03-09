import React from 'react';
import styles from './Task.module.css';

function Task({ task, columnId, index, onDragStart, onDragEnd }) {
  const handleDragStart = (e) => {
    e.target.classList.add(styles.dragging);
    onDragStart(e, task.id, columnId, index);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove(styles.dragging);
    onDragEnd(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={styles.task}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={styles.content}>{task.content}</div>
      <div className={styles.footer}>
        <span className={styles.id}>#{task.id}</span>
      </div>
    </div>
  );
}

export default Task;