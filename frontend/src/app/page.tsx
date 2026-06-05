'use client';

import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Endpoint Backend di Hugging Face Spaces
      const res = await fetch('https://revan-fatkhurezi-smart-pok-backend.hf.space/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal menghubungi server Backend');

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-[#00529C]">Smart-POK AI</h1>
          <p className="text-slate-500 text-lg">Internal Credit Administration System - KCP Sukanagara</p>
        </div>

        {/* --- UPLOAD AREA (Drag & Drop) --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-[#00529C] mb-4">📂 Unggah Bundle Berkas Nasabah (.pdf)</h2>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors"
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-slate-600 mb-4 font-medium">Tarik dan lepaskan berkas PDF di sini, atau klik tombol di bawah</p>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="block w-full max-w-xs text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-5
                file:rounded-full file:border-0
                file:text-sm file:font-bold
                file:bg-[#00529C] file:text-white
                hover:file:bg-[#003D75] cursor-pointer transition-colors"
            />
            {file && <p className="mt-4 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">Berkas terpilih: {file.name}</p>}
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="mt-6 w-full py-3.5 px-4 bg-[#00529C] hover:bg-[#003D75] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Mulai Periksa Bundle Berkas
          </button>
        </div>

        {/* --- PROGRESS BAR ANIMASI --- */}
        {isProcessing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
            <p className="text-lg font-bold text-[#00529C] animate-pulse">Memproses Bundle Berkas...</p>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-[#00529C] h-3 rounded-full animate-[progress_3s_ease-in-out_infinite]" style={{width: '70%'}}></div>
            </div>
            <p className="text-sm text-slate-500">Sedang memecah, memilah, dan mengekstrak dokumen...</p>
          </div>
        )}

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* --- HASIL (RESULTS) --- */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Card Ceklis Kelengkapan Dokumen */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-[#00529C]">
              <h3 className="text-lg font-bold text-[#00529C] mb-4">📑 Ceklis Kelengkapan Dokumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${result.kelengkapan.KTP ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <span className="text-2xl">{result.kelengkapan.KTP ? '✅' : '❌'}</span>
                  <p className="font-bold">KTP Terdeteksi</p>
                </div>
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${result.kelengkapan.Slip_Gaji ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <span className="text-2xl">{result.kelengkapan.Slip_Gaji ? '✅' : '❌'}</span>
                  <p className="font-bold">Slip Gaji Terdeteksi</p>
                </div>
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${result.kelengkapan.Surat_Perjanjian ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <span className="text-2xl">{result.kelengkapan.Surat_Perjanjian ? '✅' : '❌'}</span>
                  <p className="font-bold">Surat Perjanjian</p>
                </div>
              </div>
            </div>

            {/* 2. Card Kesesuaian Data */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-[#00529C]">
              <h3 className="text-lg font-bold text-[#00529C] mb-4">📊 Kesesuaian Data (Ekstraksi)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">NIK</p>
                  <p className="text-2xl font-extrabold text-[#00529C]">{result.data.NIK}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="text-2xl font-extrabold text-[#00529C]">{result.data.Nama}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendapatan / Gaji</p>
                  <p className="text-2xl font-extrabold text-[#00529C]">{result.data.Gaji}</p>
                </div>
              </div>
            </div>

            {/* 3. Final Status Box */}
            <div className={`p-6 rounded-2xl text-center shadow-md transition-all ${result.status === 'READY TO DROP' ? 'bg-emerald-500 text-white border-2 border-emerald-600' : 'bg-red-500 text-white border-2 border-red-600'}`}>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">{result.status === 'READY TO DROP' ? '🎉' : '⚠️'}</span>
                <p className="font-black text-2xl tracking-wide">STATUS: {result.status}</p>
              </div>
            </div>
            
          </div>
        )}
        
      </div>
      
      {/* CSS Khusus untuk animasi loading */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
