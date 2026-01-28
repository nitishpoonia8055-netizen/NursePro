
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-primary mb-6">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Session Exhausted</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-[240px]">Bank capacity limited. Use AI Forge for new clinical scenarios.</p>
        <button onClick={onFinish} className="w-full max-w-[200px] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
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
    <div className="max-w-4xl mx-auto min-h-screen relative pb-40">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-transparent z-10 py-2">
        <button onClick={onFinish} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400">
          <X size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-0.5">
            {isMock ? 'Mock Session' : 'Drill Session'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Q {currentIndex + 1} / {questions.length}</span>
            {isMock && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${timeLeft < 300 ? 'bg-rose-100 text-rose-500 animate-pulse' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                <Timer size={10} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
        <button onClick={onFinish} className="px-4 py-1.5 bg-rose-500/10 text-rose-500 rounded-full font-bold text-[11px] active:bg-rose-500 active:text-white transition-colors">
          Exit
        </button>
      </div>

      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-zinc-900 p-5 lg:p-10 rounded-4xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-primary text-[10px] font-bold rounded-full border border-primary/20">
              {currentQuestion.chapter}
            </span>
            <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-full">
              {currentQuestion.difficulty}
            </span>
          </div>
          <h2 className="text-base lg:text-xl font-semibold leading-relaxed mb-8 text-zinc-800 dark:text-zinc-100">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              
              let optionStyles = 'border-zinc-100 dark:border-zinc-800 active:bg-zinc-50';
              if (isSelected) optionStyles = 'border-primary ring-1 ring-primary/20 bg-indigo-50/20 dark:bg-indigo-900/10';
              if (isConfirmed) {
                if (isCorrect) optionStyles = 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/20';
                else if (isSelected && !isCorrect) optionStyles = 'border-rose-500 bg-rose-50/40 dark:bg-rose-900/20';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isConfirmed}
                  className={`w-full flex items-center gap-3 p-4 rounded-3xl border text-sm text-left transition-all ${optionStyles}`}
                >
                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                    isSelected ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1 font-medium leading-tight">{option}</span>
                  {isConfirmed && isCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                  {isConfirmed && isSelected && !isCorrect && <XCircle className="text-rose-500" size={20} />}
                </button>
              );
            })}
          </div>
        </div>

        {showRationale && !isMock && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 lg:p-8 rounded-4xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Info size={20} />
              <h3 className="text-sm font-bold">Clinical Rationale</h3>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-6 pb-[env(safe-area-inset-bottom,16px)] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button 
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={isConfirmed ? nextQuestion : handleConfirm}
            disabled={selectedOption === null}
            className={`flex-1 h-14 rounded-2xl font-bold transition-all shadow-lg text-sm ${
              selectedOption === null 
                ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800' 
                : 'bg-primary text-white shadow-primary/20 active:scale-[0.98]'
            }`}
          >
            {isConfirmed ? (currentIndex === questions.length - 1 ? 'Finish Drill' : 'Continue') : 'Submit Answer'}
          </button>

          <button className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 active:scale-95 transition-all">
            <Share2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
