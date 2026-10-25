/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameStats, Difficulty } from '../types/game';
import { soundEngine } from '../utils/audio';
import { X, Trophy, Target, Award, RotateCcw, BookOpen } from 'lucide-react';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose, onResetStats }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const winRate =
    stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0;
  const avgGuesses =
    stats.totalGames > 0 ? (stats.totalGuesses / stats.totalGames).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-amber-200">
              Player Codex & Statistics
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable stats body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Core Metrics Quad Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Games Won
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">
                {stats.gamesWon}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {winRate}% Win Rate
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Games Lost
              </span>
              <span className="text-2xl font-mono font-bold text-rose-400 mt-1 tabular-nums">
                {stats.gamesLost}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {stats.totalGames} Total
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Avg Guesses
              </span>
              <span className="text-2xl font-mono font-bold text-amber-300 mt-1 tabular-nums">
                {avgGuesses}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Per Game
              </span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Streak / Max
              </span>
              <span className="text-2xl font-mono font-bold text-amber-400 mt-1 tabular-nums">
                {stats.currentStreak}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Best: {stats.bestStreak}
              </span>
            </div>
          </div>

          {/* Breakdown by Difficulty Tier */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Record by Difficulty</span>
            </h3>

            <div className="space-y-2">
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => {
                const diffData = stats.statsByDifficulty[diff] || { won: 0, lost: 0, totalGuesses: 0 };
                const totalPlayed = diffData.won + diffData.lost;
                const diffAvg =
                  totalPlayed > 0 ? (diffData.totalGuesses / totalPlayed).toFixed(1) : '0.0';
                const label = diff === 'EASY' ? 'Easy (4–6 Letters)' : diff === 'MEDIUM' ? 'Medium (7–9 Letters)' : 'Hard (9+ Letters)';

                return (
                  <div
                    key={diff}
                    className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-700/40 rounded-lg text-xs"
                  >
                    <span className="font-medium text-slate-200">{label}</span>
                    <div className="flex items-center gap-4 text-slate-400 font-mono">
                      <span>
                        <strong className="text-emerald-400 tabular-nums">{diffData.won}W</strong> -{' '}
                        <strong className="text-rose-400 tabular-nums">{diffData.lost}L</strong>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Avg: <strong className="text-amber-300 tabular-nums">{diffAvg}</strong> guesses
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discovered Words Archive */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Discovered Words Archive ({stats.wordsDiscovered?.length || 0})
              </span>
            </h3>

            {stats.wordsDiscovered && stats.wordsDiscovered.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                {stats.wordsDiscovered.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-800 text-amber-200/90 rounded text-[11px] font-mono border border-slate-700"
                  >
                    {w}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 text-center">
                Solve words in any difficulty tier to catalogue them in your archive.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Reset all recorded stats?</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onResetStats();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Statistics</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
