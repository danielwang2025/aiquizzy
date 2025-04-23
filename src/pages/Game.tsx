
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Pause, Reset, Text, Timer } from "lucide-react";

const splitText = (text: string): string[] => {
  // Split by Chinese character or English words
  return text
    .replace(/\s+/g, " ")
    .split("")
    .reduce((acc: string[], char, i, arr) => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        acc.push(char);
      } else if (char === " ") {
        acc.push(" ");
      } else {
        // Merge continuous English letters/numbers as a word
        if (
          acc.length > 0 &&
          /[a-zA-Z0-9]/.test(char) &&
          /[a-zA-Z0-9]/.test(acc[acc.length - 1])
        ) {
          acc[acc.length - 1] += char;
        } else if (/[a-zA-Z0-9]/.test(char)) {
          acc.push(char);
        }
      }
      return acc;
    }, [])
    .filter((it) => it !== " ");
};

const Game = () => {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(200);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (started && !paused && words.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((idx) =>
          idx < words.length - 1 ? idx + 1 : idx
        );
      }, 60000 / wpm);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (paused || !started) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [started, paused, wpm, words]);

  const handleStart = () => {
    if (!text.trim()) return;
    setWords(splitText(text.trim()));
    setCurrentIndex(0);
    setStarted(true);
    setPaused(false);
  };

  const handlePause = () => setPaused((p) => !p);
  const handleReset = () => {
    setStarted(false);
    setPaused(false);
    setCurrentIndex(0);
  };

  const disabled = started;

  return (
    <div className="max-w-2xl w-full mx-auto my-12 p-0 flex flex-col items-center justify-center">
      <div className="w-full rounded-2xl bg-card shadow-card border border-border md:p-8 px-2 py-6 flex flex-col gap-7 items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gradient">
          Speed Reading Game
        </h2>
        <p className="text-muted-foreground text-center text-base mb-2 max-w-xl">
          Enter your own English or Chinese text. Set how many words/chars per minute you want to practice speed reading.<br />
          <span className="text-xs text-muted-foreground">
            Each word (English) or character (Chinese) will appear one by one with the interval controlled by you.
          </span>
        </p>
        <div className="w-full flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground font-medium mb-1" htmlFor="input-text">
              <Text className="w-4 h-4 text-muted-foreground" />
              Input Text
            </label>
            <Input
              id="input-text"
              className="text-base mobile-input"
              type="text"
              placeholder="Type your text (English or Chinese) here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2 md:w-44">
            <label className="flex items-center gap-2 text-sm text-foreground font-medium mb-1" htmlFor="wpm-input">
              <Timer className="w-4 h-4 text-muted-foreground" />
              Words/Min
            </label>
            <Input
              id="wpm-input"
              type="number"
              className="w-full text-base mobile-input"
              min={10}
              max={3000}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              disabled={disabled}
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="flex gap-3 w-full items-center justify-center">
          <Button
            onClick={handleStart}
            disabled={!text.trim() || started}
            size="lg"
            className="btn-scale btn-3d"
          >
            <Play className="mr-1 w-5 h-5" />
            Start
          </Button>
          <Button
            variant="secondary"
            onClick={handlePause}
            disabled={!started}
            size="lg"
            className="btn-scale btn-3d"
          >
            <Pause className="mr-1 w-5 h-5" />
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            size="lg"
            className="btn-scale btn-3d"
          >
            <Reset className="mr-1 w-5 h-5" />
            Reset
          </Button>
        </div>
        <div className="w-full mt-4 bg-black/95 rounded-xl min-h-[120px] flex items-center justify-center border border-white/10 shadow-inner px-2 py-8 md:py-10 max-h-52">
          {started && words.length > 0 ? (
            <span className="text-5xl md:text-6xl font-bold text-white animate-fade-in transition-all duration-200 select-none font-mono tracking-wide">
              {words[currentIndex]}
            </span>
          ) : (
            <span className="text-lg text-gray-400 py-4 transition-all">
              Type your text and click <b>Start</b> to begin!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;

