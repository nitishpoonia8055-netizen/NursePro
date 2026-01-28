
import React from 'react';
import { AppView, UserStats, Question } from '../types.ts';
import { SUBJECTS } from '../constants.ts';
import { Zap, Target, BookOpen, Clock, ChevronRight, Activity, Award, Sparkles } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  setView: (view: AppView, subject?: string) => void;
  questions: Question[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setView, questions }) => {
  const accuracy = stats.totalQuestionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;
    
  return (
    <div className="space-y-6 lg:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-1">Command Center</h2>
          <p className="text-slate-500 text-sm font-medium">Readiness at <span className="text-primary font-bold">{accuracy}%</span> capacity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('MOCK_TEST')} 
            className="w-full md:w-auto px-5 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Activity size={18} /> Launch Code Blue
          </button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          icon={Target} 
          label="Precision" 
          value={`${accuracy}%`} 
          sub="Accuracy"
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          icon={BookOpen} 
          label="Scenario Bank" 
          value={questions.length} 
          sub="Banked"
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard 
          icon={Award} 
          label="Mastery" 
          value={stats.masteryPoints.toLocaleString()} 
          sub="Points"
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard 
          icon={Clock} 
          label="Active" 
          value={stats.totalQuestionsAnswered} 
          sub="Attempts"
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Subject Hub */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg lg:text-xl font-bold">Curriculum Hub</h3>
            <button onClick={() => setView('ANALYTICS')} className="text-primary font-bold text-xs hover:underline">Full Analytics</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {SUBJECTS.map((s) => {
              const qCount = questions.filter(q => q.subject === s.name).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setView('SUBJECT_BANK', s.name)}
                  className="group relative overflow-hidden glass-card p-4 lg:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all text-left clinical-shadow active:scale-[0.98]"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-12 -mt-12`} />
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className={`${s.color} w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <Activity size={20} />
                    </div>
                    <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{qCount} Items</span>
                  </div>
                  <h4 className="font-bold text-base lg:text-lg mb-0.5">{s.name}</h4>
                  <div className="flex items-center text-primary font-bold text-[10px] lg:text-xs">
                    Access <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Training Section - Simplified */}
        <aside className="space-y-4 lg:space-y-6">
          <h3 className="text-lg lg:text-xl font-bold">Tactical Training</h3>
          <div className="space-y-3 lg:space-y-4">
             <ActionCard 
               icon={Zap} 
               title="Flash Drill" 
               desc="Random 10-item adaptive set."
               onClick={() => setView('PRACTICE')}
               color="bg-indigo-600"
             />
             <ActionCard 
               icon={Sparkles} 
               title="AI Forge" 
               desc="Forge custom clinical scenarios."
               onClick={() => setView('FORGE')}
               color="bg-emerald-600"
             />
             <div className="hidden lg:block p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={60} /></div>
                <h4 className="font-bold text-lg mb-2">Retention Tip</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Focus on your weak points in Pharmacology today.</p>
                <button onClick={() => setView('FORGE')} className="text-xs font-bold text-primary hover:text-white transition-colors">Target Forge →</button>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color, bg }: any) => (
  <div className="glass-card p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-200 dark:border-slate-800 clinical-shadow">
    <div className={`w-9 h-9 lg:w-12 lg:h-12 ${bg} ${color} rounded-lg lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-4 shadow-sm`}>
      <Icon size={18} />
    </div>
    <div className="text-xl lg:text-3xl font-extrabold tracking-tight">{value}</div>
    <div className="text-[9px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{sub}</div>
  </div>
);

const ActionCard = ({ icon: Icon, title, desc, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 lg:gap-4 p-4 lg:p-5 glass-card rounded-[24px] lg:rounded-[28px] border border-slate-200 dark:border-slate-800 hover:border-primary/20 transition-all text-left group active:scale-[0.98]"
  >
    <div className={`${color} w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={18} />
    </div>
    <div>
      <div className="font-bold text-sm lg:text-base text-slate-900 dark:text-white">{title}</div>
      <div className="text-[10px] lg:text-xs text-slate-500 leading-tight">{desc}</div>
    </div>
  </button>
);

export default Dashboard;
