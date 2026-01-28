
import React from 'react';
import { UserStats, Question } from '../types';
import { SUBJECTS } from '../constants';

interface AnalyticsProps {
  stats: UserStats;
  questions: Question[];
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, questions }) => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Performance Intelligence</h1>
        <p className="text-zinc-500">Metric-based insights into your clinical competency.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-8">Retention Matrix</h2>
          <div className="space-y-8">
            {SUBJECTS.map(s => {
              const subjStats = stats.subjectPerformance[s.name] || { correct: 0, total: 0 };
              const accuracy = subjStats.total > 0 ? Math.round((subjStats.correct / subjStats.total) * 100) : 0;
              
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-zinc-500">{s.name}</span>
                    <span className="text-primary">{accuracy}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 text-center">
             <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (stats.totalQuestionsAnswered > 0 ? stats.correctAnswers / stats.totalQuestionsAnswered : 0))} className="text-primary" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold">{stats.totalQuestionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100) : 0}%</span>
                   <span className="text-[10px] text-zinc-400 font-bold uppercase">Accuracy</span>
                </div>
             </div>
             <h3 className="text-lg font-bold">Overall Clinical Precision</h3>
             <p className="text-zinc-500 text-sm mt-2">Target &gt;85% for NORCET Tier-1 eligibility.</p>
          </div>

          <div className="bg-primary p-8 rounded-[32px] text-white shadow-xl shadow-primary/30">
             <h3 className="text-lg font-bold mb-2">AI Diagnostic</h3>
             <p className="text-indigo-100 text-sm leading-relaxed italic">"Your performance in Pharmacology is lagging behind Medical-Surgical units. Recommend generating a focused drill in IV Titration and Antibiotics protocols."</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
