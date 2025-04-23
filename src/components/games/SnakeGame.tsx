
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Apple, Carrot, Banana, Cookie } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type FoodType = 'apple' | 'carrot' | 'banana' | 'cookie';

const GRID_SIZE = 15;
const CELL_SIZE = 25;
const INITIAL_SPEED = 200;

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position & { type: FoodType }>({ x: 5, y: 5, type: 'apple' });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const foodIcons = {
    apple: <Apple className="w-5 h-5 text-red-500" />,
    carrot: <Carrot className="w-5 h-5 text-orange-500" />,
    banana: <Banana className="w-5 h-5 text-yellow-500" />,
    cookie: <Cookie className="w-5 h-5 text-amber-700" />
  };

  const generateFood = useCallback(() => {
    const types: FoodType[] = ['apple', 'carrot', 'banana', 'cookie'];
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      type: types[Math.floor(Math.random() * types.length)]
    };
    setFood(newFood);
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Prevent default scrolling behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
    
    switch (event.key) {
      case 'ArrowUp':
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
        break;
      case 'ArrowDown':
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
        break;
      case 'ArrowLeft':
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
        break;
      case 'ArrowRight':
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
        break;
    }
  }, []);

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % GRID_SIZE;
          break;
      }

      // Check if snake hits itself
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      newSnake.unshift(head);
      return newSnake;
    });
  }, [direction, food, generateFood, gameOver, isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    generateFood();
    setIsPlaying(true);
  };

  const handleDirectionClick = (newDirection: Direction) => {
    switch (newDirection) {
      case 'UP':
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
        break;
      case 'DOWN':
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
        break;
      case 'LEFT':
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
        break;
      case 'RIGHT':
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
        break;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="text-2xl font-bold"
          initial={{ scale: 1 }}
          animate={{ scale: score > 0 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          Score: {score}
        </motion.div>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-red-500 font-bold"
          >
            Game Over!
          </motion.div>
        )}
      </div>

      <div 
        className="relative bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 shadow-inner"
        style={{ 
          width: GRID_SIZE * CELL_SIZE + 32,
          height: GRID_SIZE * CELL_SIZE + 32
        }}
      >
        {/* Render snake */}
        {snake.map((segment, index) => (
          <motion.div
            key={index}
            className="absolute bg-primary rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 16,
              top: segment.y * CELL_SIZE + 16,
            }}
          />
        ))}

        {/* Render food */}
        <motion.div
          className="absolute"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            left: food.x * CELL_SIZE + 16,
            top: food.y * CELL_SIZE + 16,
          }}
        >
          {foodIcons[food.type]}
        </motion.div>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden grid grid-cols-3 gap-2 mt-4">
        <div></div>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick('UP')}
          className="p-2"
        >
          ⬆️
        </Button>
        <div></div>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick('LEFT')}
          className="p-2"
        >
          ⬅️
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick('DOWN')}
          className="p-2"
        >
          ⬇️
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDirectionClick('RIGHT')}
          className="p-2"
        >
          ➡️
        </Button>
      </div>

      <div className="flex gap-4 mt-4">
        <Button 
          onClick={resetGame}
          className="btn-scale btn-3d"
        >
          {gameOver ? "Play Again" : "Start Game"}
        </Button>
      </div>
    </div>
  );
};

export default SnakeGame;
