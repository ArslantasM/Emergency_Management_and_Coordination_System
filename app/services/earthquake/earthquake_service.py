import requests
import psycopg2
import json
from datetime import datetime, timedelta
import time
import os
from dotenv import load_dotenv

# .env dosyasından veritabanı bağlantı bilgilerini yükle
load_dotenv()

# Veritabanı bağlantı bilgileri
DB_CONNECTION = os.getenv('DATABASE_URL')

# API endpoint'leri
AFAD_URL = "https://deprem.afad.gov.tr/last-earthquakes.html"
USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
NOAA_TSUNAMI_URL = "https://www.tsunami.gov/json/web_tsu.json"

def get_afad_earthquakes():
    """AFAD'dan son depremleri çek"""
    try:
        response = requests.get(AFAD_URL)
        response.raise_for_status()
        data = response.json()
        return [{"source": "AFAD", "data": eq} for eq in data]
    except Exception as e:
        print(f"AFAD verisi çekilirken hata oluştu: {e}")
        return []

def get_usgs_earthquakes():
    """USGS'den son depremleri çek"""
    try:
        response = requests.get(USGS_URL)
        response.raise_for_status()
        data = response.json()
        earthquakes = []
        for feature in data['features']:
            eq = {
                "source": "USGS",
                "data": {
                    "eventId": feature['id'],
                    "date": datetime.fromtimestamp(feature['properties']['time'] / 1000.0),
                    "latitude": feature['geometry']['coordinates'][1],
                    "longitude": feature['geometry']['coordinates'][0],
                    "depth": feature['geometry']['coordinates'][2],
                    "magnitude": feature['properties']['mag'],
                    "type": feature['properties']['magType'],
                    "location": feature['properties']['place'],
                    "tsunamiAlert": feature['properties'].get('tsunami', 0) > 0
                }
            }
            earthquakes.append(eq)
        return earthquakes
    except Exception as e:
        print(f"USGS verisi çekilirken hata oluştu: {e}")
        return []

def get_tsunami_alerts():
    """NOAA'dan tsunami uyarılarını çek"""
    try:
        response = requests.get(NOAA_TSUNAMI_URL)
        response.raise_for_status()
        data = response.json()
        return data['tsunamiAlerts'] if 'tsunamiAlerts' in data else []
    except Exception as e:
        print(f"Tsunami verisi çekilirken hata oluştu: {e}")
        return []

def save_tsunami_alert(cursor, alert_data):
    """Tsunami uyarısını veritabanına kaydet"""
    try:
        # Çokgen geometrisi oluştur (basitleştirilmiş örnek)
        geom = None
        if 'coordinates' in alert_data:
            coords = alert_data['coordinates']
            geom = f"MULTIPOLYGON((({coords})))"
        
        insert_query = """
        INSERT INTO "TsunamiAlert" (
            "alertId", source, status, severity, date, "expiryDate",
            description, "affectedAreas", geom, "createdAt", "updatedAt"
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, 
            CASE WHEN %s IS NULL THEN NULL ELSE ST_SetSRID(ST_GeomFromText(%s), 4326) END,
            %s, %s
        )
        ON CONFLICT ("alertId") DO UPDATE SET
            status = EXCLUDED.status,
            severity = EXCLUDED.severity,
            "expiryDate" = EXCLUDED."expiryDate",
            description = EXCLUDED.description,
            "updatedAt" = EXCLUDED."updatedAt"
        """
        
        values = (
            alert_data['id'],
            'NOAA',
            alert_data['status'],
            alert_data['severity'],
            datetime.strptime(alert_data['date'], '%Y-%m-%d %H:%M:%S'),
            datetime.strptime(alert_data['expiryDate'], '%Y-%m-%d %H:%M:%S') if 'expiryDate' in alert_data else None,
            alert_data['description'],
            alert_data.get('affectedAreas', []),
            geom,
            geom,
            datetime.now(),
            datetime.now()
        )
        
        cursor.execute(insert_query, values)
        return cursor.fetchone()[0] if cursor.rowcount > 0 else None
        
    except Exception as e:
        print(f"Tsunami uyarısı kaydedilirken hata oluştu: {e}")
        return None

def save_earthquake(cursor, earthquake):
    """Deprem verisini veritabanına kaydet"""
    try:
        source = earthquake['source']
        data = earthquake['data']
        
        # PostGIS geometri noktası oluştur
        geom = f"POINT({data['longitude']} {data['latitude']})"
        
        # Veriyi hazırla
        insert_query = """
        INSERT INTO "Earthquake" (
            "eventId", source, date, latitude, longitude, depth, 
            magnitude, type, location, geom, "tsunamiAlert", "createdAt", "updatedAt"
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, 
            ST_SetSRID(ST_GeomFromText(%s), 4326), %s, %s, %s
        )
        ON CONFLICT ("eventId") DO NOTHING
        """
        
        values = (
            data['eventId'],
            source,
            data['date'] if isinstance(data['date'], datetime) else datetime.strptime(data['date'], '%Y-%m-%d %H:%M:%S'),
            float(data['latitude']),
            float(data['longitude']),
            float(data['depth']),
            float(data['magnitude']),
            data['type'],
            data['location'],
            geom,
            data.get('tsunamiAlert', False),
            datetime.now(),
            datetime.now()
        )
        
        cursor.execute(insert_query, values)
        
    except Exception as e:
        print(f"Deprem verisi kaydedilirken hata oluştu: {e}")

def main():
    """Ana servis döngüsü"""
    while True:
        try:
            # Veritabanına bağlan
            conn = psycopg2.connect(DB_CONNECTION)
            cursor = conn.cursor()
            
            # Tüm kaynaklardan deprem verilerini çek
            all_earthquakes = []
            all_earthquakes.extend(get_afad_earthquakes())
            all_earthquakes.extend(get_usgs_earthquakes())
            
            # Tsunami uyarılarını çek
            tsunami_alerts = get_tsunami_alerts()
            
            if all_earthquakes or tsunami_alerts:
                # Deprem verilerini kaydet
                for eq in all_earthquakes:
                    save_earthquake(cursor, eq)
                
                # Tsunami uyarılarını kaydet
                for alert in tsunami_alerts:
                    save_tsunami_alert(cursor, alert)
                
                # Değişiklikleri kaydet
                conn.commit()
                print(f"{datetime.now()} - Veriler başarıyla güncellendi")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"Servis hatası: {e}")
        
        # 5 dakika bekle
        time.sleep(300)

if __name__ == "__main__":
    main() 