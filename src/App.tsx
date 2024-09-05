import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import "./App.css";

function App() {
  const timerDuration = 30; // By default 2m
  const [count, setCount] = useState(timerDuration);
  const [activePlayers, setActivePlayers] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isKillerActive, setIsKillerActive] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const killerIntervalRef = useRef<number | null>(null);

  // Settings
  const maxTime = timerDuration;
  const minTime = 5; // By default 45s
  const killerIncreaseInterval =
    ((minTime + (maxTime - minTime) / 2) * 1000) / 60;

  const calculateInterval = () => {
    if (isKillerActive) return killerIncreaseInterval;
    if (activePlayers === 0) return null;
    const timeForPlayers = minTime + (maxTime - minTime) / activePlayers;
    return (timeForPlayers * 1000) / 60;
  };

  const showConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const updateTimer = () => {
    setCount((prevCount) => {
      if (prevCount <= 0) {
        setIsTimerRunning(false);
        showConfetti();
        return maxTime;
      }
      return isKillerActive ? prevCount + 1 : prevCount - 1;
    });
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (activePlayers > 0 || isKillerActive) {
      const interval = calculateInterval();
      if (interval) {
        intervalRef.current = window.setInterval(updateTimer, interval);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activePlayers, isKillerActive]);

  useEffect(() => {
    if (isKillerActive) {
      killerIntervalRef.current = window.setInterval(() => {
        setCount((prevCount) => Math.min(prevCount + 1, maxTime));
      }, killerIncreaseInterval);
    } else if (killerIntervalRef.current) {
      clearInterval(killerIntervalRef.current);
      killerIntervalRef.current = null;
    }

    return () => {
      if (killerIntervalRef.current) clearInterval(killerIntervalRef.current);
    };
  }, [isKillerActive]);

  useEffect(() => {
    if (!isTimerRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTimerRunning]);

  const handleMouseDown = () => setActivePlayers((prev) => prev + 1);
  const handleMouseUp = () => setActivePlayers((prev) => Math.max(prev - 1, 0));
  const handleKillerMouseDown = () => setIsKillerActive(true);
  const handleKillerMouseUp = () => setIsKillerActive(false);

  const buttonProps = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleMouseDown,
    onTouchEnd: handleMouseUp,
    disabled: !isTimerRunning,
  };

  const killerButtonProps = {
    onMouseDown: handleKillerMouseDown,
    onMouseUp: handleKillerMouseUp,
    onMouseLeave: handleKillerMouseUp,
    onTouchStart: handleKillerMouseDown,
    onTouchEnd: handleKillerMouseUp,
    disabled: !isTimerRunning,
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerIcon = () => {
    if (isKillerActive) return "💀";
    const icons = ["🕐🚶‍♂️", "🕑🏃‍♂️", "🕒🏇", "🕓🏎️"];
    return icons[Math.min(activePlayers, icons.length) - 1] || "⏳";
  };

  return (
    <>
      <div>
        <div className={`app-container ${!isTimerRunning ? "time-out" : ""}`}>
          <button className="btn-killer" {...killerButtonProps}>
            Killer
          </button>
          <div className="card">
            <h2>Hold your button!</h2>
            <button className="btn-red" {...buttonProps}>
              Player 1
            </button>
            <button className="btn-blue" {...buttonProps}>
              Player 2
            </button>
            <button className="btn-green" {...buttonProps}>
              Player 3
            </button>
            <button className="btn-yellow" {...buttonProps}>
              Player 4
            </button>
            <p>
              {getTimerIcon()} Timer: {formatTime(count)}
            </p>
          </div>
        </div>
      </div>
      {!isTimerRunning && (
        <div className="overlay">
          <h1>Finish</h1>
        </div>
      )}
    </>
  );
}

export default App;
