/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  GameMode,
  Difficulty,
  DIFFICULTY_CONFIGS,
  WordItem,
  GameStats,
  INITIAL_STATS,
} from './types/game';
import { getRandomWord } from './data/words';
import { soundEngine } from './utils/audio';
import { GallowsCanvas } from './components/GallowsCanvas';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { WordDisplay } from './components/WordDisplay';
import { Keyboard } from './components/Keyboard';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { StatsModal } from './components/StatsModal';
import { PassAndPlayModal } from './components/PassAndPlayModal';

const STATS_STORAGE_KEY = 'hangman_game_stats_v1';

export default function App() {
  // Game State Machine
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [category, setCategory] = useState<string>('All Categories');

  // Word & Guess State
  const [currentWordItem, setCurrentWordItem] = useState<WordItem>(() =>
    getRandomWord('EASY', 'All Categories')
  );
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [revealedByHint, setRevealedByHint] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showRiddle, setShowRiddle] = useState<boolean>(false);

  // Animation triggers for Canvas
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);
  const [lastActionTimestamp, setLastActionTimestamp] = useState<number>(0);

  // Time Attack Timer
  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Modals
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showPassAndPlayModal, setShowPassAndPlayModal] = useState<boolean>(false);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted());

  // Statistics Tracking
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_STATS;
  });

  // Save stats on update
  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch {
      // ignore
    }
  };

  const handleResetStats = () => {
    saveStats(INITIAL_STATS);
  };

  const currentConfig = DIFFICULTY_CONFIGS[difficulty];
  const maxMistakes = currentConfig.maxMistakes;

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Initialize and start a new game round
  const startNewRound = useCallback(
    (customWord?: WordItem) => {
      const wordToPlay = customWord || getRandomWord(difficulty, category);
      setCurrentWordItem(wordToPlay);
      setGuessedLetters(new Set());
      setRevealedByHint(new Set());
      setMistakes(0);

      // Set hints based on difficulty: Easy = 3, Medium = 2, Hard = 1
      const initialHints = difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 2 : 1;
      setHintsLeft(initialHints);
      setHintsUsed(0);
      setShowRiddle(false);
      setLastGuessCorrect(null);
      setLastActionTimestamp(Date.now());
      setTimeLeft(60);
      setGameState('PLAYING');
    },
    [difficulty, category]
  );

  // Hint action: reveal one unguessed letter
  const handleUseHint = useCallback(() => {
    if (gameState !== 'PLAYING' || hintsLeft <= 0) return;

    const secretWord = currentWordItem.word.toUpperCase();
    const unguessedLetters = secretWord
      .split('')
      .filter((char) => char !== ' ' && !guessedLetters.has(char));

    if (unguessedLetters.length === 0) return;

    // Pick a random unguessed letter
    const chosenLetter =
      unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

    soundEngine.playHintReveal();

    setHintsLeft((prev) => Math.max(0, prev - 1));
    setHintsUsed((prev) => prev + 1);

    setGuessedLetters((prev) => {
      const next = new Set(prev);
      next.add(chosenLetter);
      return next;
    });

    setRevealedByHint((prev) => {
      const next = new Set(prev);
      next.add(chosenLetter);
      return next;
    });

    setLastGuessCorrect(true);
    setLastActionTimestamp(Date.now());
  }, [gameState, hintsLeft, currentWordItem, guessedLetters]);

  // Guess letter action
  const handleGuessLetter = useCallback(
    (letter: string) => {
      if (gameState !== 'PLAYING') return;

      const upper = letter.toUpperCase();
      if (guessedLetters.has(upper)) return;

      const wordUpper = currentWordItem.word.toUpperCase();
      const isCorrect = wordUpper.includes(upper);

      soundEngine.playKeyClick(letter.charCodeAt(0));

      setGuessedLetters((prev) => {
        const next = new Set(prev);
        next.add(upper);
        return next;
      });

      setLastGuessCorrect(isCorrect);
      setLastActionTimestamp(Date.now());

      if (isCorrect) {
        soundEngine.playCorrectLetter(streak + 1);
      } else {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);
        soundEngine.playWrongLetter(maxMistakes - nextMistakes);
      }
    },
    [gameState, guessedLetters, currentWordItem, mistakes, maxMistakes, streak]
  );

  // Check victory / game over conditions
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const secretChars = currentWordItem.word
      .toUpperCase()
      .split('')
      .filter((c) => c !== ' ');

    const allSolved = secretChars.every((char) => guessedLetters.has(char));

    // VICTORY CONDITION
    if (allSolved) {
      soundEngine.playVictory();
      setGameState('VICTORY');

      const wordScore = Math.round(
        (secretChars.length * 100 + (maxMistakes - mistakes) * 75) *
          currentConfig.scoreMultiplier
      );
      setScore((s) => s + wordScore);
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      // Record statistics
      const totalGuessesThisGame = guessedLetters.size;
      saveStats({
        ...stats,
        gamesWon: stats.gamesWon + 1,
        totalGames: stats.totalGames + 1,
        totalGuesses: stats.totalGuesses + totalGuessesThisGame,
        averageGuesses:
          (stats.totalGuesses + totalGuessesThisGame) / (stats.totalGames + 1),
        currentStreak: nextStreak,
        bestStreak: Math.max(stats.bestStreak, nextStreak),
        highScore: Math.max(stats.highScore, score + wordScore),
        statsByDifficulty: {
          ...stats.statsByDifficulty,
          [difficulty]: {
            won: (stats.statsByDifficulty[difficulty]?.won || 0) + 1,
            lost: stats.statsByDifficulty[difficulty]?.lost || 0,
            totalGuesses:
              (stats.statsByDifficulty[difficulty]?.totalGuesses || 0) +
              totalGuessesThisGame,
          },
        },
        wordsDiscovered: stats.wordsDiscovered.includes(currentWordItem.word)
          ? stats.wordsDiscovered
          : [...stats.wordsDiscovered, currentWordItem.word],
      });
      return;
    }

    // GAME OVER CONDITION (Mistakes or Time out)
    if (mistakes >= maxMistakes) {
      soundEngine.playGameOver();
      setGameState('GAME_OVER');
      setStreak(0);

      const totalGuessesThisGame = guessedLetters.size;
      saveStats({
        ...stats,
        gamesLost: stats.gamesLost + 1,
        totalGames: stats.totalGames + 1,
        totalGuesses: stats.totalGuesses + totalGuessesThisGame,
        averageGuesses:
          (stats.totalGuesses + totalGuessesThisGame) / (stats.totalGames + 1),
        currentStreak: 0,
        statsByDifficulty: {
          ...stats.statsByDifficulty,
          [difficulty]: {
            won: stats.statsByDifficulty[difficulty]?.won || 0,
            lost: (stats.statsByDifficulty[difficulty]?.lost || 0) + 1,
            totalGuesses:
              (stats.statsByDifficulty[difficulty]?.totalGuesses || 0) +
              totalGuessesThisGame,
          },
        },
      });
    }
  }, [
    guessedLetters,
    mistakes,
    maxMistakes,
    gameState,
    currentWordItem,
    currentConfig.scoreMultiplier,
    streak,
    score,
    stats,
    difficulty,
  ]);

  // Speed Rush Countdown Timer (Time Attack mode)
  useEffect(() => {
    if (gameState !== 'PLAYING' || mode !== 'TIME_ATTACK') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundEngine.playGameOver();
          setGameState('GAME_OVER');
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, mode]);

  // Physical Keyboard Input Handling
  const keysDownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      // Avoid auto-repeat
      if (keysDownRef.current.has(key)) return;
      keysDownRef.current.add(key);

      // Title screen quick start: Enter or Space
      if (gameState === 'TITLE' && (key === 'ENTER' || key === ' ')) {
        e.preventDefault();
        soundEngine.playClick();
        startNewRound();
        return;
      }

      // Victory / Game Over next word: Enter or Space
      if (
        (gameState === 'VICTORY' || gameState === 'GAME_OVER') &&
        (key === 'ENTER' || key === ' ')
      ) {
        e.preventDefault();
        soundEngine.playClick();
        startNewRound();
        return;
      }

      // Pause toggle: Escape
      if (key === 'ESCAPE') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          soundEngine.playClick();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          soundEngine.playClick();
          setGameState('PLAYING');
        }
        return;
      }

      // Mute toggle: M
      if (key === 'M') {
        handleToggleMute();
        return;
      }

      // Hint trigger: H or Space (during play)
      if (gameState === 'PLAYING' && (key === 'H' || key === ' ')) {
        e.preventDefault();
        handleUseHint();
        return;
      }

      // Letter guess: A-Z
      if (gameState === 'PLAYING' && /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleGuessLetter(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.key.toUpperCase());
    };

    const handleBlur = () => {
      keysDownRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [
    gameState,
    startNewRound,
    handleUseHint,
    handleGuessLetter,
    handleToggleMute,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col items-center justify-between">
      {/* 60fps Isolated Simulation Canvas */}
      <GallowsCanvas
        gameState={gameState}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        lastGuessCorrect={lastGuessCorrect}
        lastActionTimestamp={lastActionTimestamp}
      />

      {/* Title Screen View */}
      {gameState === 'TITLE' && (
        <TitleScreen
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          category={category}
          setCategory={setCategory}
          mode={mode}
          setMode={setMode}
          onStartGame={() => startNewRound()}
          onOpenStats={() => setShowStatsModal(true)}
          onOpenPassAndPlay={() => setShowPassAndPlayModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Active Playing View */}
      {(gameState === 'PLAYING' ||
        gameState === 'PAUSED' ||
        gameState === 'VICTORY' ||
        gameState === 'GAME_OVER') && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between items-center py-4 md:py-6 pointer-events-none">
          {/* Top Low-Occlusion HUD */}
          <GameHUD
            difficulty={difficulty}
            mistakes={mistakes}
            maxMistakes={maxMistakes}
            score={score}
            streak={streak}
            mode={mode}
            timeLeft={timeLeft}
            hintsLeft={hintsLeft}
            onUseHint={handleUseHint}
            onPause={() => {
              soundEngine.playClick();
              setGameState('PAUSED');
            }}
            onOpenStats={() => setShowStatsModal(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Center Playfield (85%+ unobstructed canvas) */}
          <div className="flex-1" />

          {/* Bottom Interactive Cluster: Word Slots + Keyboard */}
          <div className="w-full flex flex-col items-center gap-4 md:gap-5 pb-2 pointer-events-auto">
            {/* Secret Word Tiles */}
            <WordDisplay
              word={currentWordItem.word}
              guessedLetters={guessedLetters}
              revealedByHint={revealedByHint}
              category={currentWordItem.category}
              riddleHint={currentWordItem.hint}
              showRiddle={showRiddle}
              onToggleRiddle={() => {
                soundEngine.playClick();
                setShowRiddle((r) => !r);
              }}
              revealFullWord={gameState === 'GAME_OVER'}
            />

            {/* Tactile On-Screen Keyboard */}
            <Keyboard
              guessedLetters={guessedLetters}
              word={currentWordItem.word}
              onGuessLetter={handleGuessLetter}
              hintsLeft={hintsLeft}
              onUseHint={handleUseHint}
              disabled={gameState !== 'PLAYING'}
            />
          </div>
        </div>
      )}

      {/* Victory / Game Over Modal */}
      {(gameState === 'VICTORY' || gameState === 'GAME_OVER') && (
        <GameOverModal
          isVictory={gameState === 'VICTORY'}
          wordItem={currentWordItem}
          guessesCount={guessedLetters.size}
          mistakes={mistakes}
          maxMistakes={maxMistakes}
          hintsUsed={hintsUsed}
          scoreGained={
            gameState === 'VICTORY'
              ? Math.round(
                  (currentWordItem.word.length * 100 +
                    (maxMistakes - mistakes) * 75) *
                    currentConfig.scoreMultiplier
                )
              : 0
          }
          streak={streak}
          difficulty={difficulty}
          onPlayAgain={() => startNewRound()}
          onTitleMenu={() => {
            soundEngine.playClick();
            setGameState('TITLE');
          }}
          onOpenStats={() => setShowStatsModal(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            soundEngine.playClick();
            setGameState('PLAYING');
          }}
          onRestart={() => startNewRound()}
          onHome={() => {
            soundEngine.playClick();
            setGameState('TITLE');
          }}
        />
      )}

      {/* Player Stats & Records Modal */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
          onResetStats={handleResetStats}
        />
      )}

      {/* 2-Player Pass and Play Custom Word Builder */}
      {showPassAndPlayModal && (
        <PassAndPlayModal
          onStartCustomGame={(customWordItem) => {
            setShowPassAndPlayModal(false);
            setDifficulty(customWordItem.difficulty);
            startNewRound(customWordItem);
          }}
          onClose={() => setShowPassAndPlayModal(false)}
        />
      )}
    </div>
  );
}
