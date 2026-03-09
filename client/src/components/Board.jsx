import React, { useState, useEffect } from 'react';
import Column from './Column.jsx';
import AddColumn from './AddColumn.jsx';
import api from '../services/api.js';
import styles from './Board.module.css';

function Board() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const data = await api.getBoard();
      setColumns(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching board:', error);
      setLoading(false);
    }
  };

  const handleAddColumn = async (title) => {
    try {
      const newColumn = await api.createColumn({
        title,
        order: columns.length
      });
      setColumns([...columns, newColumn]);
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const handleAddTask = async (columnId, content) => {
    try {
      const column = columns.find(col => col.id === columnId);
      const newTask = await api.createTask({
        content,
        columnId,
        order: column.tasks?.length || 0
      });
      
      setColumns(columns.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col
      ));
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDragStart = (e, taskId, sourceColumnId, sourceIndex) => {
    const task = columns
      .find(col => col.id === sourceColumnId)
      ?.tasks.find(t => t.id === taskId);
    
    setDraggedTask({ 
      id: taskId, 
      sourceColumnId, 
      sourceIndex,
      task: task 
    });
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove(styles.dragging);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnId, targetIndex = null) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const { id: taskId, sourceColumnId, sourceIndex, task } = draggedTask;

    // Определяем целевой индекс
    let finalTargetIndex = targetIndex;
    if (finalTargetIndex === null) {
      const targetColumn = columns.find(col => col.id === targetColumnId);
      finalTargetIndex = targetColumn.tasks?.length || 0;
    }

    try {
      // Если перетаскиваем в ту же колонку
      if (sourceColumnId === targetColumnId) {
        if (sourceIndex === finalTargetIndex) {
          setDraggedTask(null);
          return;
        }
        
        await handleSameColumnReorder(
          sourceColumnId, 
          sourceIndex, 
          finalTargetIndex
        );
      } else {
        // Перемещение между разными колонками
        await handleCrossColumnMove(
          taskId,
          sourceColumnId,
          targetColumnId,
          sourceIndex,
          finalTargetIndex,
          task
        );
      }
    } catch (error) {
      console.error('Error during drop:', error);
      fetchBoard(); // Восстанавливаем состояние в случае ошибки
    }

    setDraggedTask(null);
  };

  const handleSameColumnReorder = async (columnId, sourceIndex, targetIndex) => {
    try {
      // Сохраняем ID перемещаемой задачи ДО изменения массива
      const column = columns.find(col => col.id === columnId);
      const taskId = column.tasks[sourceIndex].id;
      
      // Обновляем UI оптимистично
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        const columnIndex = newColumns.findIndex(col => col.id === columnId);
        const columnCopy = newColumns[columnIndex];
        
        const newTasks = [...columnCopy.tasks];
        const [movedTask] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(targetIndex, 0, movedTask);
        
        // Обновляем order
        newTasks.forEach((task, idx) => {
          task.order = idx;
        });
        
        columnCopy.tasks = newTasks;
        return newColumns;
      });

      // Отправляем запрос на сервер
      await api.updateTaskOrder(taskId, {
        columnId: columnId,
        order: targetIndex,
        oldColumnId: columnId,
        oldOrder: sourceIndex
      });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  };

  const handleCrossColumnMove = async (taskId, sourceColumnId, targetColumnId, sourceIndex, targetIndex, task) => {
    try {
      // Обновляем UI оптимистично
      setColumns(prevColumns => {
        const newColumns = JSON.parse(JSON.stringify(prevColumns));
        
        // Удаляем из исходной колонки
        const sourceColIndex = newColumns.findIndex(col => col.id === sourceColumnId);
        const [movedTask] = newColumns[sourceColIndex].tasks.splice(sourceIndex, 1);
        
        // Обновляем order в исходной колонке
        newColumns[sourceColIndex].tasks.forEach((t, idx) => {
          t.order = idx;
        });
        
        // Добавляем в целевую колонку
        const targetColIndex = newColumns.findIndex(col => col.id === targetColumnId);
        newColumns[targetColIndex].tasks.splice(targetIndex, 0, movedTask);
        
        // Обновляем order в целевой колонке
        newColumns[targetColIndex].tasks.forEach((t, idx) => {
          t.order = idx;
        });
        
        return newColumns;
      });

      // Отправляем запрос на сервер
      await api.updateTaskOrder(taskId, {
        columnId: targetColumnId,
        order: targetIndex,
        oldColumnId: sourceColumnId,
        oldOrder: sourceIndex
      });
    } catch (error) {
      console.error('Error moving task between columns:', error);
      throw error;
    }
  };

  const handleTaskDropOnTask = async (e, targetColumnId, targetTaskId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask) return;

    const targetColumn = columns.find(col => col.id === targetColumnId);
    const targetIndex = targetColumn.tasks.findIndex(t => t.id === targetTaskId);
    
    await handleDrop(e, targetColumnId, targetIndex);
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка колонок...</div>;
  }

  return (
    <div className={styles.board}>
      <div className={styles.columns}>
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            onAddTask={handleAddTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDrop={handleTaskDropOnTask}
          />
        ))}
        <AddColumn onAdd={handleAddColumn} />
      </div>
    </div>
  );
}

export default Board;