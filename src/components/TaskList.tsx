"use client";

import React, { useState, useEffect } from 'react'; // Removed createContext, useContext
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash, Calendar as CalendarIcon } from "lucide-react"; // Removed CheckCircle, not used
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTaskList, Task } from '@/contexts/TaskListContext'; // Import hook and interface

// Removed duplicate Task interface
// Removed duplicate TaskListContextType interface
// Removed duplicate TaskListContext
// Removed duplicate useTaskList hook
// Removed duplicate TaskListProviderProps interface
// Removed duplicate TaskListProvider component

const TaskList: React.FC = () => {
  const { tasks, addTask, deleteTask, completeTask, editTask } = useTaskList(); // Using imported hook
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Removed local categories state, assuming categories might come from context or be static
  const [categories, setCategories] = useState(['Work', 'Personal', 'Study']); // Keeping this for now, but ideally manage globally if needed
  const [newCategory, setNewCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Removed useEffect for selectedDate console log - not essential for fix

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      addTask(newTask, newCategory || 'Work', selectedDate); // Using addTask from context
      setNewTask('');
      setNewCategory('');
      setSelectedDate(undefined);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id); // Using deleteTask from context
  };

  const handleCompleteTask = (id: string) => {
    completeTask(id); // Using completeTask from context
  };

  const handleEditTask = (task: Task) => { // Using imported Task interface
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
  };

  const handleUpdateTask = () => {
    if (editedTaskName.trim() !== '') {
      if (editingTaskId) {
        editTask(editingTaskId, editedTaskName); // Using editTask from context
        setEditingTaskId(null);
        setEditedTaskName('');
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory)) { // Added check to avoid duplicates
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

      {/* Task Input */}
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Add a task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className="flex-grow"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                <span>{selectedDate?.toLocaleDateString()}</span>
              ) : (
                <span>Due Date?</span>
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
        <Button onClick={handleAddTask}>Add</Button>
      </div>

      {/* Category Management */}
      <div className="flex space-x-2 mb-4">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-background border border-input rounded-md px-2 py-1 flex-grow"
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
          className="w-[120px]"
        />
        <Button onClick={handleAddCategory} variant="outline">Add Cat.</Button>
      </div>

      {/* Task List */}
      <ul className="max-h-60 overflow-y-auto">
        {filteredTasks.map(task => (
          <li key={task.id} className="flex items-center justify-between py-2 border-b border-gray-700">
            {editingTaskId === task.id ? (
              <>
                <Input
                  type="text"
                  value={editedTaskName}
                  onChange={e => setEditedTaskName(e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button variant="outline" onClick={handleUpdateTask}>Update</Button>
              </>
            ) : (
              <>
                <div className="flex items-center flex-grow overflow-hidden mr-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    id={`task-${task.id}`}
                    className="mr-2"
                  />
                  <label htmlFor={`task-${task.id}`} className={`truncate ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.name}
                  </label>
                  {task.dueDate && (
                      <span className="ml-2 text-xs text-muted-foreground">Due: {task.dueDate.toLocaleDateString()}</span>
                  )}
                  <span className="ml-2 text-sm text-gray-500">({task.pomodoros}🍅)</span>
                </div>
                <div className="flex-shrink-0">
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
