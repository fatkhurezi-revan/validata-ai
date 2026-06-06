# ValidataAI - Sistem Validasi Kredit Cerdas 🚀

ValidataAI adalah prototipe (Proof of Concept) aplikasi *Optical Character Recognition* (OCR) dan Kecerdasan Buatan (AI) yang dikembangkan khusus untuk memangkas waktu verifikasi dokumen kredit secara manual di dunia perbankan.

Dibuat sebagai bagian dari Laporan Magang di **PT Bank Rakyat Indonesia (Persero) Tbk, KCP Sukanagara**.

## 🌟 Fitur Utama
- **Ekstraksi Data Otomatis**: Membaca teks dari gambar/PDF dokumen KTP, Kartu Keluarga, dan Slip Gaji secara otomatis tanpa input manual.
- **Validasi Silang Cerdas (Cross-Validation)**:
  - Mencocokkan NIK di KTP dengan NIK yang terdapat di Kartu Keluarga.
  - Mencocokkan Kesamaan Nama di KTP dengan Nama di Slip Gaji nasabah.
- **Anti-Fraud (Pendeteksi Kelengkapan)**: Memastikan ketiga dokumen (KTP, KK, Slip Gaji) benar-benar ada di dalam berkas PDF.
- **Sistem Keputusan Otomatis**:
  - `READY TO DROP`: Dokumen lengkap, NIK cocok, dan Nama sesuai.
  - `REJECTED`: Dokumen tidak lengkap, gambar buram, atau terdapat ketidakcocokan data.
- **Desain UI/UX Premium**: Antarmuka berbasis web modern yang mulus (smooth) dengan efek animasi berkelas standar *Enterprise*.

## 🛠️ Arsitektur Teknologi
Sistem ini memisahkan antara *Frontend* dan *Backend* agar dapat beroperasi pada skala perusahaan besar.

### 1. Frontend (Antarmuka Pengguna)
- **Framework**: Next.js 14 (App Router) dengan React
- **Styling**: Tailwind CSS & Framer Motion (untuk animasi transisi cerdas)
- **Deployment**: Vercel
- **Tipografi**: Plus Jakarta Sans

### 2. Backend (Mesin AI & OCR)
- **Framework**: FastAPI (Python)
- **OCR Engine**: EasyOCR & PyMuPDF (Mengekstrak teks mentah dari gambar beresolusi tinggi)
- **AI Processing**: Groq API dengan Llama-3.3 (Menelaah, menstrukturisasi JSON, dan memvalidasi NIK/Nama dengan tingkat pemahaman bahasa natural).
- **Deployment**: Hugging Face Spaces (Docker Container)

## 💡 Latar Belakang Proyek
ValidataAI bermula dari pengamatan langsung saat magang di Bank BRI KCP Sukanagara. Proses pengecekan kelengkapan berkas fisik, mulai dari membolak-balik KTP, mengecek NIK di Kartu Keluarga baris demi baris, hingga mencocokkan nama di Slip Gaji memakan waktu administratif yang cukup lama.

ValidataAI membuktikan bahwa dengan menerapkan teknologi *Large Language Model* (LLM) dipadukan dengan OCR, tugas administratif perbankan ini bisa **diotomatisasi dalam hitungan detik**.

## 🚀 Cara Menjalankan Secara Lokal (Local Development)

### 1. Jalankan Backend (AI)
```bash
cd backend
pip install -r requirements.txt
# Pastikan Anda memiliki variabel GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. Jalankan Frontend (UI)
```bash
cd frontend
npm install
# Buka file src/app/page.tsx dan ganti URL_BACKEND ke http://localhost:8000/analyze jika perlu
npm run dev
```

---
**Diciptakan oleh:** Revan Fatkhurezi  
*Untuk Laporan Magang Praktik Kerja Lapangan 2026*
