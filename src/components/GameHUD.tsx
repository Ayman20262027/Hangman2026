/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Difficulty, DIFFICULTY_CONFIGS, GameMode } from '../types/game';
import { Volume2, VolumeX, Pause, BarChart2, Lightbulb, Clock, Skull } from 'lucide-react';

interface GameHUDProps {
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  score: number;
  streak: number;
  mode: GameMode;
  timeLeft: number;
  hintsLeft: number;
  onUseHint: () => void;
  onPause: () => void;
  onOpenStats: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  difficulty,
  mistakes,
  maxMistakes,
  score,
  streak,
  mode,
  timeLeft,
  hintsLeft,
  onUseHint,
  onPause,
  onOpenStats,
  isMuted,
  onToggleMute,
}) => {
  const diffConfig = DIFFICULTY_CONFIGS[difficulty];
  const mistakesLeft = Math.max(0, maxMistakes - mistakes);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between select-none z-20">
      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between">
        {/* Left cluster: Difficulty & Mistakes */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Difficulty indicator */}
          <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{diffConfig.label}</span>
          </div>

          {/* Mistakes status */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-700/80 text-xs font-mono">
            <Skull className={`w-3.5 h-3.5 ${mistakesLeft <= 1 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-slate-400">Mistakes:</span>
            <span
              className={`font-bold tabular-nums ${
                mistakesLeft <= 1 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {mistakes} / {maxMistakes}
            </span>
          </div>

          {/* Visual skull knot pips */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: maxMistakes }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < mistakes ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]' : 'bg-slate-700/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center: Timer (if Time Attack) */}
        {mode === 'TIME_ATTACK' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-950/40 border border-rose-800/60 text-xs font-mono pointer-events-auto">
            <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span className="text-rose-300 font-bold tabular-nums text-sm">
              {Math.max(0, Math.ceil(timeLeft))}s
            </span>
          </div>
        )}

        {/* Right cluster: Score, Streak, Hints & Controls */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-300 flex items-center gap-1">
              <span>🔥</span>
              <span className="tabular-nums font-bold">{streak}</span>
            </div>
          )}

          {/* Score */}
          <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300">
            <span className="text-slate-500 mr-1">PTS:</span>
            <span className="font-bold tabular-nums text-amber-400">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Hint button */}
          <button
            onClick={onUseHint}
            disabled={hintsLeft <= 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              hintsLeft > 0
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed'
            }`}
            title="Reveal one unguessed letter (Press H)"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="tabular-nums">{hintsLeft} Hints</span>
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors cursor-pointer"
            title="Statistics"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors cursor-pointer"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors cursor-pointer"
            title="Pause Game (Esc)"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
