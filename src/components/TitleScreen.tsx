/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Difficulty, DIFFICULTY_CONFIGS, GameMode } from '../types/game';
import { soundEngine } from '../utils/audio';
import { CATEGORIES } from '../data/words';
import { Play, BarChart2, Volume2, VolumeX, Sparkles, Clock, Users } from 'lucide-react';

interface TitleScreenProps {
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  category: string;
  setCategory: (cat: string) => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenStats: () => void;
  onOpenPassAndPlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  difficulty,
  setDifficulty,
  category,
  setCategory,
  mode,
  setMode,
  onStartGame,
  onOpenStats,
  onOpenPassAndPlay,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between items-center p-6 md:p-10 select-none text-slate-100">
      {/* Top utility row */}
      <div className="w-full max-w-5xl flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-amber-500/80 font-mono">
            Word Puzzle Engine
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Verlet Simulation</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="View Player Records & Stats"
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Statistics</span>
          </button>

          <button
            onClick={() => {
              onToggleMute();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup with negative space */}
      <div className="flex flex-col items-center text-center my-auto max-w-3xl pointer-events-auto">
        {/* Bespoke inline SVG emblem */}
        <div className="mb-4">
          <svg
            className="w-16 h-16 md:w-20 md:h-20 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Gallows beam & noose silhouette */}
            <path d="M20 90 L80 90" stroke="#78350f" strokeWidth="4" />
            <path d="M35 90 L35 15 L75 15" stroke="#92400e" strokeWidth="4" />
            <path d="M35 35 L55 15" stroke="#92400e" strokeWidth="3" />
            <path d="M75 15 L75 32" stroke="#d97706" strokeWidth="3" />
            {/* Hanging lantern or key */}
            <circle cx="75" cy="42" r="8" stroke="#fbbf24" fill="#78350f" />
            <path d="M75 50 L75 70" stroke="#fbbf24" strokeWidth="3" />
            <path d="M63 58 L87 58" stroke="#fbbf24" strokeWidth="3" />
            <path d="M67 70 L83 70" stroke="#fbbf24" strokeWidth="3" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-md">
          HANGMAN
        </h1>
        <p className="mt-2 text-sm md:text-base tracking-[0.25em] uppercase text-amber-400/90 font-serif font-semibold">
          Cryptic Gallows
        </p>
        <p className="mt-3 text-xs md:text-sm text-slate-400 max-w-md mx-auto text-balance">
          Unravel the mystery word letter by letter before the scaffold claimed another soul.
        </p>

        {/* Difficulty Level Selector - Easy / Medium / Hard */}
        <div className="mt-7 w-full max-w-xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Difficulty Tier
            </span>
            <span className="text-xs font-mono text-amber-400">
              {DIFFICULTY_CONFIGS[difficulty].wordLengthGuide}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diffKey) => {
              const cfg = DIFFICULTY_CONFIGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  onClick={() => {
                    soundEngine.playClick();
                    setDifficulty(diffKey);
                  }}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-sm font-semibold tracking-wide ${
                        isSelected ? 'text-amber-300' : 'text-slate-200'
                      }`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cfg.maxMistakes} Mistakes
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {cfg.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Mode Selector Row */}
        <div className="mt-4 w-full max-w-xl flex flex-wrap gap-2.5 items-center justify-between">
          {/* Category Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={category}
              onChange={(e) => {
                soundEngine.playClick();
                setCategory(e.target.value);
              }}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-600 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Game Modes Segmented buttons */}
          <div className="flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <button
              onClick={() => {
                soundEngine.playClick();
                setMode('CLASSIC');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                mode === 'CLASSIC'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Classic</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setMode('TIME_ATTACK');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                mode === 'TIME_ATTACK'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Speed Rush (60s)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPassAndPlay();
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              title="2-Player Pass and Play mode"
            >
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Pass & Play</span>
            </button>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onStartGame();
            }}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-serif font-bold text-base tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START TRIAL</span>
            <span className="text-[11px] font-mono opacity-70 bg-amber-950/20 px-1.5 py-0.5 rounded">
              ENTER
            </span>
          </button>
        </div>
      </div>

      {/* Flat control-hint line bottom */}
      <div className="w-full max-w-3xl flex items-center justify-center text-[11px] font-mono text-slate-500 gap-3 border-t border-slate-800/80 pt-4 pointer-events-auto">
        <span>[A–Z] Guess Letter</span>
        <span>·</span>
        <span>[H] or [Space] Letter Hint</span>
        <span>·</span>
        <span>[Esc] Pause</span>
        <span>·</span>
        <span>[M] Mute</span>
      </div>
    </div>
  );
};
