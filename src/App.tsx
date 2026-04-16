/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw, 
  History, 
  Terminal, 
  ShieldAlert,
  Play,
  Pause,
  SkipForward,
  ListOrdered,
  Activity,
  Calendar,
  Hash,
  Shuffle
} from 'lucide-react';
import { ALGO_MAP, PinMode } from './lib/algorithms';

const MAX_COMBINATIONS = 10000;

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<PinMode>('sequential');
  const [history, setHistory] = useState<{ pin: string; timestamp: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState(5000);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isFinished) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isFinished]);

  const formatPin = (index: number) => {
    return index.toString().padStart(4, '0');
  };

  const currentPin = ALGO_MAP[mode][currentIndex] || formatPin(currentIndex);

  const handleNext = () => {
    if (currentIndex < MAX_COMBINATIONS - 1) {
      const newHistory = [{ pin: currentPin, timestamp: Date.now() }, ...history].slice(0, 4);
      setHistory(newHistory);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      setIsAutoMode(false);
    }
  };

  const handleSuccess = () => {
    setIsFinished(true);
    setIsAutoMode(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setHistory([]);
    setIsFinished(false);
    setIsAutoMode(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleJumpTo = (val: string) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num >= MAX_COMBINATIONS) return;

    const pinStr = val.padStart(4, '0');
    const algoIndex = ALGO_MAP[mode].indexOf(pinStr);
    
    if (algoIndex !== -1) {
      setCurrentIndex(algoIndex);
    } else {
      setCurrentIndex(num);
    }
    setIsFinished(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoMode && !isFinished) {
      interval = setInterval(() => {
        handleNext();
      }, autoInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoMode, currentIndex, isFinished, autoInterval]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const estimatedTimeLeft = () => {
    if (currentIndex === 0) return "~";
    const timePerPin = elapsedTime / currentIndex;
    const pinsLeft = MAX_COMBINATIONS - currentIndex;
    const secondsLeft = Math.floor(timePerPin * pinsLeft);
    const h = Math.floor(secondsLeft / 3600);
    return `~${h} Hours`;
  };

  return (
    <div className="h-screen w-full bg-bg-sleek text-text-sleek font-sans flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-[500px] h-full max-h-[700px] flex flex-col justify-center">
        
        {/* Main Card */}
        <div className="bg-card-sleek border border-border-sleek rounded-[32px] p-6 sm:p-8 relative flex flex-col justify-between h-full shadow-2xl">
          <div className="absolute top-6 right-8 flex items-center gap-3">
             <button 
              onClick={() => setShowFullHistory(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim-sleek hover:text-accent-sleek"
              title="Full History"
            >
              <History size={18} />
            </button>
            <div className="bg-accent-sleek/10 text-accent-sleek px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {isFinished ? 'Terminated' : 'Active'}
            </div>
          </div>

          <header className="mb-2">
            <h1 className="text-xl font-bold mb-0.5 tracking-tight">PIN Explorer</h1>
            <p className="text-dim-sleek text-[11px] font-medium opacity-60">Systematic verification assistant</p>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="grid grid-cols-5 bg-bg-sleek/50 border border-border-sleek/50 rounded-2xl p-1 gap-1 mb-8">
              {[
                { id: 'sequential', icon: ListOrdered, label: 'Seq' },
                { id: 'frequency', icon: Activity, label: 'Freq' },
                { id: 'date', icon: Calendar, label: 'Date' },
                { id: 'pattern', icon: Hash, label: 'Patt' },
                { id: 'random', icon: Shuffle, label: 'Rand' },
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => { setMode(m.id as PinMode); setCurrentIndex(0); setHistory([]); }}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${mode === m.id ? 'bg-accent-sleek text-bg-sleek shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-dim-sleek hover:text-text-sleek'}`}
                >
                  <m.icon size={14} />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPin}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[100px] font-mono font-bold tracking-[4px] text-text-sleek drop-shadow-[0_0_20px_rgba(56,189,248,0.15)] leading-none mb-6"
              >
                {currentPin}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
              <div className="flex gap-2 w-full">
                <input 
                  type="text"
                  maxLength={4}
                  placeholder="START PIN"
                  className="flex-1 bg-bg-sleek/40 border border-border-sleek rounded-xl px-4 py-2 text-center font-mono text-base focus:outline-none focus:border-accent-sleek transition-all text-text-sleek placeholder:text-dim-sleek/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (/^\d{1,4}$/.test(val)) {
                        handleJumpTo(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Mini History */}
            <div className="mt-8 w-full">
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-dim-sleek opacity-40">Recent History</span>
                <span className="text-[9px] font-mono text-dim-sleek">{currentIndex} / 10,000</span>
              </div>
              <div className="flex gap-2 justify-center h-10">
                <AnimatePresence>
                  {history.length === 0 ? (
                    <div className="text-[10px] text-dim-sleek/20 italic flex items-center">No history yet</div>
                  ) : (
                    history.map((entry, i) => (
                      <motion.div 
                        key={entry.timestamp}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1 - (i * 0.2), scale: 1 - (i * 0.05) }}
                        className="bg-bg-sleek border border-border-sleek px-3 py-1.5 rounded-lg font-mono text-xs text-dim-sleek flex items-center gap-2"
                      >
                        {entry.pin}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full h-1 bg-border-sleek rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-sleek"
                initial={{ width: 0 }}
                animate={{ width: `${(currentIndex / MAX_COMBINATIONS) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSuccess}
                disabled={isFinished}
                className="py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 border-success-sleek/30 text-success-sleek hover:bg-success-sleek hover:text-bg-sleek transition-all disabled:opacity-20"
              >
                Bingo!
              </button>
              <button
                onClick={handleNext}
                disabled={isFinished}
                className="py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-accent-sleek text-bg-sleek hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all disabled:opacity-20 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAutoMode(!isAutoMode)}
                disabled={isFinished}
                className={`flex-[2] py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isAutoMode 
                    ? 'bg-accent-sleek text-bg-sleek border-accent-sleek' 
                    : 'bg-transparent border-border-sleek text-dim-sleek hover:border-accent-sleek hover:text-accent-sleek'
                }`}
              >
                {isAutoMode ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {isAutoMode ? 'Stop' : 'Auto'}
              </button>
              
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-2xl border border-border-sleek text-dim-sleek hover:text-red-400 hover:border-red-400 text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Reset
              </button>
            </div>

            {isAutoMode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 bg-bg-sleek/50 p-1 rounded-xl border border-border-sleek/50"
              >
                {[500, 3000, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAutoInterval(val)}
                    className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${
                      autoInterval === val 
                        ? 'bg-accent-sleek text-bg-sleek' 
                        : 'text-dim-sleek hover:text-text-sleek'
                    }`}
                  >
                    {val === 500 ? '0.5s' : `${val/1000}s`}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Full History Modal */}
      <AnimatePresence>
        {showFullHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-sleek/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFullHistory(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card-sleek border border-border-sleek w-full max-w-md rounded-[32px] p-8 max-h-[80vh] flex flex-col shadow-3xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Execution Log</h3>
                  <p className="text-[10px] text-dim-sleek uppercase tracking-widest font-black opacity-40">Complete verification history</p>
                </div>
                <button 
                  onClick={() => setShowFullHistory(false)}
                  className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                >
                  <RotateCcw size={18} className="text-dim-sleek" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center italic text-dim-sleek/30">No data records found</div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.timestamp} className="flex justify-between items-center p-4 bg-bg-sleek/50 border border-border-sleek/50 rounded-2xl group hover:border-accent-sleek/30 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xl font-bold text-text-sleek">{entry.pin}</span>
                        <span className="text-[10px] text-dim-sleek font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-500/20">Rejected</span>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setShowFullHistory(false)}
                className="mt-6 w-full py-4 bg-bg-sleek border border-border-sleek rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-border-sleek transition-all"
              >
                Close Log
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}
