"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakSoundRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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
              breakSoundRef.current?.play();
              toast({
                title: "Work session complete!",
                description: "Take a break.",
              });
            } else {
              setMinutes(25);
              setSeconds(0);
              setIsWork(true);
              workSoundRef.current?.play();
              toast({
                title: "Break session complete!",
                description: "Get back to work.",
              });
            }
            setIsActive(true); // Automatically start the next session
          }
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive, minutes, seconds, isWork, toast]);

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
      <audio ref={workSoundRef} src="https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_work.mp3?alt=media&token=4dd41b1b-590a-463e-952c-2731a0e0d519" preload="auto" />
      <audio ref={breakSoundRef} src="https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_break.mp3?alt=media&token=685a70e1-124d-4574-b100-26f54817692d" preload="auto" />
    </div>
  );
};

export default PomodoroTimer;
