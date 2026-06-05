from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI(title="Smart-POK AI Backend")

# Mengizinkan Frontend (localhost:3000 atau domain Vercel) untuk memanggil API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # PERHATIAN: Di tahap produksi, ganti "*" dengan URL Vercel Anda
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """
    Endpoint untuk menerima unggahan PDF dan melakukan proses analisis.
    Fase 1: Murni simulasi logika (Mock-up)
    """
    # 1. Simulasi delay proses memecah PDF, OCR, dan Klasifikasi AI
    await asyncio.sleep(3)
    
    # 2. Mengembalikan response statis sesuai kerangka arsitektur MVP
    return {
        "kelengkapan": {
            "KTP": True, 
            "Slip_Gaji": True, 
            "Surat_Perjanjian": True
        },
        "data": {
            "NIK": "3202112233445566", 
            "Nama": "Budi Setiawan", 
            "Gaji": "Rp 10.000.000"
        },
        "status": "READY TO DROP"
    }

@app.get("/")
def root():
    return {"message": "Smart-POK AI Backend is running"}
