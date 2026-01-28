
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Settings as SettingsIcon, 
  Sparkles,
  Menu,
  X,
  Moon,
  Sun,
  Flame,
  Zap
} from 'lucide-react';
import { AppState, AppView, Question, UserStats } from './types.ts';
import { SUBJECTS, INITIAL_QUESTIONS } from './constants.ts';
import Dashboard from './components/Dashboard.tsx';
import PracticeMode from './components/PracticeMode.tsx';
import AIGenerator from './components/AIGenerator.tsx';
import SubjectBank from './components/SubjectBank.tsx';
import Settings from './components/Settings.tsx';
import Analytics from './components/Analytics.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nursepro_v2_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.questions)) return parsed;
      } catch (e) {
        console.error("State Load Error", e);
      }
    }
    return {
      view: 'DASHBOARD',
      questions: INITIAL_QUESTIONS.map(q => ({ ...q, practicedCount: 0 })),
      stats: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        masteryPoints: 0,
        subjectPerformance: {},
        adpiePerformance: {}
      },
      darkMode: false
    };
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nursepro_v2_state', JSON.stringify(state));
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state]);

  const setView = (view: AppView, subject?: string) => {
    setState(prev => ({ ...prev, view, currentSubject: subject }));
    setSidebarOpen(false);
  };

  const updateStats = (id: string | number, isCorrect: boolean) => {
    setState(prev => {
      const q = prev.questions.find(item => String(item.id) === String(id));
      if (!q) return prev;

      const newQuestions = prev.questions.map(item => 
        String(item.id) === String(id) 
          ? { ...item, practicedCount: item.practicedCount + 1, lastResult: isCorrect ? 'correct' : 'incorrect' } as Question
          : item
      );

      const subj = q.subject;
      const phase = q.adpiePhase || 'General';
      
      const newStats: UserStats = {
        ...prev.stats,
        totalQuestionsAnswered: prev.stats.totalQuestionsAnswered + 1,
        correctAnswers: prev.stats.correctAnswers + (isCorrect ? 1 : 0),
        masteryPoints: prev.stats.masteryPoints + (isCorrect ? 25 : 5),
        subjectPerformance: {
          ...prev.stats.subjectPerformance,
          [subj]: {
            correct: (prev.stats.subjectPerformance[subj]?.correct || 0) + (isCorrect ? 1 : 0),
            total: (prev.stats.subjectPerformance[subj]?.total || 0) + 1
          }
        },
        adpiePerformance: {
          ...prev.stats.adpiePerformance,
          [phase]: {
            correct: (prev.stats.adpiePerformance[phase]?.correct || 0) + (isCorrect ? 1 : 0),
            total: (prev.stats.adpiePerformance[phase]?.total || 0) + 1
          }
        }
      };

      return { ...prev, questions: newQuestions, stats: newStats };
    });
  };

  const renderView = () => {
    switch (state.view) {
      case 'DASHBOARD': return <Dashboard stats={state.stats} setView={setView} questions={state.questions} />;
      case 'SUBJECT_BANK': return (
        <SubjectBank 
          subjectName={state.currentSubject!} 
          questions={state.questions.filter(q => q.subject === state.currentSubject)} 
          onDelete={(id) => setState(p => ({ ...p, questions: p.questions.filter(q => q.id !== id) }))}
          onStartPractice={() => setView('PRACTICE', state.currentSubject)}
          onBack={() => setView('DASHBOARD')}
        />
      );
      case 'PRACTICE': 
        const pool = state.currentSubject ? state.questions.filter(q => q.subject === state.currentSubject) : state.questions;
        return <PracticeMode questions={pool.slice(0, 10)} onFinish={() => setView('DASHBOARD')} onAnswer={updateStats} />;
      case 'FORGE': return <AIGenerator onGenerated={(qs) => setState(p => ({ ...p, questions: [...qs, ...p.questions] }))} setView={setView} />;
      case 'ANALYTICS': return <Analytics stats={state.stats} questions={state.questions} />;
      case 'SETTINGS': return <Settings state={state} onImport={s => setState(s)} onReset={() => { localStorage.clear(); window.location.reload(); }} />;
      default: return <Dashboard stats={state.stats} setView={setView} questions={state.questions} />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-all ${state.darkMode ? 'bg-zinc-950 text-white' : 'bg-[#f8fafc] text-zinc-900'}`}>
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-6 z-[60] lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg"><Flame size={24} /></div>
            <span className="font-bold text-2xl tracking-tight">NursePro</span>
          </div>
          <nav className="flex-1 space-y-1.5">
            {[
              { id: 'DASHBOARD', label: 'Command Center', icon: LayoutDashboard },
              { id: 'ANALYTICS', label: 'Retention Matrix', icon: Database },
              { id: 'FORGE', label: 'AI Forge', icon: Sparkles },
              { id: 'SETTINGS', label: 'System', icon: SettingsIcon },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id as AppView)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all ${state.view === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <button onClick={() => setState(p => ({ ...p, darkMode: !p.darkMode }))} className="mt-auto flex items-center gap-3 p-4 text-zinc-500 hover:text-primary transition-all">
            {state.darkMode ? <Sun size={20} /> : <Moon size={20} />} 
            <span className="font-semibold text-sm">{state.darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-72 p-4 lg:p-10">{renderView()}</main>
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl z-[100] flex items-center justify-center">
        {isSidebarOpen ? <X /> : <Menu />}
      </button>
    </div>
  );
};

export default App;
