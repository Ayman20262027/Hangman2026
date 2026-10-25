/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type GameMode = 'CLASSIC' | 'TIME_ATTACK' | 'PASS_AND_PLAY';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  tagline: string;
  description: string;
  maxMistakes: number;
  initialHints: number;
  scoreMultiplier: number;
  wordLengthGuide: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    id: 'EASY',
    label: 'Easy',
    tagline: 'Shorter, common words',
    description: '4–6 letters, everyday vocabulary, 8 allowed mistakes.',
    maxMistakes: 8,
    initialHints: 2,
    scoreMultiplier: 1.0,
    wordLengthGuide: '4–6 letters',
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Medium',
    tagline: 'Longer, less common words',
    description: '7–9 letters, intriguing vocabulary, 6 allowed mistakes.',
    maxMistakes: 6,
    initialHints: 1,
    scoreMultiplier: 1.5,
    wordLengthGuide: '7–9 letters',
  },
  HARD: {
    id: 'HARD',
    label: 'Hard',
    tagline: 'Long, obscure words',
    description: '9–13 letters, rare and esoteric vocabulary, 5 allowed mistakes.',
    maxMistakes: 5,
    initialHints: 0,
    scoreMultiplier: 2.5,
    wordLengthGuide: '9+ letters',
  },
};

export interface WordItem {
  id: string;
  word: string;
  category: string;
  difficulty: Difficulty;
  hint: string;
  funFact: string;
}

export interface GameStats {
  gamesWon: number;
  gamesLost: number;
  totalGames: number;
  totalGuesses: number;
  averageGuesses: number;
  currentStreak: number;
  bestStreak: number;
  highScore: number;
  statsByDifficulty: Record<Difficulty, { won: number; lost: number; totalGuesses: number }>;
  wordsDiscovered: string[];
}

export const INITIAL_STATS: GameStats = {
  gamesWon: 0,
  gamesLost: 0,
  totalGames: 0,
  totalGuesses: 0,
  averageGuesses: 0,
  currentStreak: 0,
  bestStreak: 0,
  highScore: 0,
  statsByDifficulty: {
    EASY: { won: 0, lost: 0, totalGuesses: 0 },
    MEDIUM: { won: 0, lost: 0, totalGuesses: 0 },
    HARD: { won: 0, lost: 0, totalGuesses: 0 },
  },
  wordsDiscovered: [],
};
