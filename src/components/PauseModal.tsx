/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { soundEngine } from '../utils/audio';
import { Play, RotateCcw, Home, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onHome }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fade-in pointer-events-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-serif font-bold text-amber-200 mb-1">Trial Paused</h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath before returning to the gallows.</p>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME TRIAL (ESC)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Word</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHome();
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Title</span>
          </button>
        </div>

        {/* Quick Help reminder */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 w-full text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Press [H] during play for a letter hint.</span>
        </div>
      </div>
    </div>
  );
};
