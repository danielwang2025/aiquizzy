import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Pause, Text, Timer, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

const splitText = (text: string): string[] => {
  return text
    .replace(/\s+/g, " ")
    .split("")
    .reduce((acc: string[], char, i, arr) => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        acc.push(char);
      } else if (char === " ") {
        acc.push(" ");
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
              Speed Reading Game
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight gradient-text">
              Speed Reading Game
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enter your English or Chinese text then set how many words/chars per minute to practice. <br />
              Control the reading pace to improve your speed!
            </p>
          </motion.div>
          <div className="glass-effect rounded-2xl overflow-hidden border border-white/20 shadow-lg">
            <div className="w-full max-w-2xl mx-auto p-0 md:p-8 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-end w-full">
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="input-text" className="flex items-center gap-2 text-sm font-medium mb-1 text-foreground">
                    <Text className="w-4 h-4 text-muted-foreground" />
                    Input Text
                  </label>
                  <Input
                    id="input-text"
                    className="text-base"
                    type="text"
                    placeholder="Type your text (English or Chinese) here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                    autoFocus
                    spellCheck={false}
                  />
                </div>
                <div className="md:w-40 flex flex-col gap-2">
                  <label htmlFor="wpm-input" className="flex items-center gap-2 text-sm font-medium mb-1 text-foreground">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    Words/Min
                  </label>
                  <Input
                    id="wpm-input"
                    type="number"
                    className="text-base"
                    min={10}
                    max={3000}
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    disabled={disabled}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="flex gap-3 w-full items-center justify-center mt-2">
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
                  <RotateCw className="mr-1 w-5 h-5" />
                  Reset
                </Button>
              </div>
              <div className="w-full mt-2 bg-black/95 rounded-xl min-h-[120px] flex items-center justify-center border border-white/10 shadow-inner px-2 py-8 md:py-10 max-h-52 transition-all duration-300">
                {started && words.length > 0 ? (
                  <span className="text-5xl md:text-6xl font-bold text-white animate-fade-in transition-all duration-200 select-none font-mono tracking-wide">
                    {words[currentIndex]}
                  </span>
                ) : (
                  <span className="text-lg text-gray-400 py-4 transition-all text-center w-full">
                    Type your text above and click <b>Start</b> to begin!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;
