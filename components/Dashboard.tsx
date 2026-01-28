
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
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">Command Center</h2>
          <p className="text-slate-500 font-medium">System operational. Readiness at <span className="text-primary font-bold">{accuracy}%</span> capacity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('MOCK_TEST')} className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-3">
            <Activity size={20} /> Launch Code Blue
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          icon={Target} 
          label="Clinical Precision" 
          value={`${accuracy}%`} 
          sub="Accuracy Rating"
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          icon={BookOpen} 
          label="Scenario Bank" 
          value={questions.length} 
          sub="Items Forged"
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard 
          icon={Award} 
          label="Mastery Points" 
          value={stats.masteryPoints.toLocaleString()} 
          sub="Clinical XP"
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard 
          icon={Clock} 
          label="Active Session" 
          value={stats.totalQuestionsAnswered} 
          sub="Questions Attempted"
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Subject Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Curriculum Hub</h3>
            <button onClick={() => setView('ANALYTICS')} className="text-primary font-bold text-sm hover:underline">View All Analytics</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SUBJECTS.map((s) => {
              const qCount = questions.filter(q => q.subject === s.name).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setView('SUBJECT_BANK', s.name)}
                  className="group relative overflow-hidden glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all text-left clinical-shadow"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${s.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <Activity size={22} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{qCount} Items</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{s.name}</h4>
                  <div className="flex items-center text-primary font-bold text-xs">
                    Access Scenarios <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Readiness */}
        <aside className="space-y-6">
          <h3 className="text-xl font-bold">Tactical Training</h3>
          <div className="space-y-4">
             <ActionCard 
               icon={Zap} 
               title="Flash Drill" 
               desc="Randomized 10-item adaptive set."
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
             <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={60} /></div>
                <h4 className="font-bold text-lg mb-2">Retention Tip</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">You've mastered <b>Assessment</b> but are lagging in <b>Evaluation</b>. Target your next forge there.</p>
                <button onClick={() => setView('FORGE')} className="text-xs font-bold text-primary hover:text-white transition-colors">Start Targeted Forge →</button>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color, bg }: any) => (
  <div className="glass-card p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 clinical-shadow">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
      <Icon size={22} />
    </div>
    <div className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1">{value}</div>
    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{sub}</div>
  </div>
);

const ActionCard = ({ icon: Icon, title, desc, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-5 glass-card rounded-[28px] border border-slate-200 dark:border-slate-800 hover:border-primary/20 transition-all text-left group"
  >
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={22} />
    </div>
    <div>
      <div className="font-bold text-slate-900 dark:text-white">{title}</div>
      <div className="text-xs text-slate-500 leading-tight">{desc}</div>
    </div>
  </button>
);

export default Dashboard;
