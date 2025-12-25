
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, AlertCircle, Zap, Activity, RefreshCw, ShieldAlert, Target, Crosshair } from 'lucide-react';
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
  const [isDetected, setIsDetected] = useState(false);
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
        setIsDetected(true);
        setTimeout(() => onScan(code.data), 600);
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
    setIsDetected(false);
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
    if (isDetected) return;

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
          setIsDetected(true);
          // Visual confirmation before proceeding
          setTimeout(() => onScan(code.data), 800);
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
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl"
    >
      <div className="relative w-full max-w-[380px] aspect-square bg-zinc-950 rounded-[3rem] overflow-hidden border-2 border-zinc-800 shadow-[0_0_80px_rgba(59,130,246,0.15)] group">
        <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-700 ${cameraActive ? 'opacity-70' : 'opacity-0'}`} />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-[45px] border-black/60 backdrop-brightness-50"></div>
          
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64"
            animate={isDetected ? { scale: 1.1, opacity: 0.5 } : { scale: 1, opacity: 1 }}
          >
            {/* Animated Scanner Line */}
            <motion.div 
              className="scanner-line !bg-blue-400 !shadow-[0_0_25px_rgba(96,165,250,0.8)]"
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                scaleX: [0.95, 1.05, 0.95]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Corner Markers with subtle animations */}
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"
            ].map((style, i) => (
              <motion.div 
                key={i}
                className={`absolute w-10 h-10 border-blue-500/90 shadow-[0_0_15px_rgba(59,130,246,0.4)] ${style}`}
                animate={{ 
                  scale: [1, 1.05, 1],
                  borderColor: ["rgba(59, 130, 246, 0.9)", "rgba(147, 51, 234, 0.9)", "rgba(59, 130, 246, 0.9)"]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}

            {/* Detection Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
               <Crosshair size={40} className="text-white animate-[spin_10s_linear_infinite]" />
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-10 flex items-center gap-2.5">
             <motion.div 
               animate={{ opacity: [0.4, 1, 0.4] }} 
               transition={{ duration: 1.5, repeat: Infinity }}
             >
               <Activity size={16} className="text-blue-500" />
             </motion.div>
             <span className="text-[10px] font-black font-orbitron text-zinc-400 tracking-[0.3em] uppercase italic">
               Neural Search active
             </span>
          </div>
        </div>

        {/* Lock State Visual Cue */}
        <AnimatePresence>
          {isDetected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex flex-col items-center justify-center z-40"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                className="relative"
              >
                <Target size={80} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              </motion.div>
              <motion.h4 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-6 text-xl font-orbitron font-black text-white uppercase tracking-[0.4em] text-glow"
              >
                Target Locked
              </motion.h4>
              <div className="mt-2 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing State */}
        <AnimatePresence>
          {isProcessing && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-md"
             >
                <RefreshCw size={56} className="text-blue-500 animate-spin" />
                <p className="mt-8 text-sm font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">Analyzing Pattern...</p>
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
              <div className="bg-rose-500/10 p-6 rounded-full mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <ShieldAlert size={48} className="text-rose-500" />
              </div>
              <h4 className="text-xl font-orbitron font-black text-white uppercase tracking-wider mb-3">{error.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-10 px-6">{error.msg}</p>
              <Button3D variant="ghost" onClick={startCamera} className="py-4 px-12 text-xs rounded-2xl tracking-[0.3em] uppercase italic">
                Reset Node
              </Button3D>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 w-full max-w-[380px] flex flex-col gap-8">
        <div className="text-center space-y-3">
          <h3 className="font-orbitron text-sm sm:text-base font-black text-white tracking-[0.4em] uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Scanner Interface
          </h3>
          <p className="text-zinc-500 text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] px-8 leading-relaxed">
            Align the optic sensor with the target pattern for immediate decryption
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Button3D 
            variant="primary" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 py-4 text-xs rounded-2xl tracking-widest uppercase font-orbitron italic"
          >
            <Upload size={18} /> Import
          </Button3D>
          <Button3D 
            variant="ghost" 
            onClick={onClose} 
            className="flex items-center justify-center gap-3 py-4 text-xs rounded-2xl tracking-widest uppercase font-orbitron italic"
          >
            <X size={18} /> Close
          </Button3D>
        </div>
        
        <input type="file" id="scanner-file-input" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>
    </motion.div>
  );
};

export default QRScanner;
