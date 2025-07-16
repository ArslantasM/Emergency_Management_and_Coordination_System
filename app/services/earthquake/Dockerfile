FROM python:3.11-slim

WORKDIR /app

# Gerekli paketleri kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Servisi başlat
CMD ["python", "earthquake_service.py"] 