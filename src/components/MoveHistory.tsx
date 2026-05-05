import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RefreshCw } from 'lucide-react';

interface MoveHistoryProps {
  moves: string[];
  onReset?: () => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, onReset }) => {
  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-bold text-lg">Move History</h3>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Reset game"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto p-2">
        <AnimatePresence>
          {movePairs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 text-sm">No moves yet</p>
              <p className="text-gray-600 text-xs mt-1">Make the first move!</p>
            </motion.div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {movePairs.map(([white, black], idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="text-gray-400 py-2 pl-2 pr-3 font-mono text-xs">
                      {idx + 1}.
                    </td>
                    <td className="text-white py-2 pr-4 font-medium">
                      {white}
                     </td>
                    <td className="text-white py-2 font-medium">
                      {black || '—'}
                     </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoveHistory;