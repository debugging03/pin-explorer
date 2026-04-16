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
      const newHistory = [{ pin: currentPin, timestamp: Date.now() }, ...history].slice(0, 50);
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
    <div className="min-h-screen bg-bg-sleek text-text-sleek font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Panel */}
        <div className="bg-card-sleek border border-border-sleek rounded-[24px] p-10 relative flex flex-col justify-between min-h-[600px]">
          <div className="absolute top-6 right-6 bg-accent-sleek/10 text-accent-sleek px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {isFinished ? 'Session Terminated' : 'Session Active'}
          </div>

          <header className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">PIN Explorer v1.5</h1>
                <p className="text-dim-sleek text-sm">Advanced algorithmic testing for 4-digit combinations</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 bg-bg-sleek border border-border-sleek rounded-xl p-1 gap-1">
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
                    title={m.id.toUpperCase()}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 min-w-[50px] ${mode === m.id ? 'bg-accent-sleek text-bg-sleek' : 'text-dim-sleek hover:text-text-sleek hover:bg-border-sleek/30'}`}
                  >
                    <m.icon size={14} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPin}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-[120px] font-mono font-bold tracking-[12px] text-text-sleek drop-shadow-[0_0_40px_rgba(56,189,248,0.2)]"
              >
                {currentPin}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-[240px]">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim-sleek">Set Starting PIN</div>
              <div className="flex gap-2 w-full">
                <input 
                  type="text"
                  maxLength={4}
                  placeholder="0000"
                  className="flex-1 bg-bg-sleek border border-border-sleek rounded-xl px-4 py-2 text-center font-mono text-lg focus:outline-none focus:border-accent-sleek transition-colors text-text-sleek"
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
                <button 
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                    const val = input.value;
                    if (/^\d{1,4}$/.test(val)) {
                      handleJumpTo(val);
                      input.value = '';
                    }
                  }}
                  className="bg-accent-sleek/10 hover:bg-accent-sleek/20 text-accent-sleek px-4 rounded-xl transition-colors font-bold text-xs uppercase"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="w-full mt-10">
              <div className="w-full h-1.5 bg-border-sleek rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent-sleek"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentIndex / MAX_COMBINATIONS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-dim-sleek text-center text-xs mt-3">
                {currentIndex.toLocaleString()} of 10,000 combinations attempted
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <button
              onClick={handleSuccess}
              disabled={isFinished}
              className="py-5 rounded-2xl font-bold text-sm uppercase tracking-widest border border-success-sleek text-success-sleek hover:bg-success-sleek/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              I've Found It!
            </button>
            <button
              onClick={handleNext}
              disabled={isFinished}
              className="py-5 rounded-2xl font-bold text-sm uppercase tracking-widest bg-accent-sleek text-bg-sleek hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Combination <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex-1 flex flex-col gap-2">
              <button
                onClick={() => setIsAutoMode(!isAutoMode)}
                disabled={isFinished}
                className={`w-full py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isAutoMode 
                    ? 'bg-accent-sleek/10 border-accent-sleek text-accent-sleek' 
                    : 'bg-transparent border-border-sleek text-dim-sleek hover:border-dim-sleek'
                }`}
              >
                {isAutoMode ? 'Stop Auto' : 'Auto Mode'}
              </button>
              
              {isAutoMode && (
                <div className="flex flex-col gap-2 bg-bg-sleek/50 p-2 rounded-lg border border-border-sleek/50">
                  <div className="flex gap-1 justify-between">
                    {[500, 3000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAutoInterval(val)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${
                          autoInterval === val 
                            ? 'bg-accent-sleek text-bg-sleek' 
                            : 'text-dim-sleek hover:text-text-sleek'
                        }`}
                      >
                        {val === 500 ? '0.5s' : `${val/1000}s`}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[8px] uppercase font-bold text-dim-sleek whitespace-nowrap">Custom (sec):</span>
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      step="0.5"
                      defaultValue={autoInterval / 1000}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setAutoInterval(val * 1000);
                        }
                      }}
                      className="bg-bg-sleek border border-border-sleek/50 rounded px-2 py-0.5 text-[10px] w-full focus:outline-none focus:border-accent-sleek text-text-sleek"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleReset}
              className="flex-1 h-fit py-3 rounded-xl border border-border-sleek text-dim-sleek hover:text-red-400 hover:border-red-400 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Reset System
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-card-sleek border border-border-sleek rounded-[20px] p-6">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.15em] text-dim-sleek mb-4">Performance Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-dim-sleek text-sm">Time Elapsed</span>
                <span className="font-bold text-text-sleek tabular-nums">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dim-sleek text-sm">Success Rate</span>
                <span className="font-bold text-text-sleek tabular-nums">0.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dim-sleek text-sm">Estimated Left</span>
                <span className="font-bold text-text-sleek tabular-nums">{estimatedTimeLeft()}</span>
              </div>
            </div>
          </div>

          <div className="bg-card-sleek border border-border-sleek rounded-[20px] p-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.15em] text-dim-sleek mb-4">Recent History</h3>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-dim-sleek/30 italic text-xs">
                  No attempts logged
                </div>
              ) : (
                history.map((entry) => (
                  <div key={entry.timestamp} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="font-mono text-sm text-text-sleek">{entry.pin}</span>
                    <span className="text-[10px] font-bold text-red-500 uppercase">Failed</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card-sleek border border-border-sleek rounded-[20px] p-6">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.15em] text-dim-sleek mb-4">Jump to Index</h3>
            <div className="flex gap-2">
              <input 
                type="number" 
                min="0" 
                max="9999"
                placeholder="0000"
                className="bg-bg-sleek border border-border-sleek rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:border-accent-sleek transition-colors text-text-sleek"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJumpTo((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  handleJumpTo(input.value);
                }}
                className="bg-border-sleek hover:bg-dim-sleek/20 p-2 rounded-xl transition-colors text-text-sleek"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
