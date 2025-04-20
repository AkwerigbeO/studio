"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useTaskList } from '@/contexts/TaskListContext';

const PomodoroTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [longBreakInterval, setLongBreakInterval] = useState(4); // After every 4 work sessions
  const [autoStart, setAutoStart] = useState(false);
  const { handlePomodoroComplete } = useTaskList();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakSoundRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMinutes(isWork ? workMinutes : breakMinutes);
  }, [workMinutes, breakMinutes, isWork]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds => seconds - 1);
        } else {
          if (minutes > 0) {
            setMinutes(minutes => minutes - 1);
            setSeconds(59);
          } else {
            clearInterval(timerRef.current!);
            setIsActive(false);
            // Timer is done. Switch to break or work.
            if (isWork) {
              setPomodoroCount(prevCount => prevCount + 1);
              handlePomodoroComplete(); // Notify task list of pomodoro completion

              if ((pomodoroCount + 1) % longBreakInterval === 0) {
                setMinutes(longBreakMinutes);
                setSeconds(0);
                setIsWork(false);
                breakSoundRef.current?.play();
                toast({
                  title: "Work session complete!",
                  description: "Take a long break.",
                });
              } else {
                setMinutes(breakMinutes);
                setSeconds(0);
                setIsWork(false);
                breakSoundRef.current?.play();
                toast({
                  title: "Work session complete!",
                  description: "Take a short break.",
                });
              }
            } else {
              setMinutes(workMinutes);
              setSeconds(0);
              setIsWork(true);
              workSoundRef.current?.play();
              toast({
                title: "Break session complete!",
                description: "Get back to work.",
              });
            }
            if (autoStart) {
              setIsActive(true); // Automatically start the next session
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive, minutes, seconds, isWork, toast, workMinutes, breakMinutes, longBreakMinutes, pomodoroCount, longBreakInterval, autoStart, handlePomodoroComplete]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current!);
  };

  const resetTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current!);
    setMinutes(isWork ? workMinutes : breakMinutes);
    setSeconds(0);
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-secondary mt-4">
      <h2 className="text-2xl font-semibold mb-2">{isWork ? 'Work Session' : 'Break Session'}</h2>
      <div className="text-5xl font-bold" style={{ fontFamily: 'var(--timer-font)' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {!isActive ? (
          <Button variant="outline" onClick={startTimer}>Start</Button>
        ) : (
          <Button variant="outline" onClick={pauseTimer}>Pause</Button>
        )}
        <Button variant="outline" onClick={resetTimer}>Reset</Button>
      </div>

      {/* Settings */}
      <div className="mt-4 flex flex-col space-y-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Work Minutes</label>
          <Input
            type="number"
            value={workMinutes}
            onChange={e => setWorkMinutes(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Break Minutes</label>
          <Input
            type="number"
            value={breakMinutes}
            onChange={e => setBreakMinutes(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Long Break Minutes</label>
          <Input
            type="number"
            value={longBreakMinutes}
            onChange={e => setLongBreakMinutes(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Long Break Interval</label>
          <Input
            type="number"
            value={longBreakInterval}
            onChange={e => setLongBreakInterval(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <label className="inline-flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 rounded text-primary focus:ring-primary"
            checked={autoStart}
            onChange={e => setAutoStart(e.target.checked)}
          />
          <span className="text-sm font-medium text-foreground">Auto Start Next Session</span>
        </label>
      </div>

      <audio ref={workSoundRef} src="https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_work.mp3?alt=media&token=4dd41b1b-590a-463e-952c-2731a0e0d519" preload="auto" />
      <audio ref={breakSoundRef} src="https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_break.mp3?alt=media&token=685a70e1-124d-4574-b100-26f54817692d" preload="auto" />
    </div>
  );
};

export default PomodoroTimer;
