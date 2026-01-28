
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
import { AppState, AppView, Question, UserStats } from './types';
import { SUBJECTS, INITIAL_QUESTIONS } from './constants';
import Dashboard from './components/Dashboard';
import PracticeMode from './components/PracticeMode';
import AIGenerator from './components/AIGenerator';
import SubjectBank from './components/SubjectBank';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nursepro_v2_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.questions)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    return {
      view: 'DASHBOARD',
      questions: INITIAL_QUESTIONS.map(q => ({ ...q, practicedCount: 0 })),
      stats: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        masteryPoints: 0,
        subjectPerformance: {}
      },
      darkMode: false
    };
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nursepro_v2_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const toggleDarkMode = () => setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  
  const setView = (view: AppView, subject?: string) => {
    setState(prev => ({ ...prev, view, currentSubject: subject }));
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const updateQuestionStats = (id: string | number, isCorrect: boolean) => {
    setState(prev => {
      const qIndex = prev.questions.findIndex(q => String(q.id) === String(id));
      if (qIndex === -1) return prev;
      
      const newQuestions = [...prev.questions];
      const q = newQuestions[qIndex];
      newQuestions[qIndex] = {
        ...q,
        practicedCount: q.practicedCount + 1,
        lastResult: isCorrect ? 'correct' : 'incorrect'
      };

      const subj = q.subject;
      const prevSubjStats = prev.stats.subjectPerformance[subj] || { correct: 0, total: 0 };
      
      const newStats: UserStats = {
        ...prev.stats,
        totalQuestionsAnswered: prev.stats.totalQuestionsAnswered + 1,
        correctAnswers: prev.stats.correctAnswers + (isCorrect ? 1 : 0),
        masteryPoints: prev.stats.masteryPoints + (isCorrect ? 15 : 2),
        subjectPerformance: {
          ...prev.stats.subjectPerformance,
          [subj]: {
            correct: prevSubjStats.correct + (isCorrect ? 1 : 0),
            total: prevSubjStats.total + 1
          }
        }
      };

      return { ...prev, questions: newQuestions, stats: newStats };
    });
  };

  const addQuestions = (newQuestions: Question[]) => {
    setState(prev => ({
      ...prev,
      questions: [...newQuestions, ...prev.questions]
    }));
  };

  const deleteQuestion = (id: string | number) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.filter(q => String(q.id) !== String(id))
    }));
  };

  const factoryReset = () => {
    if (confirm("Purge knowledge bank? This action is permanent.")) {
      localStorage.removeItem('nursepro_v2_state');
      window.location.reload();
    }
  };

  const getRandomQuestions = (allQuestions: Question[], count: number) => {
    if (!allQuestions.length) return [];
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const renderView = () => {
    switch (state.view) {
      case 'DASHBOARD':
        return <Dashboard stats={state.stats} setView={setView} questions={state.questions} />;
      case 'SUBJECT_BANK':
        return (
          <SubjectBank 
            subjectName={state.currentSubject!} 
            questions={state.questions.filter(q => q.subject === state.currentSubject)} 
            onDelete={deleteQuestion}
            onStartPractice={() => setView('PRACTICE', state.currentSubject)}
            onBack={() => setView('DASHBOARD')}
          />
        );
      case 'PRACTICE':
        const filtered = state.currentSubject 
          ? state.questions.filter(q => q.subject === state.currentSubject)
          : state.questions;
        const practiceSet = getRandomQuestions(filtered, 10);
        return (
          <PracticeMode 
            questions={practiceSet} 
            onFinish={() => setView('DASHBOARD')}
            onAnswer={updateQuestionStats}
          />
        );
      case 'MOCK_TEST':
        const mockSet = getRandomQuestions(state.questions, 30);
        return (
          <PracticeMode 
            questions={mockSet}
            isMock={true}
            onFinish={() => setView('DASHBOARD')}
            onAnswer={updateQuestionStats}
          />
        );
      case 'FORGE':
        return <AIGenerator onGenerated={addQuestions} setView={setView} />;
      case 'ANALYTICS':
        return <Analytics stats={state.stats} questions={state.questions} />;
      case 'SETTINGS':
        return <Settings state={state} onImport={(s) => setState(s)} onReset={factoryReset} />;
      default:
        return <Dashboard stats={state.stats} setView={setView} questions={state.questions} />;
    }
  };

  const NavItem = ({ icon: Icon, label, view, active }: any) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold text-[15px]">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${state.darkMode ? 'bg-zinc-950 text-white' : 'bg-[#f8fafc] text-zinc-900'}`}>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 px-4 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white"><Flame size={18} /></div>
          <span className="font-bold text-lg tracking-tight">NursePro</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-800 rounded-lg">
          <Menu size={22} />
        </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-6 z-[60] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg"><Flame size={20} /></div>
              <span className="font-bold text-xl tracking-tight">NursePro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400"><X size={22} /></button>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto hide-scrollbar">
            <NavItem icon={LayoutDashboard} label="Command Center" view="DASHBOARD" active={state.view === 'DASHBOARD'} />
            <NavItem icon={Database} label="Knowledge Bank" view="ANALYTICS" active={state.view === 'ANALYTICS'} />
            <NavItem icon={Sparkles} label="AI Forge" view="FORGE" active={state.view === 'FORGE'} />
            <NavItem icon={Zap} label="Practice Drill" view="PRACTICE" active={state.view === 'PRACTICE'} />
            <NavItem icon={Zap} label="Mock Test" view="MOCK_TEST" active={state.view === 'MOCK_TEST'} />
          </nav>

          <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
            <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              <span className="flex items-center gap-3 font-semibold text-[15px]">{state.darkMode ? <Sun size={20} /> : <Moon size={20} />} Appearance</span>
            </button>
            <NavItem icon={SettingsIcon} label="System" view="SETTINGS" active={state.view === 'SETTINGS'} />
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 pt-14 lg:pt-0 max-w-full lg:max-w-6xl mx-auto w-full min-h-screen">
        <div className="p-4 lg:p-10 animate-fade-in h-full">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
