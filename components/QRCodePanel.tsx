
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Sparkles } from 'lucide-react';
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
      canvas.width = config.size;
      canvas.height = config.size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(config.value);
      alert("QR content copied!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: label,
          text: `Check out this QR code: ${config.value}`,
          url: config.value,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="relative group perspective-1000 w-full max-w-md mx-auto">
      <motion.div
        initial={{ rotateY: 0 }}
        whileHover={{ rotateY: 5, rotateX: -5 }}
        className="relative z-10 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-30">
          <Sparkles className="text-blue-500 animate-pulse" size={20} />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-inner mb-4 sm:mb-6 relative overflow-hidden">
            {isGenerating && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            )}
            <QRCodeSVG
              id="qr-code-svg"
              value={config.value}
              size={config.size > 200 ? (window.innerWidth < 400 ? 180 : 220) : config.size}
              fgColor={config.fgColor}
              bgColor={config.bgColor}
              level={config.level}
              includeMargin={config.includeMargin}
              imageSettings={config.imageSettings}
              className="rounded-lg max-w-full h-auto"
            />
          </div>

          <h3 className="text-lg sm:text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1 sm:mb-2 text-center">
            {label}
          </h3>
          <p className="text-zinc-500 text-[10px] sm:text-xs mb-6 sm:mb-8 truncate w-full text-center px-4">
            {config.value}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <Button3D onClick={downloadQR} className="flex items-center justify-center gap-2 text-xs sm:text-sm px-4">
              <Download size={16} /> Save
            </Button3D>
            <Button3D variant="ghost" onClick={copyToClipboard} className="flex items-center justify-center gap-2 text-xs sm:text-sm px-4">
              <Copy size={16} /> Copy
            </Button3D>
          </div>
          
          <div className="mt-3 sm:mt-4 w-full">
            <Button3D variant="secondary" onClick={shareQR} className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-3 sm:py-4">
              <Share2 size={16} /> {navigator.share ? 'Share QR' : 'Copy Link'}
            </Button3D>
          </div>
        </div>
      </motion.div>

      {/* Decorative background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl opacity-50 -z-10 rounded-full"></div>
    </div>
  );
};

export default QRCodePanel;
