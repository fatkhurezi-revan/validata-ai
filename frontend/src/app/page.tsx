'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, FileUp, BadgeCheck, ShieldCheck, ShieldAlert, FileText, Loader2, XCircle } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulasi Progress Text yang realistis
  useEffect(() => {
    if (isProcessing) {
      setProgress(10);
      setProgressText('Mengamankan jalur unggahan dokumen...');
      
      const timer1 = setTimeout(() => { setProgress(35); setProgressText('Memindai dan merender halaman PDF...'); }, 1500);
      const timer2 = setTimeout(() => { setProgress(65); setProgressText('Menjalankan OCR Engine pada berkas...'); }, 4000);
      const timer3 = setTimeout(() => { setProgress(85); setProgressText('Memvalidasi dan merekonsiliasi data via AI...'); }, 7500);
      
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    } else {
      setProgress(0);
      setProgressText('');
    }
  }, [isProcessing]);

  // Drag and Drop Handlers
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
      } else {
        setError("Format file tidak didukung. Harap unggah bundle dokumen PDF.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload Handler ke Hugging Face Backend
  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Pastikan URL ini adalah URL Hugging Face Anda
      const res = await fetch('https://revan-fatkhurezi-smart-pok-backend.hf.space/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal menghubungi server AI Pusat');

      const data = await res.json();
      
      // Delay sedikit agar animasi 100% tuntas
      setProgress(100);
      setProgressText('Validasi Selesai!');
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
      }, 800);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      setIsProcessing(false);
    }
  };

  // Variasi Animasi Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-200">
      
      {/* --- NAVBAR MINIMALIS --- */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-slate-900 w-7 h-7" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Smart-POK<span className="text-emerald-600">AI</span></span>
          </div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">KCP Sukanagara</div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        
        {/* --- HEADER --- */}
        <motion.div 
          className="text-center space-y-3"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Validasi Kredit <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Otomatis</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Sistem asisten administrasi cerdas berbasis AI untuk memilah, mengekstrak, dan memvalidasi bundle berkas nasabah dengan tingkat akurasi tinggi.
          </p>
        </motion.div>

        {/* --- UPLOAD SECTION --- */}
        <motion.div 
          className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          {/* Drag & Drop Area */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center overflow-hidden ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50/50' 
                : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
              <CloudUpload className="w-10 h-10" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tarik & Lepaskan Dokumen</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Unggah bundle berkas nasabah (.pdf) yang berisi KTP, Slip Gaji, dan Surat Perjanjian Kredit.
            </p>
            
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="hidden"
            />
            
            <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm transition-transform hover:scale-105 shadow-md">
              <FileUp className="w-4 h-4" />
              Pilih Berkas
            </div>
          </div>

          {/* Selected File Card */}
          {file && !isProcessing && !result && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-emerald-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-800 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-emerald-200 transition-colors shrink-0"
              >
                Mulai Analisis AI
              </button>
            </motion.div>
          )}

          {/* Progress Bar Animation */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 space-y-4"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    {progressText}
                  </span>
                  <span className="text-emerald-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative border border-slate-200">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-800 text-sm">Validasi Gagal</h4>
                  <p className="text-sm text-rose-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* --- RESULTS SECTION --- */}
        {result && (
          <motion.div 
            className="space-y-6"
            initial="hidden" animate="visible" variants={cardVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Checklist Kelengkapan */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  Kelengkapan Dokumen
                </h3>
                <div className="space-y-4">
                  <ChecklistItem label="Kartu Tanda Penduduk (KTP)" isTrue={result.kelengkapan.KTP} />
                  <ChecklistItem label="Slip Gaji Nasabah" isTrue={result.kelengkapan.Slip_Gaji} />
                  <ChecklistItem label="Surat Perjanjian Kredit" isTrue={result.kelengkapan.Surat_Perjanjian} />
                </div>
              </div>

              {/* Card 2: Hasil Ekstraksi Data */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Kesesuaian Data
                </h3>
                <div className="space-y-6">
                  <DataRow label="Nomor Induk Kependudukan" value={result.data.NIK} />
                  <DataRow label="Nama Lengkap Nasabah" value={result.data.Nama} />
                  <DataRow label="Pendapatan / Gaji" value={result.data.Gaji} highlight />
                </div>
              </div>

            </div>

            {/* Final Status Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
              className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center text-center space-y-3 ${
                result.status.includes('READY TO DROP') 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              {result.status.includes('READY TO DROP') ? (
                <>
                  <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-emerald-800 tracking-tight">READY TO DROP</h2>
                  <p className="text-emerald-700 font-medium">Bundle berkas telah tervalidasi dengan lengkap dan data sesuai standar kepatuhan.</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-rose-100 rounded-full text-rose-600 mb-2">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-rose-800 tracking-tight">REJECTED</h2>
                  <p className="text-rose-700 font-medium">Terdapat dokumen yang tidak lengkap atau ketidaksesuaian data pada bundle.</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ChecklistItem({ label, isTrue }: { label: string, isTrue: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
      isTrue ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-500'
    }`}>
      {isTrue ? <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-slate-300 shrink-0" />}
      <span className={`text-sm font-bold tracking-wide ${isTrue ? '' : 'line-through opacity-70'}`}>{label}</span>
    </div>
  );
}

function DataRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  const isDash = value === '-' || !value;
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className={`font-extrabold tracking-tight ${isDash ? 'text-slate-400 italic font-medium' : highlight ? 'text-3xl text-emerald-600' : 'text-xl text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}
