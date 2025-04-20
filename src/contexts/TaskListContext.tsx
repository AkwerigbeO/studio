"use client";

import React, { useState, createContext, useContext } from 'react';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  pomodoros: number;
  category: string;
  dueDate?: Date;
}

interface TaskListContextType {
  tasks: Task[];
  addTask: (name: string, category: string, dueDate?: Date) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  editTask: (id: string, newName: string) => void;
  handlePomodoroComplete: () => void;
}

const TaskListContext = createContext<TaskListContextType | undefined>(undefined);

export const useTaskList = () => {
  const context = useContext(TaskListContext);
  if (!context) {
    throw new Error("useTaskList must be used within a TaskListProvider");
  }
  return context;
};

interface TaskListProviderProps {
  children: React.ReactNode;
}

export const TaskListProvider: React.FC<TaskListProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (name: string, category: string, dueDate?: Date) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      completed: false,
      pomodoros: 0,
      category,
      dueDate,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const editTask = (id: string, newName: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, name: newName } : task
      )
    );
  };

  const handlePomodoroComplete = () => {
    setTasks(prevTasks => {
      if (prevTasks.length === 0) {
        return prevTasks; // No tasks to update
      }

      // Find the first incomplete task
      const taskToUpdate = prevTasks.find(task => !task.completed);

      if (taskToUpdate) {
        return prevTasks.map(task =>
          task.id === taskToUpdate.id ? { ...task, pomodoros: task.pomodoros + 1 } : task
        );
      } else {
        // If all tasks are complete, update the first task in the list
        return prevTasks.map((task, index) =>
          index === 0 ? { ...task, pomodoros: task.pomodoros + 1 } : task
        );
      }
    });
  };

  const value: TaskListContextType = {
    tasks,
    addTask,
    deleteTask,
    completeTask,
    editTask,
    handlePomodoroComplete,
  };

  return (
    <TaskListContext.Provider value={value}>
      {children}
    </TaskListContext.Provider>
  );
};
