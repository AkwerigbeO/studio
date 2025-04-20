"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash } from "lucide-react";

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      const newTaskItem: Task = {
        id: Date.now().toString(),
        name: newTask,
        completed: false,
      };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleCompleteTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
  };

  const handleUpdateTask = () => {
    if (editedTaskName.trim() !== '') {
      setTasks(
        tasks.map(task =>
          task.id === editingTaskId ? { ...task, name: editedTaskName } : task
        )
      );
      setEditingTaskId(null);
      setEditedTaskName('');
    }
  };

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
      <ul>
        {tasks.map(task => (
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
