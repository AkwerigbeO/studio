"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { useTaskList } from '@/contexts/TaskListContext';
import { Settings, Bell } from 'lucide-react';

// Define sound options
const soundOptions = [
  { value: 'work_sound_1', label: 'Digital Beep', url: 'https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_work.mp3?alt=media&token=4dd41b1b-590a-463e-952c-2731a0e0d519' },
  { value: 'break_sound_1', label: 'Gentle Chime', url: 'https://firebasestorage.googleapis.com/v0/b/fir-studio-8819d.appspot.com/o/start_break.mp3?alt=media&token=685a70e1-124d-4574-b100-26f54817692d' },
  // Add more sound options here if needed
];

const PomodoroTimer: React.FC = () => {
  // State variables...
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [autoStart, setAutoStart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [selectedWorkSound, setSelectedWorkSound] = useState(soundOptions[0].value);
  const [selectedBreakSound, setSelectedBreakSound] = useState(soundOptions[1].value);
  const { handlePomodoroComplete } = useTaskList();

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Single audio ref
  const { toast } = useToast();

  // Function to get sound URL based on value
  const getSoundUrl = useCallback((soundValue: string) => {
    return soundOptions.find(opt => opt.value === soundValue)?.url || '';
  }, []);

  // Function to play selected sound
  const playSound = useCallback((soundValue: string) => {
    if (audioRef.current) {
        const url = getSoundUrl(soundValue);
        if (url) {
            audioRef.current.src = url;
            audioRef.current.play().catch(error => console.error("Error playing sound:", error));
        }
    }
  }, [getSoundUrl]);

  // Notification logic (unchanged)
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(() => {
    if (!('Notification' in window)) {
      toast({ title: "Notifications not supported", description: "This browser does not support desktop notifications.", variant: "destructive" });
      return;
    }
    if (notificationPermission === 'granted') {
        toast({ title: "Notifications already enabled"});
        return;
    }
    if (notificationPermission === 'denied') {
        toast({ title: "Notifications Denied", description: "Please enable notifications in your browser settings.", variant: "destructive" });
        return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({ title: "Notifications Enabled", description: "You will now receive timer alerts." });
      } else {
        toast({ title: "Notifications Disabled", description: "You have denied notification permissions.", variant: "destructive" });
      }
    });
  }, [notificationPermission, toast]);

  const showNotification = useCallback((title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body });
    }
  }, [notificationPermission]);

  // Total duration calculation (unchanged)
  const totalDurationInSeconds = useCallback(() => {
    if (isWork) {
      return workMinutes * 60;
    } else {
      const isLongBreak = pomodoroCount > 0 && pomodoroCount % longBreakInterval === 0;
      return (isLongBreak ? longBreakMinutes : breakMinutes) * 60;
    }
  }, [isWork, workMinutes, breakMinutes, longBreakMinutes, pomodoroCount, longBreakInterval]);

  // Reset timer display (unchanged)
  useEffect(() => {
    if (!isActive) {
        let currentSessionMinutes;
        if (isWork) {
            currentSessionMinutes = workMinutes;
        } else {
            const isLongBreak = pomodoroCount > 0 && pomodoroCount % longBreakInterval === 0;
            currentSessionMinutes = isLongBreak ? longBreakMinutes : breakMinutes;
        }
        setMinutes(currentSessionMinutes);
        setSeconds(0);
    }
  }, [workMinutes, breakMinutes, longBreakMinutes, isWork, isActive, pomodoroCount, longBreakInterval]);

  // Timer logic - Updated to use selected sounds
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prevSeconds => prevSeconds - 1);
        } else {
          if (minutes > 0) {
            setMinutes(prevMinutes => prevMinutes - 1);
            setSeconds(59);
          } else {
            // Timer ended
            clearInterval(timerRef.current!);
            setIsActive(false);
            let nextIsWork = false;
            let nextMinutes = 0;
            let nextSeconds = 0;
            let soundToPlayValue = ''; // Store sound value, not ref
            let notificationTitle = "";
            let notificationBody = "";
            let newPomodoroCount = pomodoroCount;

            if (isWork) {
              newPomodoroCount = pomodoroCount + 1;
              setPomodoroCount(newPomodoroCount);
              handlePomodoroComplete();
              nextIsWork = false;
              soundToPlayValue = selectedBreakSound; // Use selected break sound
              notificationTitle = "Work Complete!";

              if (newPomodoroCount % longBreakInterval === 0) {
                nextMinutes = longBreakMinutes;
                notificationBody = `Time for a ${longBreakMinutes}-minute long break.`;
              } else {
                nextMinutes = breakMinutes;
                notificationBody = `Time for a ${breakMinutes}-minute break.`;
              }
            } else {
              nextIsWork = true;
              nextMinutes = workMinutes;
              soundToPlayValue = selectedWorkSound; // Use selected work sound
              notificationTitle = "Break Over!";
              notificationBody = `Time to start your next ${workMinutes}-minute work session.`;
            }

            setMinutes(nextMinutes);
            setSeconds(nextSeconds);
            setIsWork(nextIsWork);

            playSound(soundToPlayValue); // Play the selected sound
            toast({ title: notificationTitle, description: notificationBody });
            showNotification(notificationTitle, notificationBody);

            if (autoStart) {
              setIsActive(true);
            }
          }
        }
      }, 1000);
    }
    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, [
    isActive, minutes, seconds, isWork, toast, workMinutes, breakMinutes, longBreakMinutes,
    pomodoroCount, longBreakInterval, autoStart, handlePomodoroComplete, showNotification,
    selectedWorkSound, selectedBreakSound, playSound // Include sound states and function
  ]);

  // Control functions (unchanged)
  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWork(true);
    setMinutes(workMinutes);
    setSeconds(0);
    setPomodoroCount(0);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Progress calculation (unchanged)
  const currentTotalSeconds = minutes * 60 + seconds;
  const initialTotalSeconds = totalDurationInSeconds();
  const progress = initialTotalSeconds > 0 ? ((initialTotalSeconds - currentTotalSeconds) / initialTotalSeconds) * 100 : 0;

  return (
    <div className="p-4 rounded-lg shadow-md bg-secondary mt-4 w-full sm:w-96">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{isWork ? 'Work' : (pomodoroCount > 0 && pomodoroCount % longBreakInterval === 0 ? 'Long Break' : 'Break')}</h2>
        <div className="flex items-center space-x-1">
          {('Notification' in window && notificationPermission !== 'granted') && (
            <Button variant="ghost" size="icon" onClick={requestNotificationPermission} title="Enable Notifications">
              <Bell className={`h-5 w-5 ${notificationPermission === 'denied' ? 'text-destructive' : ''}`} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSettings} title="Timer Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="w-full h-2 my-3" />

      <div className="text-6xl font-bold text-center mb-4" style={{ fontFamily: 'var(--timer-font)' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        {!isActive ? (
          <Button size="lg" onClick={startTimer}>Start</Button>
        ) : (
          <Button size="lg" onClick={pauseTimer}>Pause</Button>
        )}
        <Button variant="outline" size="lg" onClick={resetTimer}>Reset</Button>
      </div>

      {/* Collapsible Settings - Updated with Sound Selectors */}
      {showSettings && (
        <div className="mt-4 flex flex-col space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Work (min)</label>
              <Input type="number" min="1" value={workMinutes} onChange={e => setWorkMinutes(Math.max(1, parseInt(e.target.value)))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Break (min)</label>
              <Input type="number" min="1" value={breakMinutes} onChange={e => setBreakMinutes(Math.max(1, parseInt(e.target.value)))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Long Break (min)</label>
              <Input type="number" min="1" value={longBreakMinutes} onChange={e => setLongBreakMinutes(Math.max(1, parseInt(e.target.value)))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">LB Interval</label>
              <Input type="number" min="1" value={longBreakInterval} onChange={e => setLongBreakInterval(Math.max(1, parseInt(e.target.value)))} className="w-full" />
            </div>

            {/* Sound Selectors */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Work Sound</label>
                <Select value={selectedWorkSound} onValueChange={setSelectedWorkSound}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select work sound" />
                    </SelectTrigger>
                    <SelectContent>
                        {soundOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Break Sound</label>
                <Select value={selectedBreakSound} onValueChange={setSelectedBreakSound}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select break sound" />
                    </SelectTrigger>
                    <SelectContent>
                        {soundOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <label className="mt-4 inline-flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="h-5 w-5 rounded text-primary focus:ring-primary border-input" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} />
            <span className="text-sm font-medium text-foreground">Auto Start Next Session</span>
          </label>
        </div>
      )}

      {/* Single Audio element for playback */}
      <audio ref={audioRef} preload="auto" />

    </div>
  );
};

export default PomodoroTimer;
