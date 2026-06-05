'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CloudUpload, FileUp, BadgeCheck, ShieldCheck, ShieldAlert, FileText, Loader2, XCircle, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Mengamankan koneksi & enkripsi...",
    "Merender halaman PDF...",
    "Mengekstrak teks via OCR...",
    "Validasi data dengan AI..."
  ];

  // Simulasi Progress Text yang sangat mulus
  useEffect(() => {
    if (isProcessing) {
      setProgress(10);
      setActiveStep(0);
      
      const timer1 = setTimeout(() => { setProgress(35); setActiveStep(1); }, 1500);
      const timer2 = setTimeout(() => { setProgress(65); setActiveStep(2); }, 3500);
      const timer3 = setTimeout(() => { setProgress(85); setActiveStep(3); }, 6500);
      
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    } else {
      setProgress(0);
    }
  }, [isProcessing]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError("Format tidak didukung. Harap unggah dokumen PDF.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://revan-fatkhurezi-smart-pok-backend.hf.space/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal menghubungi server AI Pusat');

      const data = await res.json();
      
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
        if(data.status.includes('READY TO DROP')) {
           triggerConfetti();
        }
      }, 800);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      setIsProcessing(false);
    }
  };

  // Variasi Animasi
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans selection:bg-[#00529C]/20 relative overflow-hidden flex flex-col">
      
      {/* MESH GRADIENT BACKGROUND LUXURY */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#00529C]/10 to-transparent blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-[#F37021]/10 to-transparent blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-tr from-[#00529C]/10 to-transparent blur-[120px]" 
        />
      </div>
      
      {/* NAVBAR GLASSMORPHISM */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[#00529C] to-[#003D75] rounded-xl shadow-lg shadow-[#00529C]/30">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#00529C]">Smart-POK <span className="text-[#F37021]">AI</span></span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase bg-white/80 px-3 py-1.5 rounded-full shadow-sm border border-slate-100">KCP Sukanagara</div>
          </motion.div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full z-10 relative space-y-12">
        
        {/* HEADER TEXT */}
        <motion.div 
          className="text-center space-y-5"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm text-sm font-semibold text-[#00529C] mb-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#F37021]" />
            Validasi Dokumen Enterprise
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black text-[#00529C] tracking-tight leading-tight drop-shadow-sm">
            Validasi Kredit <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-[#FF8C42]">Super Cerdas</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Asisten administrasi berbasis AI Generatif. Ekstraksi dan validasi bundle berkas nasabah dalam hitungan detik.
          </motion.p>
        </motion.div>

        {/* UPLOAD SECTION (ULTRA PREMIUM) */}
        <motion.div 
          className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,82,156,0.1)] border border-white/60 relative overflow-hidden group"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          {/* Efek kilap pada card saat hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full ease-in-out pointer-events-none" />

          {/* Drag & Drop Area */}
          <motion.div 
            variants={itemVariants}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`relative cursor-pointer rounded-3xl p-8 md:p-14 transition-all duration-500 ease-out flex flex-col items-center justify-center text-center overflow-hidden border-2 ${
              isDragging 
                ? 'border-[#F37021] bg-[#F37021]/5 scale-[0.98]' 
                : 'border-slate-200 border-dashed hover:border-[#00529C]/40 hover:bg-[#00529C]/[0.02] hover:shadow-inner'
            }`}
          >
            {isDragging && (
              <motion.div 
                layoutId="drag-ring"
                className="absolute inset-0 border-4 border-[#F37021]/20 rounded-3xl"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              />
            )}
            
            <motion.div 
              animate={isDragging ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
              className={`p-5 rounded-2xl mb-6 transition-all duration-500 shadow-xl ${isDragging ? 'bg-gradient-to-br from-[#F37021] to-[#FF8C42] text-white shadow-[#F37021]/30' : 'bg-white text-[#00529C] shadow-[#00529C]/10 group-hover:-translate-y-2 group-hover:shadow-2xl'}`}
            >
              <CloudUpload className="w-12 h-12" strokeWidth={1.5} />
            </motion.div>
            
            <h3 className="text-2xl font-extrabold text-[#00529C] mb-3">
              {isDragging ? 'Lepaskan Berkas di Sini!' : 'Tarik & Lepaskan Berkas'}
            </h3>
            <p className="text-slate-500 text-base mb-8 max-w-md font-medium leading-relaxed">
              Unggah format <span className="font-bold text-slate-700">.PDF</span> yang memuat KTP, Slip Gaji, dan Surat Perjanjian Kredit.
            </p>
            
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="hidden"
            />
            
            <motion.div 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#00529C] text-white rounded-xl font-bold text-sm shadow-xl shadow-[#00529C]/20 hover:shadow-[#00529C]/40 hover:bg-[#003D75] transition-all"
            >
              <FileUp className="w-5 h-5" />
              Telusuri Komputer
            </motion.div>
          </motion.div>

          {/* Selected File Card */}
          <AnimatePresence>
            {file && !isProcessing && !result && (
              <motion.div 
                initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.95}} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mt-8 p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F37021]" />
                <div className="flex items-center gap-4 w-full pl-2">
                  <div className="p-3 bg-slate-50 rounded-xl text-[#00529C]">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-[#00529C] text-base truncate">{file.name}</p>
                    <p className="text-sm font-semibold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Berkas Siap</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F37021] to-[#FF8C42] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#F37021]/30 hover:shadow-[#F37021]/50 shrink-0 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Mulai Analisis
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar Animation (STEPPER APPLE-STYLE) */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 20 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0 }}
                className="mt-10 p-8 bg-white rounded-2xl border border-slate-100 shadow-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold text-[#00529C] text-lg flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F37021]" />
                    AI sedang bekerja...
                  </h4>
                  <span className="text-3xl font-black text-slate-200">{progress}%</span>
                </div>

                <div className="space-y-5">
                  {steps.map((step, idx) => (
                    <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${idx === activeStep ? 'opacity-100 scale-100' : idx < activeStep ? 'opacity-40' : 'opacity-20'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${idx < activeStep ? 'bg-emerald-500 text-white' : idx === activeStep ? 'bg-[#F37021] text-white shadow-lg shadow-[#F37021]/40' : 'bg-slate-100 text-slate-400'}`}>
                        {idx < activeStep ? '✓' : idx + 1}
                      </div>
                      <span className={`font-semibold text-base ${idx === activeStep ? 'text-[#00529C]' : 'text-slate-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden relative mt-8">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00529C] to-[#F37021] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 p-6 bg-gradient-to-r from-rose-50 to-white border-l-4 border-rose-500 rounded-2xl shadow-lg flex items-start gap-4"
              >
                <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-base mb-1">Terjadi Kesalahan</h4>
                  <p className="text-sm font-medium text-rose-600/80 leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* --- RESULTS SECTION (ULTRA PREMIUM CARD) --- */}
        {result && (
          <motion.div 
            className="space-y-8"
            initial="hidden" animate="visible" variants={containerVariants}
          >
            {/* Final Status Box */}
            <motion.div 
              variants={itemVariants}
              className={`relative overflow-hidden p-10 md:p-12 rounded-[2rem] border flex flex-col items-center justify-center text-center space-y-4 shadow-2xl ${
                result.status.includes('READY TO DROP') 
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-100 shadow-emerald-900/5' 
                  : 'bg-gradient-to-b from-rose-50 to-white border-rose-100 shadow-rose-900/5'
              }`}
            >
              {result.status.includes('READY TO DROP') && (
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              )}
              {result.status.includes('READY TO DROP') ? (
                <>
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15, delay: 0.2 }} className="p-5 bg-emerald-100/80 rounded-2xl text-emerald-600 mb-2 shadow-inner">
                    <ShieldCheck className="w-12 h-12" />
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-emerald-800 tracking-tight">READY TO DROP</h2>
                  <p className="text-emerald-700/80 font-bold text-lg max-w-xl">Bundle berkas tervalidasi dengan sempurna. Seluruh parameter telah memenuhi standar kepatuhan operasional.</p>
                </>
              ) : (
                <>
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15, delay: 0.2 }} className="p-5 bg-rose-100/80 rounded-2xl text-rose-600 mb-2 shadow-inner">
                    <XCircle className="w-12 h-12" />
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-rose-800 tracking-tight">REJECTED</h2>
                  <p className="text-rose-700/80 font-bold text-lg max-w-xl">Terdapat dokumen yang kurang lengkap atau data identitas tidak terdeteksi dengan jelas.</p>
                </>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Checklist Kelengkapan */}
              <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-[#00529C]">Kelengkapan</h3>
                  <div className="p-2.5 bg-[#F37021]/10 rounded-xl"><BadgeCheck className="w-6 h-6 text-[#F37021]" /></div>
                </div>
                <div className="space-y-4">
                  <ChecklistItem label="KTP Nasabah" isTrue={result.kelengkapan.KTP} delay={0.1} />
                  <ChecklistItem label="Slip Gaji" isTrue={result.kelengkapan.Slip_Gaji} delay={0.2} />
                  <ChecklistItem label="Surat Perjanjian" isTrue={result.kelengkapan.Surat_Perjanjian} delay={0.3} />
                </div>
              </motion.div>

              {/* Card 2: Hasil Ekstraksi Data */}
              <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-[#00529C]">Ekstraksi Data</h3>
                  <div className="p-2.5 bg-[#00529C]/10 rounded-xl"><FileText className="w-6 h-6 text-[#00529C]" /></div>
                </div>
                <div className="space-y-6">
                  <DataRow label="Nomor Induk Kependudukan (NIK)" value={result.data.NIK} />
                  <DataRow label="Nama Sesuai KTP" value={result.data.Nama} />
                  <DataRow label="Penghasilan / Gaji" value={result.data.Gaji} highlight />
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ChecklistItem({ label, isTrue, delay }: { label: string, isTrue: boolean, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + 0.5 }}
      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${
      isTrue ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'
    }`}>
      <span className={`text-base font-extrabold tracking-wide ${isTrue ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{label}</span>
      {isTrue ? (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
          <BadgeCheck className="w-5 h-5" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
          <XCircle className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}

function DataRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  const isDash = value === '-' || !value;
  return (
    <div className="group relative border-b border-slate-100 pb-5 last:border-0 last:pb-0">
      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        {label}
      </p>
      <p className={`font-black tracking-tight transition-colors ${isDash ? 'text-slate-300 italic font-medium text-lg' : highlight ? 'text-4xl text-[#F37021] drop-shadow-sm' : 'text-2xl text-[#00529C]'}`}>
        {value}
      </p>
    </div>
  );
}
