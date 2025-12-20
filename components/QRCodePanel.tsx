
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy } from 'lucide-react';
import Button3D from './Button3D';
import { QRConfig } from '../types';

interface QRCodePanelProps {
  config: QRConfig;
  label: string;
  isGenerating: boolean;
}

const QRCodePanel: React.FC<QRCodePanelProps> = ({ config, label, isGenerating }) => {
  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx?.drawImage(img, 0, 0, 1024, 1024);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `crystal-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(config.value);
    } catch (err) {}
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: label, text: `Neural Crystal Sync: ${config.value}`, url: config.value });
      } catch (err) {}
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="relative group w-full max-w-[360px] mx-auto">
      <motion.div
        layout
        className="relative z-10 glass-panel p-6 sm:p-8 rounded-[2.5rem] shadow-2xl overflow-hidden text-center border border-white/10 hologram-effect"
      >
        <div className="absolute top-4 left-4 p-1 opacity-20 border-t border-l border-blue-500 w-6 h-6 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 p-1 opacity-20 border-t border-r border-blue-500 w-6 h-6 rounded-tr-lg"></div>
        
        <div className="flex flex-col items-center">
          <motion.div 
            layout
            className="bg-white p-4 rounded-[2rem] shadow-2xl mb-6 relative overflow-hidden active:scale-[1.05] transition-transform"
          >
            {isGenerating && (
               <div className="absolute inset-0 bg-black/70 rounded-[2rem] flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="mt-3 text-xs font-black text-blue-400 uppercase tracking-widest animate-pulse">Syncing...</span>
               </div>
            )}
            <div className="p-1 relative z-10">
              <QRCodeSVG
                id="qr-code-svg"
                value={config.value}
                size={window.innerWidth < 400 ? 180 : 220}
                fgColor={config.fgColor}
                bgColor={config.bgColor}
                level={config.level}
                includeMargin={config.includeMargin}
                className="max-w-full h-auto"
              />
            </div>
          </motion.div>

          <div className="space-y-1.5 mb-6">
            <h3 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-tight text-glow leading-tight">
              {label}
            </h3>
            <p className="text-zinc-400 text-xs font-black font-mono tracking-widest uppercase truncate max-w-[240px] mx-auto bg-black/40 py-1.5 px-4 rounded-full border border-white/5">
              {config.value}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button3D onClick={downloadQR} variant="ghost" className="flex items-center justify-center gap-2 py-3.5 text-xs rounded-xl tracking-widest font-orbitron">
              <Download size={16} /> SAVE
            </Button3D>
            <Button3D variant="ghost" onClick={copyToClipboard} className="flex items-center justify-center gap-2 py-3.5 text-xs rounded-xl tracking-widest font-orbitron">
              <Copy size={16} /> COPY
            </Button3D>
            <Button3D variant="primary" onClick={shareQR} className="col-span-2 flex items-center justify-center gap-3 py-4 text-sm rounded-2xl tracking-[0.2em] font-orbitron uppercase italic">
              <Share2 size={18} /> SHARE NEURAL SYNC
            </Button3D>
          </div>
        </div>
      </motion.div>

      <div className="absolute -inset-8 bg-blue-600/10 blur-[80px] rounded-full -z-10 animate-pulse"></div>
    </div>
  );
};

export default QRCodePanel;
