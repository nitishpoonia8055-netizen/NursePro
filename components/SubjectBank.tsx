
import React, { useState } from 'react';
import { Question } from '../types.ts';
import { Search, ChevronLeft, Trash2, BookOpen, Play } from 'lucide-react';

interface SubjectBankProps {
  subjectName: string;
  questions: Question[];
  onDelete: (id: string | number) => void;
  onStartPractice: () => void;
  onBack: () => void;
}

const SubjectBank: React.FC<SubjectBankProps> = ({ subjectName, questions, onDelete, onStartPractice, onBack }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpracticed' | 'reviewed'>('all');

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    if (filter === 'unpracticed') return matchesSearch && q.practicedCount === 0;
    if (filter === 'reviewed') return matchesSearch && q.practicedCount > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4 font-medium">
            <ChevronLeft size={20} /> Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{subjectName}</h1>
          <p className="text-zinc-500">{questions.length} Scenarios Banked</p>
        </div>
        <button onClick={onStartPractice} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center gap-3 hover:scale-105 transition-all">
          <Play size={20} fill="currentColor" /> Launch Practice
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search bank..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          {(['all', 'unpracticed', 'reviewed'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredQuestions.length > 0 ? filteredQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 flex gap-6 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="shrink-0 space-y-2 flex flex-col items-center">
               <div className={`p-2 rounded-xl ${q.lastResult === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' : q.lastResult === 'incorrect' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'}`}>
                 <BookOpen size={20} />
               </div>
               <span className="text-[10px] font-bold uppercase text-zinc-400">{q.practicedCount}x</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">{q.adpiePhase}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{q.difficulty}</span>
              </div>
              <p className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">{q.text}</p>
            </div>
            <button onClick={() => onDelete(q.id)} className="p-3 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
          </div>
        )) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-500">No matching scenarios found in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectBank;
