
import React from 'react';
import { AppView, UserStats, Question } from '../types.ts';
import { SUBJECTS } from '../constants.ts';
import { TrendingUp, Award, Play, Database, Sparkles, Timer, Zap, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  setView: (view: AppView, subject?: string) => void;
  questions: Question[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setView, questions }) => {
  const masteryPercentage = stats.totalQuestionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;
    
  const unpracticedCount = questions.filter(q => q.practicedCount === 0).length;

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-1">Command Center</h1>
          <p className="text-sm lg:text-base text-zinc-500 dark:text-zinc-400">Tactical readiness: {masteryPercentage}% efficiency.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setView('FORGE')} 
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm"
           >
             <span className="flex items-center gap-2"><Sparkles size={18} /> AI Forge</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard icon={TrendingUp} label="Clinical Mastery" value={`${masteryPercentage}%`} color="text-primary" bg="bg-indigo-50 dark:bg-indigo-900/30" />
        <StatCard icon={Database} label="Scenario Bank" value={questions.length} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-900/30" />
        <StatCard icon={Award} label="Mastery" value={stats.masteryPoints} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/30" />
        <StatCard icon={Timer} label="Unpracticed" value={unpracticedCount} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold">Curriculum Hub</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {SUBJECTS.map((subject) => {
              const count = questions.filter(q => q.subject === subject.name).length;
              const practiced = questions.filter(q => q.subject === subject.name && q.practicedCount > 0).length;
              const progress = count > 0 ? (practiced / count) * 100 : 0;
              
              return (
                <button
                  key={subject.id}
                  onClick={() => setView('SUBJECT_BANK', subject.name)}
                  className="group bg-white dark:bg-zinc-900 p-4 lg:p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left transition-all active:scale-[0.98] shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className={`${subject.color} w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <Play size={14} fill="currentColor" />
                    </div>
                    <span className="text-[10px] lg:text-xs font-bold text-zinc-400 uppercase">{count} Scenarios</span>
                  </div>
                  <h3 className="font-bold text-sm lg:text-base mb-2 lg:mb-3">{subject.name}</h3>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6 order-1 lg:order-2">
          <h2 className="text-xl lg:text-2xl font-bold">Tactical Modes</h2>
          <div className="grid grid-cols-1 gap-3">
            <ActionCard 
              icon={Zap} 
              title="Practice Mode" 
              desc="Adaptive set of 10 items" 
              onClick={() => setView('PRACTICE')} 
              color="bg-rose-500" 
            />
            <ActionCard 
              icon={ShieldCheck} 
              title="Mock Mode" 
              desc="Timed 30-item exam simulator" 
              onClick={() => setView('MOCK_TEST')} 
              color="bg-indigo-600" 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
    <div className={`p-2 lg:p-3 ${bg} ${color} rounded-xl w-fit mb-3 lg:mb-4`}><Icon size={18} /></div>
    <div>
      <div className="text-lg lg:text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-zinc-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider truncate">{label}</div>
    </div>
  </div>
);

const ActionCard = ({ icon: Icon, title, desc, onClick, color }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl active:scale-[0.98] transition-all text-left shadow-sm">
    <div className={`${color} w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}><Icon size={22} /></div>
    <div>
      <div className="font-bold text-sm lg:text-base">{title}</div>
      <div className="text-[11px] lg:text-xs text-zinc-500 leading-tight">{desc}</div>
    </div>
  </button>
);

export default Dashboard;
