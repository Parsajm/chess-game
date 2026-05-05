import React from 'react';
import { motion } from 'framer-motion';

interface ChessBoardProps {
  fen: string;
  onSquareClick: (square: string) => void;
  selectedSquare: string | null;
  validMoves: string[];
  turn: 'w' | 'b';
  isGameOver: boolean;
  lastMove?: { from: string; to: string } | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onSquareClick,
  selectedSquare,
  validMoves,
  turn,
  isGameOver,
  lastMove,
}) => {
  const getPieceAtSquare = (square: string): string | null => {
    const rows = fen.split(' ')[0].split('/');
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1]);

    if (rank < 0 || rank >= 8) return null;

    let col = 0;
    for (let i = 0; i < rows[rank].length; i++) {
      const char = rows[rank][i];
      if (/\d/.test(char)) {
        col += parseInt(char);
      } else {
        if (col === file) return char;
        col++;
      }
    }
    return null;
  };

  // Modern piece rendering with Unicode fallback
  const getPieceSymbol = (piece: string): string => {
    const symbols: Record<string, string> = {
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    };
    return symbols[piece] || '';
  };

  // Get piece color class for styling
  const getPieceColorClass = (piece: string): string => {
    return piece === piece.toUpperCase() ? 'text-white drop-shadow-lg' : 'text-gray-900 drop-shadow-lg';
  };

  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const isLastMove = (square: string): boolean => {
    return lastMove ? (lastMove.from === square || lastMove.to === square) : false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game status bar */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${turn === 'w' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-white font-semibold">
              {isGameOver ? (
                <span className="text-red-400">Game Over</span>
              ) : (
                <span>{turn === 'w' ? 'White to move' : 'Black to move'}</span>
              )}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {turn === 'w' ? '♔ White' : '♚ Black'}
          </div>
        </div>
      </div>

      {/* Chess board with animation */}
      <div className="relative">
        <div className="grid grid-cols-8 border-2 border-gray-700 shadow-2xl rounded-lg overflow-hidden">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const piece = getPieceAtSquare(square);
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isValidMove = validMoves.includes(square);
              const isLastMoveSquare = isLastMove(square);

              return (
                <motion.button
                  key={square}
                  onClick={() => onSquareClick(square)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    aspect-square relative flex items-center justify-center
                    text-5xl md:text-6xl font-bold transition-all duration-150
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-inset z-10 shadow-inner' : ''}
                    ${isValidMove ? 'cursor-pointer' : 'cursor-pointer'}
                    ${isLastMoveSquare ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                    hover:brightness-95
                  `}
                >
                  {/* Valid move indicator */}
                  {isValidMove && !piece && (
                    <div className="absolute w-4 h-4 rounded-full bg-green-500 opacity-75 animate-pulse" />
                  )}

                  {/* Capture indicator */}
                  {isValidMove && piece && (
                    <div className="absolute inset-0 bg-red-500 opacity-30 rounded-full animate-ping" />
                  )}

                  {/* Piece with animation */}
                  {piece && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative z-10 ${getPieceColorClass(piece)}`}
                    >
                      {getPieceSymbol(piece)}
                    </motion.div>
                  )}

                  {/* Coordinate labels */}
                  {fileIdx === 0 && (
                    <span className="absolute bottom-0.5 left-1 text-[10px] opacity-40 font-mono">
                      {rank}
                    </span>
                  )}
                  {rankIdx === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[10px] opacity-40 font-mono">
                      {file}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;