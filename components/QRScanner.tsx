
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, AlertCircle, Zap, Activity, RefreshCw, ShieldAlert } from 'lucide-react';
import jsQR from 'jsqr';
import Button3D from './Button3D';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const processImage = useCallback((img: HTMLImageElement) => {
    setIsProcessing(true);
    setError(null);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError({ title: "System Error", msg: "Failed to initialize graphics engine." });
      setIsProcessing(false);
      return;
    }

    const maxDim = 1024;
    let width = img.width;
    let height = img.height;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = (height / width) * maxDim;
        width = maxDim;
      } else {
        width = (width / height) * maxDim;
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    setTimeout(() => {
      setIsProcessing(false);
      if (code) {
        onScan(code.data);
      } else {
        setError({ title: "Analysis Failed", msg: "No valid QR pattern found in this image. Try a clearer shot." });
      }
    }, 450);
  }, [onScan]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError({ title: "Invalid Asset", msg: "Please upload an image file (PNG, JPG, etc)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setError({ title: "Read Error", msg: "Failed to read the selected file." });
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setError(null);
    setCameraActive(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn("Camera error:", err);
      if (err.name === 'NotAllowedError') {
        setError({ title: "Access Denied", msg: "Camera permission was refused. Please enable it in your browser settings." });
      } else if (err.name === 'NotFoundError') {
        setError({ title: "No Camera", msg: "No camera hardware detected on this device." });
      } else {
        setError({ title: "Link Failed", msg: "Unable to establish camera connection. Try uploading a file instead." });
      }
    }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          onScan(code.data);
          return;
        }
      }
    }
    if (!error) requestAnimationFrame(tick);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-2xl"
    >
      <div className="relative w-full max-w-[380px] aspect-square bg-zinc-950 rounded-[3rem] overflow-hidden border-2 border-zinc-800 shadow-[0_0_50px_rgba(59,130,246,0.2)] group">
        <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-60' : 'opacity-0'}`} />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-[40px] border-black/50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
            <div className="scanner-line"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500/80 rounded-tl-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500/80 rounded-tr-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500/80 rounded-bl-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500/80 rounded-br-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>
          <div className="absolute bottom-8 left-8 flex items-center gap-2 opacity-80">
             <Activity size={14} className="text-blue-500 animate-pulse" />
             <span className="text-xs font-black font-mono text-zinc-400 tracking-widest uppercase">System Online</span>
          </div>
        </div>

        {/* Processing State */}
        <AnimatePresence>
          {isProcessing && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-md"
             >
                <RefreshCw size={48} className="text-blue-500 animate-spin" />
                <p className="mt-6 text-sm font-black text-blue-400 uppercase tracking-[0.4em]">Decoding Pattern</p>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Error State Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-8 z-[60] text-center"
            >
              <div className="bg-rose-500/10 p-5 rounded-full mb-6 border border-rose-500/20">
                <ShieldAlert size={40} className="text-rose-500" />
              </div>
              <h4 className="text-lg font-orbitron font-black text-white uppercase tracking-wider mb-3">{error.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-8 px-4">{error.msg}</p>
              <Button3D variant="ghost" onClick={startCamera} className="py-3.5 px-10 text-xs rounded-xl tracking-widest uppercase">
                Reset Matrix
              </Button3D>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 w-full max-w-[380px] flex flex-col gap-6">
        <div className="text-center space-y-2">
          <h3 className="font-orbitron text-sm sm:text-base font-black text-white tracking-[0.3em] uppercase italic">
            Neural Scanner Active
          </h3>
          <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest px-4">
            Position pattern in frame or import from archives
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button3D 
            variant="primary" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 py-4 text-xs rounded-2xl tracking-widest uppercase"
          >
            <Upload size={18} /> Import
          </Button3D>
          <Button3D 
            variant="ghost" 
            onClick={onClose} 
            className="flex items-center justify-center gap-3 py-4 text-xs rounded-2xl tracking-widest uppercase"
          >
            <X size={18} /> Close
          </Button3D>
        </div>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>
    </motion.div>
  );
};

export default QRScanner;
