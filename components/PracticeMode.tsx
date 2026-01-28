
import React, { useState, useEffect } from 'react';
import { Question } from '../types.ts';
import { X, ChevronLeft, CheckCircle2, XCircle, Info, Share2, Timer } from 'lucide-react';

interface PracticeModeProps {
  questions: Question[];
  isMock?: boolean;
  onFinish: () => void;
  onAnswer: (id: string, isCorrect: boolean) => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ questions, isMock = false, onFinish, onAnswer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [timeLeft, setTimeLeft] = useState(isMock ? 30 * 60 : 0);

  useEffect(() => {
    let timer: number;
    if (isMock && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMock, timeLeft]);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 pb-20">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-primary mb-6">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Session Exhausted</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-[240px]">Bank capacity limited. Use AI Forge for new clinical scenarios.</p>
        <button onClick={onFinish} className="w-full max-w-[200px] h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
          Return to Hub
        </button>
      </div>
    );
  }

  const handleOptionClick = (idx: number) => {
    if (isConfirmed) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null || isConfirmed) return;
    setIsConfirmed(true);
    setShowRationale(true);
    
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    onAnswer(currentQuestion.id.toString(), isCorrect);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
      setShowRationale(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      onFinish();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(null);
      setIsConfirmed(false);
      setShowRationale(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto min-h-screen relative pb-32 lg:pb-40">
      {/* Quiz Header - Sticky for visibility */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 py-3 lg:py-2 border-b lg:border-none border-slate-100 dark:border-slate-800">
        <button onClick={onFinish} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-primary tracking-widest uppercase">
            {isMock ? 'Mock Session' : 'Tactical Drill'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">Q {currentIndex + 1} / {questions.length}</span>
            {isMock && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono ${timeLeft < 300 ? 'bg-rose-100 text-rose-500 animate-pulse' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                <Timer size={10} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
        <button onClick={onFinish} className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg font-bold text-[10px]">
          End
        </button>
      </div>

      <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4 lg:space-y-6 animate-fade-in px-1 lg:px-0">
        <div className="bg-white dark:bg-zinc-900 p-4 lg:p-10 rounded-3xl lg:rounded-4xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-primary text-[9px] font-bold rounded-full border border-primary/20 uppercase">
              {currentQuestion.adpiePhase}
            </span>
            <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[9px] font-bold rounded-full uppercase">
              {currentQuestion.difficulty}
            </span>
          </div>
          <h2 className="text-sm lg:text-xl font-semibold leading-relaxed mb-6 lg:mb-8 text-zinc-800 dark:text-zinc-100">
            {currentQuestion.text}
          </h2>

          <div className="space-y-2 lg:space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              
              let optionStyles = 'border-zinc-100 dark:border-zinc-800';
              if (isSelected) optionStyles = 'border-primary ring-1 ring-primary/20 bg-indigo-50/10 dark:bg-indigo-900/10';
              if (isConfirmed) {
                if (isCorrect) optionStyles = 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/20';
                else if (isSelected && !isCorrect) optionStyles = 'border-rose-500 bg-rose-50/20 dark:bg-rose-900/20';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isConfirmed}
                  className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-2xl lg:rounded-3xl border text-[13px] lg:text-sm text-left transition-all active:scale-[0.99] ${optionStyles}`}
                >
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 shrink-0 flex items-center justify-center rounded-lg lg:rounded-xl font-bold text-[10px] lg:text-xs transition-colors ${
                    isSelected ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1 font-medium leading-snug">{option}</span>
                  {isConfirmed && isCorrect && <CheckCircle2 className="text-emerald-500" size={18} />}
                  {isConfirmed && isSelected && !isCorrect && <XCircle className="text-rose-500" size={18} />}
                </button>
              );
            })}
          </div>
        </div>

        {showRationale && !isMock && (
          <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-5 lg:p-8 rounded-3xl lg:rounded-4xl border border-indigo-100/50 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Info size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Clinical Evidence</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] lg:text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Control Bar - Fixed for Mobile, Lock-in behavior */}
      <div className="fixed bottom-0 left-0 right-0 p-3 lg:p-6 pb-[env(safe-area-inset-bottom,16px)] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-[60]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2 lg:gap-3">
          <button 
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl lg:rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-20 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={isConfirmed ? nextQuestion : handleConfirm}
            disabled={selectedOption === null}
            className={`flex-1 h-12 lg:h-14 rounded-xl lg:rounded-2xl font-bold transition-all shadow-lg text-[13px] lg:text-sm ${
              selectedOption === null 
                ? 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800' 
                : 'bg-primary text-white shadow-primary/20 active:scale-[0.98]'
            }`}
          >
            {isConfirmed ? (currentIndex === questions.length - 1 ? 'Complete' : 'Next Scenario') : 'Verify Rationale'}
          </button>

          <button className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl lg:rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 active:scale-90 transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
