/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WordItem, Difficulty } from '../types/game';
import { soundEngine } from '../utils/audio';
import { Users, Play, X } from 'lucide-react';

interface PassAndPlayModalProps {
  onStartCustomGame: (customWordItem: WordItem) => void;
  onClose: () => void;
}

export const PassAndPlayModal: React.FC<PassAndPlayModalProps> = ({
  onStartCustomGame,
  onClose,
}) => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('Player Challenge');
  const [hint, setHint] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [error, setError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = word.trim().toUpperCase();

    if (!cleanWord || cleanWord.length < 3) {
      setError('Secret word must be at least 3 letters.');
      return;
    }

    if (!/^[A-Z\s]+$/.test(cleanWord)) {
      setError('Only alphabetic letters and spaces are permitted.');
      return;
    }

    soundEngine.playClick();
    onStartCustomGame({
      id: `custom_${Date.now()}`,
      word: cleanWord,
      category: category.trim() || 'Player Riddle',
      difficulty: difficulty,
      hint: hint.trim() || 'A custom cipher crafted by Player 1.',
      funFact: `Player 1 crafted this mystery word for Player 2!`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-serif font-bold text-amber-200">
              Two-Player Pass & Play
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

        <form onSubmit={handleStart} className="space-y-4 py-4">
          <p className="text-xs text-slate-400">
            Player 1: Enter a secret word and optional riddle clue, then hand the screen to Player 2 to solve!
          </p>

          {/* Word Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
              Secret Word (Hidden from Player 2)
            </label>
            <input
              type="password"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setError('');
              }}
              placeholder="e.g. SATELLITE"
              maxLength={20}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-200 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
              autoFocus
            />
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
              Category / Topic
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Cinema, Secret Code, Food"
              maxLength={25}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Riddle Hint */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
              Optional Riddle Clue
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. Revolves high in the ionosphere"
              maxLength={80}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Difficulty Tier */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-serif font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:from-amber-500 hover:to-yellow-400 transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Pass to Player 2 & Begin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
