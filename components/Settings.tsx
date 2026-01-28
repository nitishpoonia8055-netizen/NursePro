
import React from 'react';
import { AppState } from '../types.ts';
import { Download, Upload, Trash2, ShieldCheck, Database } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onImport: (state: AppState) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onImport, onReset }) => {
  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `nursepro_export_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
        alert("Knowledge Bank imported successfully.");
      } catch (err) {
        alert("Invalid export file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">System Config</h1>
        <p className="text-zinc-500">Manage knowledge bank integrity and data portability.</p>
      </header>

      <div className="space-y-6">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-primary rounded-2xl"><Database size={24} /></div>
            <h2 className="text-xl font-bold">Data Management</h2>
          </div>
          <p className="text-zinc-500 text-sm">Download your entire clinical scenario bank and progress stats for offline backup.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={exportData} className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
              <Download size={20} /> Export Bank
            </button>
            <label className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center">
              <span className="flex items-center gap-2"><Upload size={20} /> Import Bank</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl"><Trash2 size={24} /></div>
            <h2 className="text-xl font-bold text-rose-500">Danger Zone</h2>
          </div>
          <p className="text-zinc-500 text-sm">This action cannot be undone. All clinical scenarios and performance metrics will be purged.</p>
          <button onClick={onReset} className="w-full p-5 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 hover:scale-[1.01] active:scale-95 transition-all">
            Factory Reset Memory
          </button>
        </section>

        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-6">
           <ShieldCheck size={32} className="text-primary shrink-0" />
           <div>
             <h3 className="font-bold mb-1">Privacy Protocol</h3>
             <p className="text-zinc-500 text-sm">All clinical data is stored locally in your browser sandbox. No patient-simulated scenarios are sent to external servers except for AI generation processing.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
