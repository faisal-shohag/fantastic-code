"use client"
import { useTimerContext } from "@/providers/timer-provider";
import { GoStopwatch } from "react-icons/go";
import { BsFillPauseFill } from "react-icons/bs";
import { TiMediaStop } from "react-icons/ti";
import { IoPlay } from "react-icons/io5";
import { useState } from "react";

const Timer = () => {
  const { time, start, pause, reset, restart } = useTimerContext();
  const [isStarted, setIsStarted] = useState(false);
  const [isPause, setIsPause] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 transition-all duration-500">
      {!isStarted && (
        <span
          className="bg-zinc-800 flex justify-center items-center px-2 rounded cursor-pointer py-1 transition-transform duration-300 hover:scale-110"
          onClick={() => {
            start();
            setIsStarted(true);
          }}
        >
          <GoStopwatch />
        </span>
      )}
      {isStarted && (
        <div className="flex gap-[2px] items-center">
          {!isPause ? (
            <div
              onClick={() => {
                pause();
                setIsPause(true);
              }}
              className="cursor-pointer w-[35px] h-[25px] bg-zinc-900 flex justify-center items-center px-1 rounded "
            >
              <BsFillPauseFill size={20} />
            </div>
          ) : (
            <div
              onClick={() => {
                restart();
                setIsPause(false);
              }}
              className="cursor-pointer w-[35px] h-[25px] bg-zinc-900 flex justify-center items-center px-1 rounded "
            >
              <IoPlay size={18} />
            </div>
          )}
          <span
            className="w-[80px] h-[25px] text-center bg-zinc-900 px-2 rounded text-sm flex items-center justify-center font-gg-semi "
          >
            {formatTime(time)}
          </span>
          <div
            onClick={() => {
              reset();
              setIsStarted(false);
            }}
            className="cursor-pointer w-[35px] h-[25px] flex justify-center items-center bg-zinc-900 px-1 rounded "
          >
            <TiMediaStop size={20} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
