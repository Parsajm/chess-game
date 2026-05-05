import { Chess } from 'chess.js';

// Piece values for AI evaluation
const PIECE_VALUES: Record<string, number> = {
  'p': 10,   // pawn
  'n': 30,   // knight
  'b': 30,   // bishop
  'r': 50,   // rook
  'q': 90,   // queen
  'k': 900,  // king
};

export type Difficulty = 'easy' | 'medium' | 'hard';

// Get random legal move (Easy AI)
export const getRandomMove = (game: Chess): string | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex].san;
};

// Get capture move (Medium AI - prioritizes capturing high-value pieces)
export const getCaptureMove = (game: Chess, difficulty: 'medium' | 'hard'): string | null => {
  const moves = game.moves({ verbose: true });

  // Separate capture and non-capture moves
  const captureMoves = moves.filter(move => move.captured);
  const nonCaptureMoves = moves.filter(move => !move.captured);

  if (captureMoves.length > 0) {
    // Sort captures by captured piece value (highest first)
    captureMoves.sort((a, b) => {
      const valueA = PIECE_VALUES[a.captured?.toLowerCase() || 'p'] || 0;
      const valueB = PIECE_VALUES[b.captured?.toLowerCase() || 'p'] || 0;
      return valueB - valueA;
    });

    // For hard difficulty, only take top capture; for medium, sometimes take random capture
    if (difficulty === 'hard') {
      return captureMoves[0].san;
    } else {
      // Medium: 70% chance to take best capture, 30% chance random capture
      const takeBest = Math.random() < 0.7;
      if (takeBest) {
        return captureMoves[0].san;
      } else if (captureMoves.length > 1) {
        const randomIndex = Math.floor(Math.random() * captureMoves.length);
        return captureMoves[randomIndex].san;
      }
    }
  }

  // No good captures, choose random move
  if (nonCaptureMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * nonCaptureMoves.length);
    return nonCaptureMoves[randomIndex].san;
  }

  return null;
};

// Simple minimax for Hard AI (looks 2 moves ahead)
export const getBestMove = (game: Chess, depth: number = 2): string | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = moves[0].san;
  let bestValue = -Infinity;

  for (const move of moves) {
    // Try move
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move.san);

    // Evaluate position
    const moveValue = minimax(gameCopy, depth - 1, false, -Infinity, Infinity);

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move.san;
    }
  }

  return bestMove;
};

// Minimax algorithm with alpha-beta pruning
const minimax = (
  game: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move.san);
      const evaluation = minimax(gameCopy, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move.san);
      const evaluation = minimax(gameCopy, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
};

// Evaluate board position (positive = good for AI/black, negative = good for player/white)
const evaluateBoard = (game: Chess): number => {
  if (game.isCheckmate()) {
    // If game is over and it's AI's turn (black), AI lost
    return game.turn() === 'b' ? -10000 : 10000;
  }
  if (game.isStalemate()) return 0;

  let evaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = PIECE_VALUES[piece.type];
        // Black pieces = AI, White pieces = Player
        if (piece.color === 'b') {
          evaluation += value;
        } else {
          evaluation -= value;
        }
      }
    }
  }

  return evaluation;
};

// Main AI move function
export const getAIMove = (game: Chess, difficulty: Difficulty): string | null => {
  const moves = game.moves();
  console.log(`AI available moves (${difficulty}):`, moves.length); // Debug

  if (moves.length === 0) return null;

  let aiMove: string | null = null;

  switch (difficulty) {
    case 'easy':
      aiMove = getRandomMove(game);
      break;
    case 'medium':
      aiMove = getCaptureMove(game, 'medium');
      break;
    case 'hard':
      aiMove = getBestMove(game, 2);
      break;
    default:
      aiMove = getRandomMove(game);
  }

  console.log("AI selected move:", aiMove);
  return aiMove;
};