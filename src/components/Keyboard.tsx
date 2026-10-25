/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { soundEngine } from '../utils/audio';
import { Lightbulb } from 'lucide-react';

interface KeyboardProps {
  guessedLetters: Set<string>;
  word: string;
  onGuessLetter: (letter: string) => void;
  hintsLeft: number;
  onUseHint: () => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const Keyboard: React.FC<KeyboardProps> = ({
  guessedLetters,
  word,
  onGuessLetter,
  hintsLeft,
  onUseHint,
  disabled = false,
}) => {
  const wordLetters = new Set(word.toUpperCase().split(''));

  return (
    <div className="w-full max-w-2xl px-2 flex flex-col items-center gap-1.5 md:gap-2 select-none pointer-events-auto">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center items-center gap-1 md:gap-1.5 w-full">
          {/* Hint button placed at the left of row 3 */}
          {rowIndex === 2 && (
            <button
              onClick={() => {
                if (hintsLeft > 0 && !disabled) {
                  onUseHint();
                }
              }}
              disabled={disabled || hintsLeft <= 0}
              className={`flex items-center justify-center gap-1 px-3 h-10 md:h-12 rounded-lg font-sans font-semibold text-xs transition-all cursor-pointer ${
                hintsLeft > 0 && !disabled
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)] active:scale-95'
                  : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
              }`}
              title="Reveal one unguessed letter (Press H or Space)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint ({hintsLeft})</span>
            </button>
          )}

          {row.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = isGuessed && wordLetters.has(letter);
            const isWrong = isGuessed && !wordLetters.has(letter);

            let buttonStyle =
              'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700 shadow-sm active:scale-95 cursor-pointer';

            if (isCorrect) {
              buttonStyle =
                'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-default';
            } else if (isWrong) {
              buttonStyle =
                'bg-slate-950/70 text-slate-600 border-slate-900 opacity-40 line-through cursor-default';
            }

            return (
              <button
                key={letter}
                onClick={() => {
                  if (!isGuessed && !disabled) {
                    onGuessLetter(letter);
                  }
                }}
                disabled={isGuessed || disabled}
                className={`flex-1 max-w-[42px] h-10 md:h-12 flex items-center justify-center rounded-lg font-mono font-bold text-sm md:text-base border transition-all ${buttonStyle}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
