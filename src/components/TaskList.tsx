"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [categories, setCategories] = useState(['Work', 'Personal', 'Study']);

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
    if (tasks.length > 0) {
      // Find the first incomplete task
      const taskToUpdate = tasks.find(task => !task.completed);

      if (taskToUpdate) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskToUpdate.id ? { ...task, pomodoros: task.pomodoros + 1 } : task
          )
        );
      } else {
        // If all tasks are complete, update the first task in the list
        setTasks(prevTasks =>
          prevTasks.map((task, index) =>
            index === 0 ? { ...task, pomodoros: task.pomodoros + 1 } : task
          )
        );
      }
    }
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

const TaskList: React.FC = () => {
  const { tasks, addTask, deleteTask, completeTask, editTask } = useTaskList();
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newCategory, setNewCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (selectedDate) {
      // This is a placeholder for setting reminders. In a real app, you would
      // integrate with a notification system or calendar API.
      console.log(`Reminder set for tasks due on ${selectedDate.toLocaleDateString()}`);
    }
  }, [selectedDate]);

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      addTask(newTask, newCategory || 'Work', selectedDate);
      setNewTask('');
      setNewCategory('');
      setSelectedDate(undefined);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleCompleteTask = (id: string) => {
    completeTask(id);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
  };

  const handleUpdateTask = () => {
    if (editedTaskName.trim() !== '') {
      if (editingTaskId) {
        editTask(editingTaskId, editedTaskName);
        setEditingTaskId(null);
        setEditedTaskName('');
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="bg-secondary p-4 rounded-lg shadow-md mt-4 w-full sm:w-96">
      <h2 className="text-2xl font-semibold mb-2">Task List</h2>

      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Add a task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <Button onClick={handleAddTask}>Add</Button>
      </div>

      <div className="flex space-x-2 mb-4">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-background border border-input rounded-md px-2 py-1"
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <Input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <Button onClick={handleAddCategory}>Add Category</Button>
      </div>

      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                <span>{selectedDate?.toLocaleDateString()}</span>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" side="bottom">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={[{ before: new Date() }]}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <ul>
        {filteredTasks.map(task => (
          <li key={task.id} className="flex items-center justify-between py-2 border-b border-gray-300">
            {editingTaskId === task.id ? (
              <>
                <Input
                  type="text"
                  value={editedTaskName}
                  onChange={e => setEditedTaskName(e.target.value)}
                />
                <Button variant="outline" onClick={handleUpdateTask}>Update</Button>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    id={`task-${task.id}`}
                  />
                  <label htmlFor={`task-${task.id}`} className={`ml-2 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </label>
                  <span className="ml-2 text-sm text-gray-500">({task.pomodoros} pomodoros)</span>
                </div>
                <div>
                  <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
