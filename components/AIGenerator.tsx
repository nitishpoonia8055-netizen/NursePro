
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Play, ChevronLeft, Trash2, Key, AlertCircle, ShieldAlert, ExternalLink, ShieldCheck } from 'lucide-react';
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
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewList, setPreviewList] = useState<Question[] | null>(null);
  const [error, setError] = useState<{ message: string; needsKey: boolean } | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const initKeyCheck = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    };
    initKeyCheck();
  }, []);

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true); // Assume success per guidelines
        setError(null);
      } catch (e) {
        console.error("Failed to open key selector:", e);
      }
    }
  };

  const handleForge = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const qs = await forgeNursingQuestions(subject, count, difficulty, topic);
      setPreviewList(qs);
    } catch (err: any) {
      console.error("Forge error:", err);
      const errorMessage = err.message || String(err);
      
      const isAuthError = errorMessage === "API_KEY_MISSING" || 
                          errorMessage.toLowerCase().includes("api key") || 
                          errorMessage.includes("401");
      
      const isEntityNotFound = errorMessage.includes("Requested entity was not found");

      if (isAuthError || isEntityNotFound) {
        setHasKey(false);
        setError({
          message: isEntityNotFound 
            ? "Resource not found. Your selected API key may not have the Gemini API enabled or belongs to an inactive project. Please select a valid paid key."
            : "Authentication required. A valid Gemini API key is needed to forge new clinical scenarios.",
          needsKey: true
        });
        if ((window as any).aistudio?.openSelectKey) {
          await handleOpenKeySelector();
        }
      } else {
        setError({
          message: `Generation failed: ${errorMessage}`,
          needsKey: false
        });
      }
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

  if (hasKey === false) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-slide-up">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-primary/5">
          <Key size={40} />
        </div>
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-3">Clinical Forge Locked</h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
            To generate AI-powered clinical scenarios, you must select a Gemini API key from a billing-enabled Google Cloud project.
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleOpenKeySelector}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ShieldCheck size={20} /> Select Paid API Key
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            View Billing Requirements <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  if (previewList) {
    return (
      <div className="max-w-4xl mx-auto py-4 lg:py-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setPreviewList(null)} className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="text-center">
            <h2 className="text-lg lg:text-2xl font-bold">Forged Result</h2>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{previewList.length} items synthesized</p>
          </div>
          <button onClick={handleSaveAll} className="bg-primary text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">
            Commit to Memory
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {previewList.map((q, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-primary bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full uppercase tracking-widest border border-primary/10">{q.adpiePhase}</span>
                <button onClick={() => setPreviewList(prev => prev!.filter((_, i) => i !== idx))} className="text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              <h3 className="text-sm font-semibold leading-relaxed mb-6 text-zinc-800 dark:text-zinc-100">{q.text}</h3>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-4 rounded-xl border text-[13px] ${oIdx === q.correctIndex ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 font-bold' : 'border-zinc-50 dark:border-zinc-800 opacity-60 font-medium'}`}>
                    <span className="mr-3 opacity-50">{String.fromCharCode(65 + oIdx)}.</span> {opt}
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
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-10 pb-10 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-3xl mb-4 shadow-xl shadow-primary/5">
          <Sparkles size={32} />
        </div>
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-2">Clinical Forge</h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto font-medium">Synthesize high-fidelity clinical items for targeted drilling.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 lg:p-12 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
        {error && (
          <div className="p-4 border border-rose-100 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl text-rose-800 dark:text-rose-400">
            <div className="flex gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold mb-3 leading-relaxed">{error.message}</p>
                {error.needsKey && (
                  <button 
                    onClick={handleOpenKeySelector} 
                    className="text-xs bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 font-bold shadow-sm hover:bg-rose-50 transition-all flex items-center gap-2"
                  >
                    <Key size={14} /> Update API Key
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Focus Unit</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUBJECTS.map((s) => (
              <button 
                key={s.id} 
                onClick={() => setSubject(s.name)} 
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${subject === s.name ? 'border-primary bg-indigo-50/20 shadow-md shadow-primary/5' : 'border-zinc-50 dark:border-zinc-800'}`}
              >
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white shrink-0 shadow-md`}><Play size={12} fill="currentColor" /></div>
                <span className="font-bold text-[13px] truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Item Count</label>
            <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl">
              {[5, 10, 20].map(v => (
                <button key={v} onClick={() => setCount(v)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${count === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-400'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Difficulty</label>
            <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl">
              {['Beginner', 'Intermediate', 'Expert'].map(v => (
                <button 
                  key={v} 
                  onClick={() => setDifficulty(v as Difficulty)} 
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${difficulty === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-400'}`}
                >
                  {v === 'Intermediate' ? 'Mod' : v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Specific Clinical Area</label>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="e.g., Blood Transfusion, Triage Priorities..." 
            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
        </div>

        <button 
          onClick={handleForge} 
          disabled={isGenerating} 
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {isGenerating ? <><Loader2 className="animate-spin" size={20} /> Clinical Synthesis...</> : <><Sparkles size={20} /> Forge Items</>}
        </button>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">
            Powered by Gemini 3 Pro
          </p>
          <button onClick={handleOpenKeySelector} className="text-[10px] text-primary hover:underline font-bold transition-all">
            Manage System Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
