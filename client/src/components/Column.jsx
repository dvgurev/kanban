import React, { useState } from 'react';
import Task from './Task.jsx';
import AddTask from './AddTask.jsx';
import styles from './Column.module.css';

function Column({ column, onAddTask, onDragStart, onDragEnd, onDragOver, onDrop, onTaskDrop }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null); // 'above' or 'below'

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
    setDraggedOverTaskId(null);
    setDragPosition(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDraggedOverTaskId(null);
    setDragPosition(null);
    onDrop(e, column.id);
  };

  const handleTaskDragOver = (e, taskId, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Определяем позицию относительно задачи
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = rect.height / 2;
    
    const position = y < threshold ? 'above' : 'below';
    
    setDraggedOverTaskId(taskId);
    setDragPosition(position);
  };

  const handleTaskDragLeave = () => {
    setDraggedOverTaskId(null);
    setDragPosition(null);
  };

  const handleTaskDrop = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetIndex = column.tasks.findIndex(t => t.id === taskId);
    let dropIndex = targetIndex;
    
    // Если позиция "below", вставляем после текущей задачи
    if (dragPosition === 'below') {
      dropIndex = targetIndex + 1;
    }
    
    setDraggedOverTaskId(null);
    setDragPosition(null);
    onTaskDrop(e, column.id, taskId, dropIndex);
  };

  return (
    <div
      className={`${styles.column} ${isDraggingOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{column.title}</h3>
        <span className={styles.taskCount}>{column.tasks?.length || 0}</span>
      </div>

      <div className={styles.tasks}>
        {column.tasks?.map((task, index) => (
          <div
            key={task.id}
            className={`
              ${styles.taskWrapper} 
              ${draggedOverTaskId === task.id ? styles.dragOver : ''}
              ${dragPosition === 'above' && draggedOverTaskId === task.id ? styles.dragAbove : ''}
              ${dragPosition === 'below' && draggedOverTaskId === task.id ? styles.dragBelow : ''}
            `}
            onDragOver={(e) => handleTaskDragOver(e, task.id, index)}
            onDragLeave={handleTaskDragLeave}
            onDrop={(e) => handleTaskDrop(e, task.id)}
          >
            <Task
              task={task}
              columnId={column.id}
              index={index}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
      </div>

      <AddTask columnId={column.id} onAdd={onAddTask} />
    </div>
  );
}

export default Column;