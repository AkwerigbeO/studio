"use client";

import TaskList from '@/components/TaskList';
import PomodoroTimer from '@/components/PomodoroTimer';
// import FontSelector from '@/components/FontSelector'; // Removed import
import ThemeToggle from '@/components/ThemeToggle';
import { TaskListProvider } from '@/contexts/TaskListContext';

export default function Home() {
  return (
    <TaskListProvider>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl font-bold mt-6">
            PomoFocus
          </h1>
          <ThemeToggle />
          {/* <FontSelector /> */}{/* Removed usage */}
          <PomodoroTimer />
          <TaskList />
        </main>
      </div>
    </TaskListProvider>
  );
}
