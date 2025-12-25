
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Type, 
  Link as LinkIcon, 
  Wifi, 
  FileText, 
  History, 
  Zap, 
  Scan, 
  Plus, 
  Layers,
  Settings,
  XCircle,
  Cpu,
  Upload
} from 'lucide-react';
import Button3D from './components/Button3D';
import QRCodePanel from './components/QRCodePanel';
import Logo from './components/Logo';
import QRScanner from './components/QRScanner';
import { QRType, QRConfig, HistoryItem } from './types';
import { getSmartLabel } from './services/geminiService';

const TabButton = memo(({ id, active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 flex flex-col items-center justify-center gap-2 py-3.5 px-1 rounded-xl transition-all relative group ${
      active ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    <Icon size={22} className={`${active ? 'scale-110' : 'scale-100'} transition-transform duration-200`} />
    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest leading-none">{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTabIndicator"
        className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl -z-10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
      />
    )}
  </button>
));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QRType>(QRType.URL);
  const [inputValue, setInputValue] = useState('https://google.com');
  const [label, setLabel] = useState('Neural Crystal');
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const [config, setConfig] = useState<QRConfig>({
    value: 'https://google.com',
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    size: 512,
    level: 'H',
    includeMargin: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('qr_uday_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('qr_uday_history', JSON.stringify(history.slice(0, 10)));
    }
  }, [history]);

  const generateQR = useCallback(async (customValue?: string) => {
    const val = customValue || inputValue;
    if (!val) return;

    // Instant Visual Feedback
    setConfig(prev => ({ ...prev, value: val }));
    
    // Background Label Sync
    setIsGeneratingLabel(true);
    try {
      const smartLabel = await getSmartLabel(val);
      setLabel(smartLabel);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: activeTab,
        value: val,
        timestamp: Date.now(),
        label: smartLabel
      };
      setHistory(prev => [newItem, ...prev.filter(i => i.value !== val)].slice(0, 12));
      
      if (window.innerWidth < 1024 && !customValue) {
        document.getElementById('qr-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setLabel("Sync Fault");
    } finally {
      setIsGeneratingLabel(false);
    }
  }, [inputValue, activeTab]);

  const handleScanResult = useCallback((result: string) => {
    setIsScannerOpen(false);
    setInputValue(result);
    generateQR(result);
  }, [generateQR]);

  const recentHistory = useMemo(() => history.slice(0, 4), [history]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 overflow-x-hidden pb-10 font-inter selection:bg-blue-500/30">
      <LayoutGroup>
        <div className="fixed inset-0 pointer-events-none -z-0 gpu-accel overflow-hidden opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        <AnimatePresence>
          {isScannerOpen && <QRScanner onScan={handleScanResult} onClose={() => setIsScannerOpen(false)} />}
        </AnimatePresence>

        <nav className="sticky top-0 z-40 glass-panel px-4 lg:px-10 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <Logo size={36} />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black font-orbitron tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-zinc-400 uppercase leading-none">
                QR UDAY <span className="text-blue-500 text-glow italic">3D</span>
              </h1>
              <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase mt-1">Neural Core V4.5</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsScannerOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-blue-400 active:scale-95 transition-all shadow-lg">
              <Scan size={20} />
            </button>
            <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-600 active:scale-95 shadow-lg">
              <Settings size={20} />
            </button>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Cpu size={16} className="text-blue-500" />
                <h2 className="font-orbitron text-xs font-black text-zinc-400 uppercase tracking-widest">Command Interface</h2>
              </div>
              
              <section className="glass-panel p-1.5 rounded-2xl flex gap-1 shadow-xl border border-white/10">
                <TabButton id={QRType.URL} active={activeTab === QRType.URL} onClick={setActiveTab} icon={LinkIcon} label="URL" />
                <TabButton id={QRType.TEXT} active={activeTab === QRType.TEXT} onClick={setActiveTab} icon={Type} label="Text" />
                <TabButton id={QRType.WIFI} active={activeTab === QRType.WIFI} onClick={setActiveTab} icon={Wifi} label="Wifi" />
                <TabButton id={QRType.FILE} active={activeTab === QRType.FILE} onClick={setActiveTab} icon={FileText} label="File" />
              </section>
            </div>

            <motion.section layout className="glass-panel p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
              <div className="space-y-6 relative z-10">
                <div className="space-y-3 relative">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="fill-blue-500" /> Source Data
                    </label>
                  </div>
                  
                  <div className="relative group">
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Input content for encoding..."
                      className="w-full bg-black/50 border border-zinc-800/80 rounded-2xl px-5 py-4 focus:border-blue-500/50 outline-none transition-all text-white text-base font-medium min-h-[120px] max-h-[180px] resize-none pr-14 shadow-inner"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-3">
                      {inputValue && (
                        <button onClick={() => setInputValue('')} className="p-2 bg-zinc-900 rounded-xl text-zinc-600 hover:text-rose-500 transition-colors shadow-md">
                          <XCircle size={20} />
                        </button>
                      )}
                      <button onClick={() => setIsScannerOpen(true)} className="p-2 bg-blue-600/10 rounded-xl text-blue-500 hover:bg-blue-600/20 transition-colors shadow-md" title="Scan Data">
                        <Scan size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Button3D onClick={() => generateQR()} disabled={!inputValue} className="w-full py-4 text-sm sm:text-base tracking-[0.3em] font-orbitron uppercase italic rounded-2xl">
                      CRYSTALLIZE
                    </Button3D>
                  </div>
                  <button onClick={() => setIsScannerOpen(true)} className="col-span-1 glass-panel flex flex-col items-center justify-center rounded-2xl hover:bg-zinc-800/60 transition-all border-blue-500/20 active:scale-95 group shadow-lg">
                    <Upload size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black mt-1 text-zinc-400 uppercase tracking-tighter">Import</span>
                  </button>
                </div>
              </div>
            </motion.section>

            {recentHistory.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-orbitron text-xs font-black text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                    <History size={16} className="text-blue-500" /> Recent History
                  </h4>
                  <button onClick={() => setHistory([])} className="text-xs font-bold text-zinc-600 hover:text-rose-400 uppercase tracking-widest transition-colors">Clear</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentHistory.map((item) => (
                    <motion.div 
                      key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.98 }}
                      className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-blue-500/30 active:bg-zinc-900 border border-white/5 group shadow-md"
                      onClick={() => { setInputValue(item.value); generateQR(item.value); }}
                    >
                      <div className="p-3 bg-zinc-950 rounded-xl text-blue-500 shadow-inner group-hover:text-blue-400 transition-colors">
                        {item.type === QRType.URL ? <LinkIcon size={18} /> : <Type size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-zinc-200 truncate group-hover:text-white transition-colors">{item.label || 'New Asset'}</p>
                        <p className="text-xs font-mono text-zinc-600 truncate mt-1">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div id="qr-result-section" className="lg:col-span-5 space-y-6">
            <QRCodePanel config={config} label={label} isGenerating={isGeneratingLabel} />
            
            <section className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
              <button onClick={() => setShowConfig(!showConfig)} className="w-full px-6 py-4 flex items-center justify-between text-zinc-400 hover:text-white transition-all group">
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-orbitron text-xs font-black tracking-widest uppercase">Matrix Parameters</span>
                </div>
                <Plus size={20} className={`transition-all duration-300 ${showConfig ? 'rotate-45 text-rose-500' : 'text-zinc-600'}`} />
              </button>
              
              <AnimatePresence>
                {showConfig && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Data Pattern</span>
                        <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-zinc-800 shadow-inner">
                          <input type="color" value={config.fgColor} onChange={(e) => setConfig({...config, fgColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                          <span className="text-xs font-mono text-zinc-400 uppercase">{config.fgColor}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Background</span>
                        <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-zinc-800 shadow-inner">
                          <input type="color" value={config.bgColor} onChange={(e) => setConfig({...config, bgColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                          <span className="text-xs font-mono text-zinc-400 uppercase">{config.bgColor}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </main>

        <footer className="text-center py-10 opacity-30 mt-6 border-t border-zinc-900/50">
          <p className="font-orbitron text-[10px] font-black tracking-[0.8em] text-zinc-600 uppercase">QR UDAY 3D // SYNC v4.5</p>
        </footer>
      </LayoutGroup>
    </div>
  );
};

export default App;
