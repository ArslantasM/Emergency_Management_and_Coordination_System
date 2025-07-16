# Dünya Geneli Deprem Verileri API

Bu proje, USGS (United States Geological Survey) API'sini kullanarak dünya genelindeki deprem verilerini görselleştiren bir web uygulamasıdır.

## Özellikler

- Dünya genelinde son depremleri harita üzerinde gösterme
- Deprem büyüklüğüne göre filtreleme
- Zaman aralığına göre filtreleme (son 24 saat, 7 gün, 30 gün)
- Deprem büyüklüğüne göre renkli gösterim
- Tsunami riski bilgisi
- Her deprem için detaylı bilgi
- İnteraktif harita görünümü

## Kurulum

1. Python 3.8 veya üzeri sürümün yüklü olduğundan emin olun
2. Projeyi klonlayın
3. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac için
.venv\Scripts\activate     # Windows için
```
4. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

## Çalıştırma

```bash
python app.py
```

Uygulama varsayılan olarak http://localhost:5000 adresinde çalışacaktır.

## API Kullanımı

### Deprem Verilerini Alma

```http
GET /api/earthquakes?days=30&min_magnitude=4.5
```

#### Parametreler

- `days`: Kaç gün öncesine ait verilerin getirileceği (varsayılan: 30)
- `min_magnitude`: Minimum deprem büyüklüğü (varsayılan: 4.5)

#### Örnek Yanıt

```json
{
    "status": "success",
    "count": 50,
    "earthquakes": [
        {
            "date": "2024-03-20 15:30:45",
            "latitude": 35.7218,
            "longitude": -117.5485,
            "depth": 10.5,
            "magnitude": 4.8,
            "location": "Southern California",
            "type": "earthquake",
            "tsunami_risk": false,
            "details_url": "https://earthquake.usgs.gov/..."
        }
    ]
}
```

## Lisans

MIT 