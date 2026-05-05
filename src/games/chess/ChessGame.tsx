import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Users, Sparkles, Crown, Target, Zap } from 'lucide-react';
import { useChessGame } from './useChessGame';
import ChessBoard from '../../components/ChessBoard';
import MoveHistory from '../../components/MoveHistory';
import { getAIMove } from './chessAI';
import type { Difficulty } from './chessAI';

const ChessGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<'two-player' | 'vs-ai'>('vs-ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const {
    gameState,
    selectedSquare,
    makeMove,
    resetGame: resetGameState,
    getValidMovesFromSquare,
    game,
    makeMoveFromSan
  } = useChessGame();

  const resetGame = () => {
    resetGameState();
    setLastMove(null);
    setShowConfetti(false);
  };

  const validMoves = selectedSquare
    ? getValidMovesFromSquare(selectedSquare)
    : [];

  // Custom move handler to track last move
  const handleMove = (square: string) => {
    makeMove(square);
    // Note: In a real implementation you'd track the actual move
  };

  // AI Move Effect
  useEffect(() => {
    if (gameMode === 'vs-ai' && !gameState.isGameOver && gameState.turn === 'b') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(game, difficulty);
        if (aiMove) {
          makeMoveFromSan(aiMove);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameMode, gameState.isGameOver, difficulty, game, makeMoveFromSan]);

  // Show confetti on win
  useEffect(() => {
    if (gameState.isGameOver && gameState.checkmate && gameState.winner === 'w') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.checkmate, gameState.winner]);

  // Difficulty icons and colors
  const difficultyConfig = {
    easy: { icon: Target, color: 'green', label: 'Easy', description: 'Random moves' },
    medium: { icon: Zap, color: 'yellow', label: 'Medium', description: 'Smart captures' },
    hard: { icon: Crown, color: 'red', label: 'Hard', description: 'Strategic thinking' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative py-8">
        <div className="container mx-auto px-4">
          {/* Title */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ♜ Chess Master ♛
            </h1>
            <p className="text-gray-400 mt-2">Challenge yourself against AI or a friend</p>
          </motion.div>

          {/* Game Controls */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap gap-4 justify-center"
          >
            <div className="flex gap-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <button
                onClick={() => {
                  setGameMode('two-player');
                  resetGame();
                }}
                className={`px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  gameMode === 'two-player' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                Two Player
              </button>
              <button
                onClick={() => {
                  setGameMode('vs-ai');
                  resetGame();
                }}
                className={`px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  gameMode === 'vs-ai' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Cpu className="w-4 h-4" />
                vs AI
              </button>
            </div>

            {gameMode === 'vs-ai' && (
              <div className="flex gap-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
                  const config = difficultyConfig[diff];
                  const Icon = config.icon;
                  return (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        difficulty === diff 
                          ? `bg-${config.color}-600 text-white shadow-lg scale-105` 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{config.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              New Game
            </button>
          </motion.div>

          {/* Main Game Area */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 max-w-2xl"
            >
              <ChessBoard
                fen={gameState.fen}
                onSquareClick={handleMove}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                turn={gameState.turn}
                isGameOver={gameState.isGameOver}
                lastMove={lastMove}
              />

              {/* AI Thinking Indicator */}
              <AnimatePresence>
                {!gameState.isGameOver && gameMode === 'vs-ai' && gameState.turn === 'b' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 text-center"
                  >
                    <div className="inline-flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-blue-400 font-medium">🤖 AI is thinking...</span>
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over Message */}
              <AnimatePresence>
                {gameState.isGameOver && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-6 text-center"
                  >
                    <div className="inline-block bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                      {gameState.checkmate ? (
                        <div>
                          <div className="text-5xl mb-3">🏆</div>
                          <p className="text-2xl font-bold text-white">
                            {gameState.winner === 'w' ? 'Congratulations! You won! 🎉' : 'AI wins! Better luck next time! 🤖'}
                          </p>
                          <p className="text-gray-300 mt-2">Checkmate!</p>
                        </div>
                      ) : gameState.stalemate ? (
                        <div>
                          <div className="text-5xl mb-3">🤝</div>
                          <p className="text-2xl font-bold text-yellow-400">Stalemate!</p>
                          <p className="text-gray-300 mt-2">The game is drawn.</p>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full lg:w-96"
            >
              <MoveHistory moves={gameState.moveHistory} onReset={resetGame} />

              {/* Game Stats */}
              <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Moves:</span>
                  <span className="text-white font-bold">{gameState.moveHistory.length}</span>
                </div>
                {gameMode === 'vs-ai' && (
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400">AI Difficulty:</span>
                    <span className={`text-${difficultyConfig[difficulty].color}-400 font-bold`}>
                      {difficultyConfig[difficulty].label}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confetti effect (simplified) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360 * (Math.random() * 2)
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: "linear"
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                left: Math.random() * window.innerWidth
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChessGame;