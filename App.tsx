
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings as SettingsIcon, 
  Sparkles,
  Menu,
  X,
  Moon,
  Sun,
  Stethoscope,
  Target
} from 'lucide-react';
import { AppState, AppView, Question, UserStats } from './types';
import { INITIAL_QUESTIONS } from './constants';

// Components
import Dashboard from './components/Dashboard';
import PracticeMode from './components/PracticeMode';
import AIGenerator from './components/AIGenerator';
import SubjectBank from './components/SubjectBank';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nursepro_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.questions)) return parsed;
      } catch (e) { console.error("Restore Error:", e); }
    }
    return {
      view: 'DASHBOARD',
      questions: INITIAL_QUESTIONS,
      stats: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        masteryPoints: 0,
        subjectPerformance: {},
        adpiePerformance: {},
        streak: 0,
        lastActive: new Date().toISOString()
      },
      darkMode: false
    };
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nursepro_state_v2', JSON.stringify(state));
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state]);

  const setView = useCallback((view: AppView, subject?: string) => {
    setState(prev => ({ ...prev, view, currentSubject: subject }));
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateStats = useCallback((id: string | number, isCorrect: boolean) => {
    setState(prev => {
      const q = prev.questions.find(item => String(item.id) === String(id));
      if (!q) return prev;

      const newQuestions = prev.questions.map(item => 
        String(item.id) === String(id) 
          ? { ...item, practicedCount: item.practicedCount + 1, lastResult: isCorrect ? 'correct' : 'incorrect' } as Question
          : item
      );

      const subj = q.subject;
      const phase = q.adpiePhase;
      
      const newStats: UserStats = {
        ...prev.stats,
        totalQuestionsAnswered: prev.stats.totalQuestionsAnswered + 1,
        correctAnswers: prev.stats.correctAnswers + (isCorrect ? 1 : 0),
        masteryPoints: prev.stats.masteryPoints + (isCorrect ? 50 : 10),
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
        },
        lastActive: new Date().toISOString()
      };

      return { ...prev, questions: newQuestions, stats: newStats };
    });
  }, []);

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
      case 'MOCK_TEST':
        const isMock = state.view === 'MOCK_TEST';
        const count = isMock ? 25 : 10;
        const filtered = state.currentSubject 
          ? state.questions.filter(q => q.subject === state.currentSubject)
          : state.questions;
        const set = [...filtered].sort(() => 0.5 - Math.random()).slice(0, count);
        return <PracticeMode questions={set} isMock={isMock} onFinish={() => setView('DASHBOARD')} onAnswer={updateStats} />;
      case 'FORGE': return <AIGenerator onGenerated={(qs) => setState(p => ({ ...p, questions: [...qs, ...p.questions] }))} setView={setView} />;
      case 'ANALYTICS': return <Analytics stats={state.stats} questions={state.questions} />;
      case 'SETTINGS': return <Settings state={state} onImport={s => setState(s)} onReset={() => { localStorage.clear(); window.location.reload(); }} />;
      default: return <Dashboard stats={state.stats} setView={setView} questions={state.questions} />;
    }
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'Command', icon: LayoutDashboard },
    { id: 'ANALYTICS', label: 'Matrix', icon: BarChart3 },
    { id: 'FORGE', label: 'Forge', icon: Sparkles },
    { id: 'PRACTICE', label: 'Drill', icon: Target },
  ];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${state.darkMode ? 'dark' : ''}`}>
      {/* Sidebar - Desktop Only */}
      <aside className={`fixed inset-y-0 left-0 w-[var(--sidebar-w)] glass-card border-r border-slate-200 dark:border-slate-800 p-8 z-50 hidden lg:flex flex-col`}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter">NursePro</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical HQ</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-200 group ${
                state.view === item.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={20} className={state.view === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
              <span>{item.label} Center</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
           <button
            onClick={() => setState(p => ({ ...p, darkMode: !p.darkMode }))}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{state.darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
          <button
            onClick={() => setView('SETTINGS')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              state.view === 'SETTINGS' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[var(--sidebar-w)] pb-24 lg:pb-0 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-2">
              <Stethoscope className="text-primary" size={24} />
              <span className="font-extrabold text-xl tracking-tighter">NursePro</span>
           </div>
           <button onClick={() => setView('SETTINGS')} className="p-2 text-slate-500 hover:text-primary transition-colors">
              <SettingsIcon size={22} />
           </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-12">
          <div className="animate-slide-up">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 z-50 px-4 py-2 flex items-center justify-around pb-[env(safe-area-inset-bottom,12px)]">
        {navItems.map(item => {
          const isActive = state.view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`flex flex-col items-center gap-1 p-2 transition-all min-w-[64px] ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
