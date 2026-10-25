/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WordDisplayProps {
  word: string;
  guessedLetters: Set<string>;
  revealedByHint: Set<string>;
  category: string;
  riddleHint: string;
  showRiddle: boolean;
  onToggleRiddle: () => void;
  revealFullWord?: boolean;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  guessedLetters,
  revealedByHint,
  category,
  riddleHint,
  showRiddle,
  onToggleRiddle,
  revealFullWord = false,
}) => {
  const letters = word.toUpperCase().split('');

  return (
    <div className="w-full flex flex-col items-center select-none pointer-events-auto">
      {/* Category header & Riddle toggle */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <span className="uppercase tracking-widest text-amber-400 font-medium font-mono">
          {category}
        </span>
        <span className="text-slate-600">·</span>
        <button
          onClick={onToggleRiddle}
          className="text-slate-400 hover:text-amber-300 underline underline-offset-4 decoration-slate-700 hover:decoration-amber-400 transition-colors cursor-pointer"
        >
          {showRiddle ? 'Hide Clue' : 'Read Riddle Clue'}
        </button>
      </div>

      {/* Optional Riddle Clue banner */}
      {showRiddle && (
        <div className="mb-5 max-w-lg p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-xs md:text-sm text-center italic animate-fade-in shadow-inner">
          "{riddleHint}"
        </div>
      )}

      {/* Secret Word Tiles */}
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 px-4 max-w-4xl">
        {letters.map((char, index) => {
          if (char === ' ') {
            return <div key={index} className="w-4 md:w-6" />;
          }

          const isGuessed = guessedLetters.has(char);
          const isHinted = revealedByHint.has(char);
          const isRevealed = isGuessed || revealFullWord;

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center w-9 h-12 md:w-12 md:h-16 rounded-lg font-serif font-black text-xl md:text-2xl transition-all duration-300 shadow-md ${
                isRevealed
                  ? isHinted
                    ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                    : 'bg-slate-800/90 text-amber-100 border border-amber-500/40'
                  : 'bg-slate-900/80 text-transparent border-b-4 border-slate-700'
              }`}
            >
              {isRevealed ? (
                <span className="transform transition-transform scale-100">{char}</span>
              ) : (
                <span className="w-4 h-0.5 bg-slate-600 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
