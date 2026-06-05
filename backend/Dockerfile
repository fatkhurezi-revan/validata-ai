# Menggunakan image Python resmi yang ringan
FROM python:3.10-slim

# Mengatur direktori kerja di dalam container
WORKDIR /app

# Menyalin file requirements dan menginstal dependensi
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh kode backend ke dalam container
COPY . .

# Hugging Face Spaces mengharuskan aplikasi berjalan pada port 7860 secara default
EXPOSE 7860

# Perintah untuk menjalankan FastAPI menggunakan uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
