"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [displayTime, setDisplayTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [sessionTime, setSessionTime] = useState(25 * 60);
  const [timerOn, setTimerOn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  const playBreakSound = (action) => {
    const audioElement = document.getElementById("beep");
    switch (action) {
      case "play":
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.play();
        }
        break;
      case "stop":
        audioElement.pause();
        audioElement.currentTime = 0;
    }
  };

  const formatTime = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const changeTime = (amount, type) => {
    switch (type) {
      case "break":
        if ((breakTime <= 60 && amount < 0) || (breakTime >= 3600 && amount > 0)) {
          break;
        }
        setBreakTime((prev) => prev + amount);
        break;
      case "session":
        if ((sessionTime <= 60 && amount < 0) || (sessionTime >= 3600 && amount > 0)) {
          break;
        }
        setSessionTime((prev) => prev + amount);
        if (!timerOn) {
          setDisplayTime(sessionTime + amount);
        }
        break;
    }
  };

  const controlTime = (action) => {
    let second = 1000;
    let date = new Date().getTime();
    let nextDate = new Date().getTime() + second;
    let onBreakVariable = onBreak;

    if (action == "reset") {
      clearInterval(localStorage.getItem("interval-id"));
      setTimerOn(false);
      localStorage.clear();
    } else {
      if (!timerOn) {
        let interval = setInterval(() => {
          date = new Date().getTime();
          if (date > nextDate) {
            setDisplayTime((prev) => {
              if (prev <= 0 && !onBreakVariable) {
                playBreakSound("play");
                onBreakVariable = true;
                setOnBreak(true);
                return breakTime;
              } else if (prev <= 0 && onBreakVariable) {
                playBreakSound("play");
                onBreakVariable = false;
                setOnBreak(false);
                return sessionTime;
              }
              return prev - 1;
            });
            nextDate += second;
          }
        }, 30);
        localStorage.clear();
        localStorage.setItem("interval-id", interval);
      }

      if (timerOn) {
        clearInterval(localStorage.getItem("interval-id"));
      }
    }

    setTimerOn(!timerOn);
  };

  const resetTime = () => {
    controlTime("reset");
    setOnBreak(false);
    setDisplayTime(25 * 60);
    setBreakTime(5 * 60);
    setSessionTime(25 * 60);
    playBreakSound("stop");
  };

  return (
    <main className={styles.main}>
      <h1>Pomodoro Timer</h1>
      <div>
        <BreakLength title={"Break Length"} changeTime={changeTime} type={"break"} time={breakTime} formatTime={formatTime} />
        <SessionLength title={"Session Length"} changeTime={changeTime} type={"session"} time={sessionTime} formatTime={formatTime} />
        <audio name="beep" src="./stab_keys_birds.wav" id="beep"></audio>
      </div>
      <h3 id="timer-label">{onBreak ? "Playtime" : "Work time"}</h3>
      <h1 id="time-left">{formatTime(displayTime)}</h1>
      <button id="start_stop" onClick={controlTime}>
        Play/Pause
      </button>
      <button id="reset" onClick={resetTime}>
        Reset
      </button>
    </main>
  );
}

function BreakLength({ title, changeTime, type, time, formatTime }) {
  return (
    <div>
      <h3 id="break-label">{title}</h3>
      <div className="time-sets">
        <button id="break-decrement" onClick={() => changeTime(-60, type)}>
          Less
        </button>
        <h3 id="break-length">{time / 60}</h3>
        <button id="break-increment" onClick={() => changeTime(60, type)}>
          More
        </button>
      </div>
    </div>
  );
}

function SessionLength({ title, changeTime, type, time, formatTime }) {
  return (
    <div>
      <h3 id="session-label">{title}</h3>
      <div className="time-sets">
        <button id="session-decrement" onClick={() => changeTime(-60, type)}>
          Less
        </button>
        <h3 id="session-length">{time / 60}</h3>
        <button id="session-increment" onClick={() => changeTime(60, type)}>
          More
        </button>
      </div>
    </div>
  );
}
