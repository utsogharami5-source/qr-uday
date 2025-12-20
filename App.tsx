
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Link as LinkIcon, 
  Wifi, 
  User, 
  FileText, 
  Settings, 
  History, 
  Info,
  QrCode,
  Zap,
  X,
  File
} from 'lucide-react';
import Button3D from './components/Button3D';
import QRCodePanel from './components/QRCodePanel';
import { QRType, QRConfig, HistoryItem } from './types';
import { getSmartLabel, analyzeFileContent } from './services/geminiService';

interface FileDetails {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QRType>(QRType.URL);
  const [inputValue, setInputValue] = useState('https://google.com');
  const [label, setLabel] = useState('My Awesome QR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  
  const [config, setConfig] = useState<QRConfig>({
    value: 'https://google.com',
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    size: 256,
    level: 'H',
    includeMargin: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      // Logic for Gemini smart labeling
      const smartLabel = await getSmartLabel(inputValue);
      setLabel(smartLabel);
      
      setConfig(prev => ({ ...prev, value: inputValue }));
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: activeTab,
        value: inputValue,
        timestamp: Date.now(),
        label: smartLabel
      };
      
      setHistory(prev => [newItem, ...prev].slice(0, 5));
      
      // Scroll to result on mobile
      if (window.innerWidth < 1024) {
        document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL for images
    let previewUrl = undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    const details: FileDetails = {
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl
    };
    setSelectedFile(details);

    setIsGenerating(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      if (file.type.startsWith('image/')) {
        const description = await analyzeFileContent(base64, file.type);
        setInputValue(`File: ${file.name} - ${description}`);
      } else {
        setInputValue(`File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      }
      setIsGenerating(false);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    setInputValue('');
  };

  const renderInputArea = () => {
    switch (activeTab) {
      case QRType.URL:
        return (
          <div className="space-y-4">
            <label className="block text-zinc-400 text-sm font-semibold mb-2">Website Link</label>
            <input 
              type="url" 
              value={inputValue}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-white text-base"
            />
          </div>
        );
      case QRType.TEXT:
        return (
          <div className="space-y-4">
            <label className="block text-zinc-400 text-sm font-semibold mb-2">Simple Text</label>
            <textarea 
              value={inputValue}
              onChange={handleInputChange}
              rows={4}
              placeholder="Type anything here..."
              className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-white resize-none text-base"
            />
          </div>
        );
      case QRType.WIFI:
        return (
          <div className="space-y-4">
            <p className="text-zinc-500 text-xs mb-2">Easily connect to your network.</p>
            <input 
              type="text" 
              onChange={handleInputChange}
              placeholder="SSID:Name;PASS:Password;TYPE:WPA"
              className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-white text-base"
            />
          </div>
        );
      case QRType.FILE:
        return (
          <div className="space-y-4">
            <label className="block text-zinc-400 text-sm font-semibold mb-2">File Assets</label>
            {!selectedFile ? (
              <div className="relative h-40 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center hover:border-blue-500 transition-colors group bg-zinc-800/20">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center group-hover:scale-105 transition-transform">
                  <FileText className="mx-auto mb-2 text-zinc-500 group-hover:text-blue-500" size={32} />
                  <span className="text-zinc-400 font-semibold block">Drop file here</span>
                  <span className="text-zinc-600 text-xs">Images, PDFs, or Docs</span>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
              >
                <button 
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1 bg-zinc-700 hover:bg-rose-500/20 hover:text-rose-500 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-700 flex items-center justify-center">
                  {selectedFile.previewUrl ? (
                    <img src={selectedFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <File className="text-zinc-600" size={32} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="text-white font-bold truncate pr-6 text-sm sm:text-base">{selectedFile.name}</h5>
                  <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-mono">
                    {selectedFile.type || 'Unknown Type'} • {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-zinc-400 text-[10px] font-bold">READY TO CRYSTALLIZE</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {isGenerating && (
              <div className="flex items-center gap-2 px-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">AI is analyzing content...</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 overflow-x-hidden">
      {/* Background animated elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg">
            {/* Fixed invalid prop sm:size on Lucide component */}
            <QrCode className="text-white" size={24} />
          </div>
          <h1 className="text-lg sm:text-2xl font-black font-orbitron tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 uppercase">
            QR UDAY <span className="text-blue-500">3D</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <button className="text-zinc-400 hover:text-white transition-colors p-2"><History size={20} /></button>
          <button className="hidden sm:flex text-zinc-400 hover:text-white transition-colors items-center gap-2"><Settings size={18} /> Settings</button>
          <button className="bg-zinc-800 hover:bg-zinc-700 p-2 sm:px-4 sm:py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all border border-zinc-700/50">
            <Zap className="text-yellow-400 fill-yellow-400" size={14} /> 
            <span className="hidden sm:inline">Pro</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Left Control Panel */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 order-2 lg:order-1">
          <section className="bg-zinc-900/40 border border-zinc-800 p-1 rounded-2xl flex gap-1 shadow-2xl backdrop-blur-md overflow-x-auto no-scrollbar">
            {[
              { id: QRType.URL, icon: LinkIcon, label: 'URL' },
              { id: QRType.TEXT, icon: Type, label: 'Text' },
              { id: QRType.WIFI, icon: Wifi, label: 'Wi-Fi' },
              { id: QRType.VCARD, icon: User, label: 'Contact' },
              { id: QRType.FILE, icon: FileText, label: 'File' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== QRType.FILE) clearFile();
                }}
                className={`flex-1 min-w-[60px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-zinc-800 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-zinc-700/50' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-bold text-[10px] sm:text-xs">{tab.label}</span>
              </button>
            ))}
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 p-5 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderInputArea()}
            </motion.div>

            <div className="mt-6 sm:mt-8">
              <Button3D onClick={generateQR} disabled={!inputValue || isGenerating} className="w-full py-4 text-lg">
                {isGenerating ? 'Processing...' : 'Generate Crystal QR'}
              </Button3D>
            </div>
          </section>

          {/* History / Recents Section - Hidden on very small screens or made more compact */}
          <section className="space-y-4">
            <h4 className="font-orbitron text-xs font-bold text-zinc-500 flex items-center gap-2">
              <History size={16} /> RECENT HISTORY
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <AnimatePresence>
                {history.length > 0 ? history.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-zinc-900/30 border border-zinc-800/50 p-3 sm:p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-800/60 transition-all cursor-pointer hover:border-zinc-700"
                    onClick={() => {
                      setInputValue(item.value);
                      setActiveTab(item.type);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 bg-zinc-800 rounded-xl text-blue-400">
                        {item.type === QRType.URL && <LinkIcon size={14} />}
                        {item.type === QRType.TEXT && <Type size={14} />}
                        {item.type === QRType.FILE && <FileText size={14} />}
                        {item.type === QRType.WIFI && <Wifi size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-zinc-200 truncate">{item.label}</p>
                        <p className="text-zinc-600 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-zinc-600 text-sm italic py-4 text-center">No history yet.</div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Preview Panel */}
        <div id="result-panel" className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 order-1 lg:order-2">
          <QRCodePanel config={config} label={label} isGenerating={isGenerating} />
          
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 sm:p-6 rounded-3xl space-y-6 backdrop-blur-md">
            <h4 className="font-orbitron text-[10px] font-bold text-zinc-500 flex items-center gap-2">
              <Settings size={14} /> CUSTOMIZATION
            </h4>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Main Color</span>
                <input 
                  type="color" 
                  value={config.fgColor}
                  onChange={(e) => setConfig({...config, fgColor: e.target.value})}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Background</span>
                <input 
                  type="color" 
                  value={config.bgColor}
                  onChange={(e) => setConfig({...config, bgColor: e.target.value})}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Error Correction</span>
                <select 
                  value={config.level}
                  onChange={(e) => setConfig({...config, level: e.target.value as any})}
                  className="bg-zinc-800 text-sm px-3 py-2 rounded-lg outline-none border border-zinc-700 text-zinc-200"
                >
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High (Best)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
               <div className="flex items-start gap-3 text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest font-bold">
                 <Info size={12} className="mt-0.5 text-blue-500 flex-shrink-0" />
                 <p>AI automatically analyzes content for crystal labels.</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-8 px-6 text-center text-zinc-600 text-[10px] sm:text-xs">
        <p className="mb-2">© 2024 QR UDAY 3D. All rights reserved.</p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Support</a>
        </div>
      </footer>

      {/* Floating 3D Decoration - Hidden on mobile to keep it clean */}
      <div className="fixed bottom-10 right-10 float-animation pointer-events-none opacity-5 hidden lg:block">
        <QrCode size={180} className="text-blue-500 rotate-12" />
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
