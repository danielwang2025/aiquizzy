
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const splitText = (text: string): string[] => {
  // 按中文字符或空格分割
  return text
    .replace(/\s+/g, " ")
    .split("")
    .reduce((acc: string[], char, i, arr) => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        acc.push(char);
      } else if (char === " ") {
        acc.push(" ");
      } else {
        // 合并连续英文到一个单词
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
  const [wpm, setWpm] = useState(200); // 默认200词/分钟
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

  return (
    <div className="max-w-xl mx-auto mt-8 bg-black rounded-xl p-6 shadow-lg flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white mb-6">速读游戏</h2>
      <div className="space-y-3">
        <Input
          className="text-base"
          type="text"
          placeholder="请输入要显示的文本（支持中英文）"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={started}
        />
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            className="w-32 text-base"
            min={10}
            max={3000}
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            disabled={started}
          />
          <span className="text-white text-sm">词/分钟</span>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStart} disabled={!text.trim() || started}>
            开始
          </Button>
          <Button
            variant="secondary"
            onClick={handlePause}
            disabled={!started}
          >
            {paused ? "继续" : "暂停"}
          </Button>
          <Button variant="destructive" onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-[160px] flex items-center justify-center">
        {started && words.length > 0 ? (
          <span className="text-5xl md:text-6xl font-bold text-white transition-all duration-200 animate-fade-in">
            {words[currentIndex]}
          </span>
        ) : (
          <span className="text-lg text-gray-400 py-8">
            请填写文本并点击“开始”
          </span>
        )}
      </div>
    </div>
  );
};

export default Game;
