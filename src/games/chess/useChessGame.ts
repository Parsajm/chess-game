import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

export type ChessGameState = {
  fen: string;
  turn: 'w' | 'b';
  isGameOver: boolean;
  winner: 'w' | 'b' | null;
  checkmate: boolean;
  stalemate: boolean;
  moveHistory: string[];
};

export const useChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const getGameState = useCallback((): ChessGameState => {
    const chess = game;
    return {
      fen: chess.fen(),
      turn: chess.turn(),
      isGameOver: chess.isGameOver(),
      winner: chess.isCheckmate() ? (chess.turn() === 'w' ? 'b' : 'w') : null,
      checkmate: chess.isCheckmate(),
      stalemate: chess.isStalemate(),
      moveHistory: [...moveHistory],
    };
  }, [game, moveHistory]);

  const makeMove = useCallback((from: string, to: string): boolean => {
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from: from as Square, to: to as Square, promotion: 'q' });

      if (move) {
        setGame(newGame);
        setMoveHistory(prev => [...prev, move.san]);
        setSelectedSquare(null);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, [game]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setMoveHistory([]);
    setSelectedSquare(null);
  }, []);

  const selectSquare = useCallback((square: string) => {
    const state = getGameState();

    if (state.isGameOver) return;

    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const success = makeMove(selectedSquare, square);
      if (!success) {
        setSelectedSquare(null);
      }
    }
  }, [selectedSquare, game, makeMove, getGameState]);

  const makeMoveFromSan = useCallback((san: string): boolean => {
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move(san);

      if (move) {
        setGame(newGame);
        setMoveHistory(prev => [...prev, move.san]);
        setSelectedSquare(null);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, [game]);

  return {
    game,
    gameState: getGameState(),
    selectedSquare,
    makeMove: selectSquare,
    makeMoveFromSan,
    resetGame,
    getValidMovesFromSquare: (square: string) => {
      const moves = game.moves({ verbose: true });
      return moves.filter(m => m.from === square).map(m => m.to);
    },
  };
};