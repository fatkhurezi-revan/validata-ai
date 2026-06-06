FROM python:3.10-slim

# Hugging Face Spaces berjalan sebagai user non-root (UID 1000).
# Kita harus membuat user tersebut dan mengatur HOME direktori agar EasyOCR memiliki akses tulis untuk mengunduh model.
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies untuk OpenCV (dibutuhkan oleh EasyOCR)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Menyalin file requirements dan menginstal dependensi Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh kode backend ke dalam container
COPY . .

# Ubah kepemilikan file ke user non-root
RUN chown -R user:user $HOME/app

# Pindah ke user non-root
USER user

# Hugging Face Spaces mengharuskan aplikasi berjalan pada port 7860
EXPOSE 7860

# Perintah untuk menjalankan FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
