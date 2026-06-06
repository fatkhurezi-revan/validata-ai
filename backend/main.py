import os
import json
import fitz  # PyMuPDF
import easyocr
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

# Memuat variabel lingkungan (berguna untuk testing lokal membaca file .env)
load_dotenv()

app = FastAPI(title="Smart-POK AI Backend - Real AI Mode")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Izinkan Vercel frontend untuk mengakses
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi EasyOCR (Lazy Loading) agar tidak membebani startup RAM/CPU dan menyebabkan timeout.
reader = None

def get_easyocr_reader():
    global reader
    if reader is None:
        print("Loading EasyOCR models...")
        # Simpan model di direktori temporary yang pasti memiliki akses tulis
        reader = easyocr.Reader(['id', 'en'], gpu=False, model_storage_directory='/tmp/easyocr')
        print("EasyOCR models loaded.")
    return reader

# Mempersiapkan klien Groq API (diambil di dalam endpoint agar tidak crash saat startup)
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY belum dipasang di pengaturan rahasia (Secrets) Hugging Face.")
    return Groq(api_key=api_key)

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    # Validasi tipe file
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file berekstensi .pdf yang diperbolehkan.")
    
    try:
        # --- LANGKAH 1 & 2: MEMBACA PDF DENGAN PYMUPDF ---
        pdf_bytes = await file.read()
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Batasi hanya membaca maksimal 5 halaman pertama demi efisiensi
        num_pages = min(5, len(pdf_document))
        all_text_extracted = []
        
        # --- LANGKAH 3: KONVERSI HALAMAN KE GAMBAR LALU JALANKAN OCR ---
        for page_num in range(num_pages):
            page = pdf_document.load_page(page_num)
            # Render halaman menjadi gambar (pixmap) dengan DPI 150 agar teks jelas terbaca OCR
            pix = page.get_pixmap(dpi=150) 
            
            # Ubah gambar menjadi format PNG bytes agar bisa dibaca langsung oleh EasyOCR
            img_bytes = pix.tobytes("png")
            
            # Jalankan EasyOCR (detail=0 membuat response berupa list of strings)
            ocr_reader = get_easyocr_reader()
            ocr_results = ocr_reader.readtext(img_bytes, detail=0)
            page_text = " ".join(ocr_results)
            all_text_extracted.append(page_text)
            
        pdf_document.close()
        
        # Gabungkan semua teks mentah yang didapat dari ketiga halaman menjadi satu paragraf panjang
        raw_text = "\n".join(all_text_extracted)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Dokumen kosong atau teks tidak dapat terbaca oleh OCR.")

        # --- LANGKAH 4 & 5: ANALISIS TEKS MENGGUNAKAN GROQ API (Llama-3) ---
        system_prompt = """Anda adalah "Smart-POK AI", sebuah asisten ekstraksi data perbankan ahli.
Tugas Anda adalah menelaah teks hasil OCR dokumen kredit. Dokumen bisa berisi KTP, Kartu Keluarga (KK), dan Slip Gaji, ATAU hanya sebagian saja (misal hanya KTP).

Keluarkan HANYA JSON object dengan format mutlak berikut ini (tanpa penjelasan tambahan apapun):
{
  "kelengkapan": {
    "KTP": true,
    "Kartu_Keluarga": false,
    "Slip_Gaji": true
  },
  "data": {
    "NIK": "3201010101010101",
    "Nama_KTP": "BUDI SETIAWAN",
    "Nama_Slip_Gaji": "BUDI SETIAWAN",
    "Gaji": "5000000",
    "Status_Kecocokan_Nama": true
  },
  "status": "READY TO DROP"
}

Catatan Penting (WAJIB DIPATUHI): 
1. Nilai di atas hanya contoh format. Isi dengan data aktual dari teks OCR.
2. JANGAN MENGARANG DATA. Jika dokumen tertentu tidak ada (misal KK tidak ada), set kelengkapannya menjadi false. Jika data spesifik (seperti NIK/Gaji) tidak ditemukan, isi dengan string "-".
3. KARTU KELUARGA (KK) ditandai dengan kata kunci 'KARTU KELUARGA', 'Nama Kepala Keluarga', atau 'No. KK'. Jika kata-kata ini ada di teks, set "Kartu_Keluarga": true.
4. KTP ditandai dengan 'PROVINSI', 'NIK', atau format identitas standar.
5. SLIP GAJI ditandai dengan 'Slip Gaji', 'Pendapatan', 'Gaji Pokok', 'Take Home Pay'.
6. Status_Kecocokan_Nama bernilai true HANYA JIKA Nama_KTP dan Nama_Slip_Gaji keduanya ditemukan (bukan '-') dan isinya identik/mirip.
7. status harus 'READY TO DROP' HANYA JIKA KTP, Kartu_Keluarga, dan Slip_Gaji bernilai true, NIK dan Gaji ditemukan (bukan '-'), dan Status_Kecocokan_Nama bernilai true. Jika salah satu gagal, set status menjadi 'REJECTED'."""

        # Meminta respons Groq dengan format JSON
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Tolong ekstrak data dari teks raw OCR dokumen nasabah berikut:\n\n{raw_text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0, # Gunakan 0 agar hasil deterministik dan stabil
            response_format={"type": "json_object"} # Memaksa Groq mengembalikan JSON murni
        )
        
        # Ambil string JSON dari Groq
        groq_json_str = chat_completion.choices[0].message.content
        
        # Parsing string tersebut ke Python Dictionary
        result_json = json.loads(groq_json_str)
        
        # --- FAIL-SAFE: OVERRIDE DETEKSI MENGGUNAKAN PYTHON STRING MATCHING ---
        # Terkadang OCR menghasilkan spasi aneh atau LLM meleset. Kita bantu dengan Python murni.
        text_upper = raw_text.upper()
        # Deteksi KK:
        if not result_json.get("kelengkapan", {}).get("Kartu_Keluarga"):
            if ("KARTU" in text_upper and "KELUARGA" in text_upper) or \
               "KEPALA KELUARGA" in text_upper or \
               "NO. KK" in text_upper or \
               "NOMOR KK" in text_upper or \
               "STATUS PERKAWINAN" in text_upper:
                result_json["kelengkapan"]["Kartu_Keluarga"] = True

        # Deteksi KTP:
        if not result_json.get("kelengkapan", {}).get("KTP"):
            if "PROVINSI" in text_upper and "KABUPATEN" in text_upper and "NIK" in text_upper:
                result_json["kelengkapan"]["KTP"] = True

        # Deteksi Slip Gaji:
        if not result_json.get("kelengkapan", {}).get("Slip_Gaji"):
            if "SLIP" in text_upper or "GAJI" in text_upper or "PENDAPATAN" in text_upper or "TAKE HOME PAY" in text_upper:
                result_json["kelengkapan"]["Slip_Gaji"] = True
        
        # --- VERIFIKASI STATUS SECARA DETERMINISTIK MENGGUNAKAN PYTHON ---
        # Jangan percayakan penentuan status akhir pada AI karena bisa meleset.
        kelengkapan = result_json.get("kelengkapan", {})
        data_ekstraksi = result_json.get("data", {})
        
        is_ktp_ok = kelengkapan.get("KTP") is True
        is_kk_ok = kelengkapan.get("Kartu_Keluarga") is True
        is_slip_ok = kelengkapan.get("Slip_Gaji") is True
        
        is_nik_ada = data_ekstraksi.get("NIK") != "-"
        is_gaji_ada = data_ekstraksi.get("Gaji") != "-"
        is_nama_cocok = data_ekstraksi.get("Status_Kecocokan_Nama") is True
        
        if is_ktp_ok and is_kk_ok and is_slip_ok and is_nik_ada and is_gaji_ada and is_nama_cocok:
            result_json["status"] = "READY TO DROP"
        else:
            result_json["status"] = "REJECTED"
        
        # --- LANGKAH 6: KEMBALIKAN RESPONSE JSON KE FRONTEND ---
        return result_json

    except json.JSONDecodeError:
        print("Error: Groq API mengembalikan format JSON yang rusak.")
        raise HTTPException(status_code=500, detail="Gagal membaca format JSON dari AI Backend.")
        
    except Exception as e:
        # Tangkap semua jenis error tidak terduga lainnya
        print(f"Server Error Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada server saat memproses: {str(e)}")

@app.get("/")
def root():
    return {"message": "Smart-POK AI Backend is online and running real AI models."}
