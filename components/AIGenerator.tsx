
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Play, ChevronLeft, Check, Trash2, Key, AlertCircle } from 'lucide-react';
import { forgeNursingQuestions } from '../services/geminiService.ts';
import { Question, AppView, Difficulty } from '../types.ts';
import { SUBJECTS } from '../constants.ts';

interface AIGeneratorProps {
  onGenerated: (qs: Question[]) => void;
  setView: (view: AppView) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerated, setView }) => {
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  // Fix: Set initial difficulty state to a valid Difficulty type member.
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewList, setPreviewList] = useState<Question[] | null>(null);
  const [error, setError] = useState<{ message: string; needsKey: boolean; isQuota: boolean } | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
      setError(null);
    }
  };

  const handleForge = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const qs = await forgeNursingQuestions(subject, count, difficulty, topic, 'gemini-3-flash-preview');
      setPreviewList(qs);
    } catch (err: any) {
      const errorMessage = err.message || "";
      const isQuota = errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota");
      const isKeyError = errorMessage.includes("API_KEY") || errorMessage.includes("401");
      setError({
        message: isQuota ? "Quota reached. Wait 60s or use a paid key." : "Generation failed. Check your network.",
        needsKey: isKeyError || isQuota,
        isQuota: isQuota
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = () => {
    if (previewList) {
      onGenerated(previewList);
      setView('DASHBOARD');
    }
  };

  if (previewList) {
    return (
      <div className="max-w-4xl mx-auto py-4 lg:py-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setPreviewList(null)} className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="text-center">
            <h2 className="text-lg lg:text-2xl font-bold">Forged Result</h2>
            <p className="text-zinc-500 text-[11px] font-bold uppercase">{previewList.length} items ready</p>
          </div>
          <button onClick={handleSaveAll} className="bg-primary text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">
            Save
          </button>
        </div>

        <div className="space-y-4">
          {previewList.map((q, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-primary bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full uppercase tracking-widest">{q.chapter}</span>
                <button onClick={() => setPreviewList(prev => prev!.filter((_, i) => i !== idx))} className="text-zinc-300 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
              <h3 className="text-sm font-semibold leading-relaxed mb-6">{q.text}</h3>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-3 rounded-xl border text-[13px] ${oIdx === q.correctIndex ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700' : 'border-zinc-50 dark:border-zinc-800 opacity-60'}`}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-10 pb-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-3xl mb-4 shadow-xl shadow-primary/5">
          <Sparkles size={32} />
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">AI Forge</h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">Generate high-fidelity clinical items for targeted drilling.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-5 lg:p-12 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
        {error && (
          <div className={`p-4 border rounded-2xl text-sm ${error.isQuota ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            <div className="flex gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-bold mb-1">{error.isQuota ? 'Quota Limit' : 'Error'}</p>
                <p className="text-xs mb-3">{error.message}</p>
                {error.needsKey && (
                  <button onClick={handleOpenKeySelector} className="text-xs bg-white px-3 py-1.5 rounded-lg border font-bold shadow-sm">Select Paid Key</button>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center lg:text-left">Focus Unit</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUBJECTS.map((s) => (
              <button 
                key={s.id} 
                onClick={() => setSubject(s.name)} 
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${subject === s.name ? 'border-primary bg-indigo-50/20' : 'border-zinc-50 dark:border-zinc-800'}`}
              >
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white shrink-0 shadow-md`}><Play size={12} fill="currentColor" /></div>
                <span className="font-bold text-[13px] truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Quantity</label>
            <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl">
              {[5, 10, 20].map(v => (
                <button key={v} onClick={() => setCount(v)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${count === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-400'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Difficulty</label>
            <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl">
              {['Easy', 'Mod'].map(v => (
                <button 
                  key={v} 
                  onClick={() => setDifficulty(v === 'Mod' ? 'Intermediate' : 'Beginner')} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                    (v === 'Easy' && difficulty === 'Beginner') || (v === 'Mod' && difficulty === 'Intermediate')
                      ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' 
                      : 'text-zinc-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Specific Topic</label>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="e.g., Triage priority..." 
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary" 
          />
        </div>

        <button 
          onClick={handleForge} 
          disabled={isGenerating} 
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {isGenerating ? <><Loader2 className="animate-spin" size={20} /> Forging...</> : <><Sparkles size={20} /> Forge Scenarios</>}
        </button>
      </div>
    </div>
  );
};

export default AIGenerator;
