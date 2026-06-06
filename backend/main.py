import os
import json
import re
import fitz  # PyMuPDF
import easyocr
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="ValidataAI Backend - Real AI Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reader = None

def get_easyocr_reader():
    global reader
    if reader is None:
        print("Loading EasyOCR models...")
        reader = easyocr.Reader(['id', 'en'], gpu=False, model_storage_directory='/tmp/easyocr')
        print("EasyOCR models loaded.")
    return reader

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY belum dipasang di pengaturan rahasia (Secrets) Hugging Face.")
    return Groq(api_key=api_key)

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file berekstensi .pdf yang diperbolehkan.")
    
    try:
        pdf_bytes = await file.read()
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        num_pages = min(5, len(pdf_document))
        all_text_extracted = []
        
        ocr_reader = get_easyocr_reader()
        
        for page_num in range(num_pages):
            page = pdf_document.load_page(page_num)
            # OPTIMASI 1: Menurunkan resolusi render DPI menjadi 150 (sebelumnya 300).
            # Ini mempercepat OCR hingga 4x lipat karena luas gambar dipangkas, tapi teks tetap sangat terbaca.
            pix = page.get_pixmap(dpi=150) 
            img_bytes = pix.tobytes("png")
            
            # OPTIMASI 2: Mematikan analisis paragraf (paragraph=False).
            # Menginstruksikan EasyOCR untuk langsung menyapu teks tanpa perlu menyusun struktur paragraf yang berat.
            ocr_results = ocr_reader.readtext(img_bytes, detail=0, paragraph=False)
            all_text_extracted.append(" ".join(ocr_results))
            
        pdf_document.close()
        
        raw_text = "\n".join(all_text_extracted)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Dokumen kosong atau teks tidak dapat terbaca oleh OCR.")

        # OPTIMASI 3: Prompt AI dibuat sangat pendek, padat, dan langsung menembak ke format JSON.
        # Ini menghemat token input dan memangkas waktu "berpikir" AI secara signifikan.
        system_prompt = """Ekstrak data dari raw teks OCR dokumen bank berikut HANYA ke dalam format JSON MURNI tanpa kalimat pengantar atau penutup apapun.
Format JSON wajib:
{"kelengkapan":{"KTP":true,"KK":false,"Slip_Gaji":true},"data":{"NIK_KTP":"16 digit","NIK_KK":"16 digit","Nama_KTP":"Nama","Nama_Slip_Gaji":"Nama","Gaji":"Nominal","Status_Kecocokan_Nama":true,"Status_Kecocokan_NIK":true},"status":"READY TO DROP"}

ATURAN:
1. KK true jika ada kata 'KARTU KELUARGA' atau 'NO. KK'.
2. Jika data spesifik tidak ditemukan, isi string "-".
3. Status_Kecocokan true hanya jika sama persis/identik."""

        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": raw_text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0, 
            response_format={"type": "json_object"} # Memaksa Strict JSON
        )
        
        groq_json_str = chat_completion.choices[0].message.content
        result_json = json.loads(groq_json_str)
        
        # --- FAIL-SAFE PYTHON LOGIC ---
        text_upper = raw_text.upper()
        text_clean = text_upper.replace(" ", "")
        
        if not result_json.get("kelengkapan", {}).get("KK"):
            if "KARTUKELUARGA" in text_clean:
                result_json["kelengkapan"]["KK"] = True
                
        if result_json.get("kelengkapan", {}).get("KK") and result_json.get("data", {}).get("NIK_KK", "-") == "-":
            niks_found = re.findall(r'\b\d{16}\b', raw_text)
            if niks_found:
                nik_ktp = result_json.get("data", {}).get("NIK_KTP", "-")
                if nik_ktp in niks_found:
                    result_json["data"]["NIK_KK"] = nik_ktp
                else:
                    result_json["data"]["NIK_KK"] = niks_found[-1]

        if result_json.get("data", {}).get("NIK_KTP", "A") == result_json.get("data", {}).get("NIK_KK", "B") and result_json.get("data", {}).get("NIK_KTP", "A") != "-":
            result_json["data"]["Status_Kecocokan_NIK"] = True

        if not result_json.get("kelengkapan", {}).get("KTP"):
            if "PROVINSI" in text_upper and "KABUPATEN" in text_upper and "NIK" in text_upper:
                result_json["kelengkapan"]["KTP"] = True

        if not result_json.get("kelengkapan", {}).get("Slip_Gaji"):
            if "SLIP" in text_upper or "GAJI" in text_upper or "PENDAPATAN" in text_upper or "TAKE HOME PAY" in text_upper:
                result_json["kelengkapan"]["Slip_Gaji"] = True
        
        # Penentuan status deterministik
        kelengkapan = result_json.get("kelengkapan", {})
        data_ekstraksi = result_json.get("data", {})
        
        is_ktp_ok = kelengkapan.get("KTP") is True
        is_kk_ok = kelengkapan.get("KK") is True
        is_slip_ok = kelengkapan.get("Slip_Gaji") is True
        
        is_nik_ktp_ada = data_ekstraksi.get("NIK_KTP") != "-"
        is_nik_kk_ada = data_ekstraksi.get("NIK_KK") != "-"
        is_gaji_ada = data_ekstraksi.get("Gaji") != "-"
        is_nama_cocok = data_ekstraksi.get("Status_Kecocokan_Nama") is True
        is_nik_cocok = data_ekstraksi.get("Status_Kecocokan_NIK") is True
        
        if is_ktp_ok and is_kk_ok and is_slip_ok and is_nik_ktp_ada and is_nik_kk_ada and is_gaji_ada and is_nama_cocok and is_nik_cocok:
            result_json["status"] = "READY TO DROP"
        else:
            result_json["status"] = "REJECTED"
        
        return result_json

    except json.JSONDecodeError:
        print("Error: Groq API mengembalikan format JSON yang rusak.")
        raise HTTPException(status_code=500, detail="Gagal membaca format JSON dari AI Backend.")
        
    except Exception as e:
        print(f"Server Error Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada server saat memproses: {str(e)}")

@app.get("/")
def root():
    return {"message": "ValidataAI Backend is online and running optimized Real AI models."}
