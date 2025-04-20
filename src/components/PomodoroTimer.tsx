"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
              setMinutes(5);
              setSeconds(0);
              setIsWork(false);
              alert('Work session complete! Take a break.'); // Replace with a more subtle notification
            } else {
              setMinutes(25);
              setSeconds(0);
              setIsWork(true);
              alert('Break session complete! Get back to work.'); // Replace with a more subtle notification
            }
            setIsActive(true); // Automatically start the next session
          }
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive, minutes, seconds, isWork]);

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
    setMinutes(isWork ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-secondary mt-4">
      <h2 className="text-2xl font-semibold mb-2">{isWork ? 'Work Session' : 'Break Session'}</h2>
      <div className="text-5xl font-bold">
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
    </div>
  );
};

export default PomodoroTimer;
