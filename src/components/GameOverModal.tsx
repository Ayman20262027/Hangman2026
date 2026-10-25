/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WordItem, Difficulty } from '../types/game';
import { soundEngine } from '../utils/audio';
import { Trophy, Skull, RotateCcw, ArrowRight, BookOpen, BarChart2 } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  wordItem: WordItem;
  guessesCount: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  scoreGained: number;
  streak: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onTitleMenu: () => void;
  onOpenStats: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  wordItem,
  guessesCount,
  mistakes,
  maxMistakes,
  hintsUsed,
  scoreGained,
  streak,
  difficulty,
  onPlayAgain,
  onTitleMenu,
  onOpenStats,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col">
        {/* Status banner */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
          <div className="mb-2">
            {isVictory ? (
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Skull className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2
            className={`text-2xl md:text-3xl font-serif font-black tracking-wide ${
              isVictory ? 'text-emerald-300' : 'text-rose-400'
            }`}
          >
            {isVictory ? 'TRIAL SURVIVED' : 'THE GALLOWS CLAIMS YOU'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isVictory
              ? 'You discerned the cipher and cheated the rope.'
              : 'The scaffold trap sprang before the word was revealed.'}
          </p>
        </div>

        {/* Word Reveal & Lore */}
        <div className="py-4 space-y-3">
          <div className="flex flex-col items-center p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              The Mystery Word
            </span>
            <span className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-amber-300 mt-1">
              {wordItem.word}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              {wordItem.category} · {difficulty}
            </span>
          </div>

          {/* Fun Fact / Etymology Lore */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lore & Fun Fact</span>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed italic">
              {wordItem.funFact}
            </p>
          </div>

          {/* Round Stats Strip */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 bg-slate-800/50 rounded-lg text-center border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Guesses</span>
              <span className="text-sm font-mono font-bold text-slate-200 tabular-nums">
                {guessesCount}
              </span>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Mistakes</span>
              <span className="text-sm font-mono font-bold text-rose-400 tabular-nums">
                {mistakes}/{maxMistakes}
              </span>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Hints Used</span>
              <span className="text-sm font-mono font-bold text-amber-300 tabular-nums">
                {hintsUsed}
              </span>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Round Pts</span>
              <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                +{scoreGained}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlayAgain();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-serif font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
          >
            <span>NEXT TRIAL</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-[10px] font-mono opacity-80 bg-amber-950/20 px-1 py-0.5 rounded ml-1">
              [ENTER]
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenStats();
              }}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Statistics</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onTitleMenu();
              }}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Menu / Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
