import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SlSettings } from "react-icons/sl";
import confetti from "canvas-confetti";
import "./Main.css";

function Main() {
  const navigate = useNavigate();

  // Settings
  const timerDuration = 90; // Par défaut 1m30
  const killerTimerDuration = 5; // Durée pour maintenir le bouton killer
  const killerCooldown = 20; // Cooldown de 20s pour le bouton killer
  const playerTimerRate = [1, 1.7, 2.1, 2.2]; // the original rate
  // const playerTimerRate = [0, 1, 1.5, 2, 2.5];

  const [count, setCount] = useState(timerDuration);
  const [killerCount, setKillerCount] = useState(killerTimerDuration);
  const [cooldownCount, setCooldownCount] = useState(killerCooldown);
  const [activePlayers, setActivePlayers] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isKillerActive, setIsKillerActive] = useState(false);
  const [isKillerCooldown, setIsKillerCooldown] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const killerIntervalRef = useRef<number | null>(null);

  const calculateInterval = () => {
    if (isKillerActive) return killerTimerDuration * 1000;
    if (isKillerCooldown) return killerCooldown * 1000;
    if (activePlayers === 0) return null;
    const timeForPlayers = timerDuration / playerTimerRate[activePlayers];
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

  const getProgress = () => {
    return Math.round(((timerDuration - count) / timerDuration) * 100);
  };

  const updateTimer = () => {
    setCount((prevCount) => {
      if (prevCount <= 0) {
        setIsTimerRunning(false);
        showConfetti();
        return timerDuration;
      }
      return prevCount - 1;
    });
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isTimerRunning) return;

    if (activePlayers > 0) {
      const interval = calculateInterval();
      if (interval) {
        intervalRef.current = window.setInterval(updateTimer, interval);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activePlayers, isTimerRunning]);

  useEffect(() => {
    if (isKillerActive) {
      killerIntervalRef.current = window.setInterval(() => {
        setKillerCount((prev) => {
          if (prev <= 1) {
            handleKillerBonus();
            setIsKillerActive(false);
            setIsKillerCooldown(true);
            setKillerCount(killerTimerDuration);
            return killerTimerDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (killerIntervalRef.current) clearInterval(killerIntervalRef.current);
    };
  }, [isKillerActive]);

  useEffect(() => {
    if (isKillerCooldown) {
      const cooldownInterval = window.setInterval(() => {
        setCooldownCount((prev) => {
          if (prev <= 1) {
            setIsKillerCooldown(false);
            setCooldownCount(killerCooldown);
            clearInterval(cooldownInterval);
            return killerCooldown;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(cooldownInterval);
    }
  }, [isKillerCooldown]);

  const handleKillerBonus = () => {
    setCount((prevCount) => {
      const bonus = Math.floor(timerDuration * 0.2); // 20% de 90s = 18s
      return Math.min(prevCount + bonus, timerDuration);
    });
  };

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
    disabled: !isTimerRunning || isKillerActive,
  };

  const killerButtonProps = {
    onMouseDown: handleKillerMouseDown,
    onMouseUp: handleKillerMouseUp,
    onMouseLeave: handleKillerMouseUp,
    onTouchStart: handleKillerMouseDown,
    onTouchEnd: handleKillerMouseUp,
    disabled: !isTimerRunning || isKillerCooldown || activePlayers > 0,
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
        <button
          className="settings-button"
          onClick={() => navigate("/settings")}
        >
          <SlSettings size={"20px"} />
        </button>
        <div className={`app-container ${!isTimerRunning ? "time-out" : ""}`}>
          <div>
            <button className="btn-killer" {...killerButtonProps}>
              Killer
            </button>
            {isKillerActive ? (
              <p>💀 Hold for: {formatTime(killerCount)}</p>
            ) : (
              isKillerCooldown && (
                <p className="cooldown">
                  💀 Cooldown: {formatTime(cooldownCount)}
                </p>
              )
            )}
          </div>
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
            <p className="progress">
              {getTimerIcon()} {formatTime(count)}
              <progress value={getProgress() / 100} />{" "}
              <span>{getProgress()}%</span>
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

export default Main;
