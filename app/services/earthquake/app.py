# app.py
from flask import Flask, jsonify, request, send_from_directory, url_for
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os
import json
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from models import Earthquake, Fire, TsunamiAlert, engine, init_db

app = Flask(__name__)

# CORS ayarlarını güncelle
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# SQLAlchemy session
Session = sessionmaker(bind=engine)

# Veritabanını başlat
init_db()

# API endpoint'leri
KANDILLI_URL = "http://www.koeri.boun.edu.tr/scripts/lst0.asp"
EMSC_API = "https://www.seismicportal.eu/fdsnws/event/1/query"

# Yangın API endpoint'leri
NASA_FIRMS_API = "https://firms.modaps.eosdis.nasa.gov/api/active_fire/csv"
# NASA FIRMS için API key gerekli (ücretsiz kayıt)
NASA_FIRMS_KEY = os.getenv('NASA_FIRMS_KEY', 'demo_key')  # Demo key sınırlı kullanım için

# Tsunami API endpoint'leri
NOAA_TSUNAMI_API = "https://www.tsunami.gov/events/xml/PHEBxml.xml"
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson"

# Swagger yapılandırması
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Deprem API",
        'deepLinking': True,
        'displayOperationId': True,
        'displayRequestDuration': True,
        'docExpansion': 'list',
        'showExtensions': True,
        'showCommonExtensions': True,
        'supportedSubmitMethods': ['get'],
        'validatorUrl': None,
        'oauth2RedirectUrl': 'http://localhost:3001/api/docs/oauth2-redirect.html',
        'url': 'http://localhost:3001/static/swagger.json'
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# .env dosyasını yükle
load_dotenv()

# PostgreSQL bağlantı bilgileri
DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    """PostgreSQL bağlantısı oluştur"""
    return psycopg2.connect(DATABASE_URL)

def save_to_database(earthquakes, source):
    """Deprem verilerini veritabanına kaydet"""
    try:
        session = Session()
        
        for eq in earthquakes:
            # Aynı event_id ile kayıt var mı kontrol et
            existing = session.query(Earthquake).filter_by(event_id=eq['id']).first()
            
            if not existing:
                # Yeni kayıt ekle
                earthquake = Earthquake(
                    id=str(uuid.uuid4()),
                    event_id=eq['id'],
                    source=source,
                    date=datetime.fromisoformat(eq['date']),
                    latitude=eq['latitude'],
                    longitude=eq['longitude'],
                    depth=eq['depth'],
                    magnitude=eq['magnitude'],
                    location=eq['location']
                )
                session.add(earthquake)
        
        session.commit()
        session.close()
        return True
    except Exception as e:
        print(f"Veritabanına kaydetme hatası: {str(e)}")
        if session:
            session.rollback()
            session.close()
        return False

def fetch_and_save_kandilli_data():
    """Kandilli'den deprem verilerini çek ve PostgreSQL'e kaydet"""
    try:
        response = requests.get(KANDILLI_URL)
        response.encoding = 'utf-8'
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            pre_data = soup.find('pre')
            
            if pre_data:
                lines = pre_data.text.strip().split('\n')[6:]
                earthquakes = []
                
                for line in lines:
                    try:
                        parts = line.strip().split()
                        if len(parts) >= 9:
                            date_str = f"{parts[0]} {parts[1]}"
                            date = datetime.strptime(date_str, '%Y.%m.%d %H:%M:%S')
                            
                            earthquake = {
                                'id': f"kandilli_{date.timestamp()}",
                                'date': date.isoformat(),
                                'latitude': float(parts[2]),
                                'longitude': float(parts[3]),
                                'depth': float(parts[4]),
                                'magnitude': float(parts[6]),
                                'location': ' '.join(parts[8:])
                            }
                            earthquakes.append(earthquake)
                    except Exception as e:
                        print(f"Satır işlenirken hata: {str(e)}")
                        continue
                
                # Veritabanına kaydet
                if earthquakes:
                    save_to_database(earthquakes, 'Kandilli')
                return earthquakes
    except Exception as e:
        print(f"Kandilli verisi çekilirken hata: {str(e)}")
    return []

def fetch_and_save_emsc_data(min_magnitude=0, limit=100):
    """EMSC'den deprem verilerini çek ve PostgreSQL'e kaydet"""
    try:
        params = {
            'format': 'json',
            'limit': limit,
            'minmag': min_magnitude,
            'orderby': 'time-desc'
        }
        
        response = requests.get(EMSC_API, params=params)
        
        if response.status_code == 200:
            data = response.json()
            earthquakes = []
            
            for feature in data.get('features', []):
                try:
                    props = feature['properties']
                    coords = feature['geometry']['coordinates']
                    event_id = f"emsc_{feature['id']}"
                    
                    earthquake = {
                        'id': event_id,
                        'date': datetime.fromtimestamp(props['time'] / 1000.0).isoformat(),
                        'latitude': coords[1],
                        'longitude': coords[0],
                        'depth': coords[2],
                        'magnitude': props.get('mag', 0),
                        'location': props.get('place', 'Unknown')
                    }
                    earthquakes.append(earthquake)
                except Exception as e:
                    print(f"EMSC verisi işlenirken hata: {str(e)}")
                    continue
            
            # Veritabanına kaydet
            if earthquakes:
                save_to_database(earthquakes, 'EMSC')
            return earthquakes
    except Exception as e:
        print(f"EMSC verisi çekilirken hata: {str(e)}")
    return []

def save_fires_to_database(fires, source):
    """Yangın verilerini veritabanına kaydet"""
    try:
        session = Session()
        
        for fire in fires:
            # Aynı fire_id ile kayıt var mı kontrol et
            existing = session.query(Fire).filter_by(fire_id=fire['id']).first()
            
            if not existing:
                # Yeni kayıt ekle
                fire_record = Fire(
                    id=str(uuid.uuid4()),
                    fire_id=fire['id'],
                    source=source,
                    date=datetime.fromisoformat(fire['date']),
                    latitude=fire['latitude'],
                    longitude=fire['longitude'],
                    brightness=fire.get('brightness', 0),
                    confidence=fire.get('confidence', 0),
                    frp=fire.get('frp', 0),
                    scan=fire.get('scan', 0),
                    track=fire.get('track', 0),
                    satellite=fire.get('satellite', 'Unknown'),
                    instrument=fire.get('instrument', 'Unknown'),
                    version=fire.get('version', '1.0'),
                    location=fire.get('location', 'Unknown')
                )
                session.add(fire_record)
        
        session.commit()
        session.close()
        return True
    except Exception as e:
        print(f"Yangın verilerini veritabanına kaydetme hatası: {str(e)}")
        if session:
            session.rollback()
            session.close()
        return False

def fetch_and_save_nasa_firms_data(region='Global', days=1):
    """NASA FIRMS'den yangın verilerini çek ve veritabanına kaydet"""
    try:
        # NASA FIRMS API - MODIS ve VIIRS aktif yangın verileri
        # Ücretsiz demo key ile sınırlı kullanım
        url = f"{NASA_FIRMS_API}/{NASA_FIRMS_KEY}/MODIS_NRT/{region}/{days}"
        
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            lines = response.text.strip().split('\n')
            if len(lines) < 2:
                return []
            
            # CSV başlıkları
            headers = lines[0].split(',')
            fires = []
            
            for line in lines[1:]:
                try:
                    values = line.split(',')
                    if len(values) >= 10:
                        # Tarih formatını düzenle
                        acq_date = values[5]  # YYYY-MM-DD
                        acq_time = values[6].zfill(4)  # HHMM
                        
                        # Saat ve dakikayı ayır
                        hour = acq_time[:2]
                        minute = acq_time[2:]
                        
                        date_str = f"{acq_date} {hour}:{minute}:00"
                        fire_date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                        
                        fire = {
                            'id': f"nasa_modis_{values[0]}_{values[1]}_{acq_date}_{acq_time}",
                            'date': fire_date.isoformat(),
                            'latitude': float(values[0]),
                            'longitude': float(values[1]),
                            'brightness': float(values[2]) if values[2] else 0,
                            'confidence': int(values[8]) if values[8] else 0,
                            'frp': float(values[9]) if values[9] else 0,
                            'scan': float(values[3]) if values[3] else 0,
                            'track': float(values[4]) if values[4] else 0,
                            'satellite': values[7] if len(values) > 7 else 'Terra/Aqua',
                            'instrument': 'MODIS',
                            'version': 'NRT',
                            'location': f"Lat: {values[0]}, Lon: {values[1]}"
                        }
                        fires.append(fire)
                except Exception as e:
                    print(f"NASA FIRMS satır işlenirken hata: {str(e)}")
                    continue
            
            # Veritabanına kaydet
            if fires:
                save_fires_to_database(fires, 'NASA_FIRMS_MODIS')
            return fires
            
    except Exception as e:
        print(f"NASA FIRMS verisi çekilirken hata: {str(e)}")
    return []

def fetch_and_save_nasa_viirs_data(region='Global', days=1):
    """NASA FIRMS VIIRS'den yangın verilerini çek ve veritabanına kaydet"""
    try:
        # VIIRS yangın verileri - daha yüksek çözünürlük
        url = f"{NASA_FIRMS_API}/{NASA_FIRMS_KEY}/VIIRS_SNPP_NRT/{region}/{days}"
        
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            lines = response.text.strip().split('\n')
            if len(lines) < 2:
                return []
            
            fires = []
            
            for line in lines[1:]:
                try:
                    values = line.split(',')
                    if len(values) >= 10:
                        # Tarih formatını düzenle
                        acq_date = values[5]  # YYYY-MM-DD
                        acq_time = values[6].zfill(4)  # HHMM
                        
                        hour = acq_time[:2]
                        minute = acq_time[2:]
                        
                        date_str = f"{acq_date} {hour}:{minute}:00"
                        fire_date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                        
                        fire = {
                            'id': f"nasa_viirs_{values[0]}_{values[1]}_{acq_date}_{acq_time}",
                            'date': fire_date.isoformat(),
                            'latitude': float(values[0]),
                            'longitude': float(values[1]),
                            'brightness': float(values[2]) if values[2] else 0,
                            'confidence': int(values[8]) if values[8] else 0,
                            'frp': float(values[9]) if values[9] else 0,
                            'scan': float(values[3]) if values[3] else 0,
                            'track': float(values[4]) if values[4] else 0,
                            'satellite': 'NPP',
                            'instrument': 'VIIRS',
                            'version': 'NRT',
                            'location': f"Lat: {values[0]}, Lon: {values[1]}"
                        }
                        fires.append(fire)
                except Exception as e:
                    print(f"NASA VIIRS satır işlenirken hata: {str(e)}")
                    continue
            
            # Veritabanına kaydet
            if fires:
                save_fires_to_database(fires, 'NASA_FIRMS_VIIRS')
            return fires
            
    except Exception as e:
        print(f"NASA VIIRS verisi çekilirken hata: {str(e)}")
    return []

def save_tsunami_alerts_to_database(alerts, source):
    """Tsunami uyarılarını veritabanına kaydet"""
    try:
        session = Session()
        
        for alert in alerts:
            # Aynı alert_id ile kayıt var mı kontrol et
            existing = session.query(TsunamiAlert).filter_by(alert_id=alert['id']).first()
            
            if not existing:
                # Yeni kayıt ekle
                tsunami_alert = TsunamiAlert(
                    id=str(uuid.uuid4()),
                    alert_id=alert['id'],
                    source=source,
                    date=datetime.fromisoformat(alert['date']),
                    latitude=alert['latitude'],
                    longitude=alert['longitude'],
                    magnitude=alert.get('magnitude', 0),
                    depth=alert.get('depth', 0),
                    alert_level=alert.get('alert_level', 'Unknown'),
                    status=alert.get('status', 'Active'),
                    affected_regions=alert.get('affected_regions', ''),
                    message=alert.get('message', ''),
                    location=alert.get('location', 'Unknown')
                )
                session.add(tsunami_alert)
        
        session.commit()
        session.close()
        return True
    except Exception as e:
        print(f"Tsunami uyarılarını veritabanına kaydetme hatası: {str(e)}")
        if session:
            session.rollback()
            session.close()
        return False

def fetch_and_save_usgs_tsunami_data():
    """USGS'den tsunami potansiyeli olan depremleri çek"""
    try:
        # USGS Significant Earthquakes (son 24 saat)
        response = requests.get(USGS_EARTHQUAKE_API, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            alerts = []
            
            for feature in data.get('features', []):
                try:
                    props = feature['properties']
                    coords = feature['geometry']['coordinates']
                    
                    # Tsunami potansiyeli kontrolü (magnitude >= 6.0 ve deniz/kıyı yakını)
                    magnitude = props.get('mag', 0)
                    tsunami = props.get('tsunami', 0)
                    
                    if magnitude >= 6.0 or tsunami == 1:
                        alert_id = f"usgs_tsunami_{feature['id']}"
                        
                        # Alert level belirleme
                        alert_level = "Watch"
                        if magnitude >= 7.0:
                            alert_level = "Warning"
                        elif magnitude >= 8.0:
                            alert_level = "Major Warning"
                        
                        status = "Active" if tsunami == 1 else "Potential"
                        
                        alert = {
                            'id': alert_id,
                            'date': datetime.fromtimestamp(props['time'] / 1000.0).isoformat(),
                            'latitude': coords[1],
                            'longitude': coords[0],
                            'magnitude': magnitude,
                            'depth': coords[2] if len(coords) > 2 else 0,
                            'alert_level': alert_level,
                            'status': status,
                            'affected_regions': props.get('place', 'Unknown'),
                            'message': f"Magnitude {magnitude} earthquake detected. Tsunami {status.lower()}.",
                            'location': props.get('place', 'Unknown')
                        }
                        alerts.append(alert)
                        
                except Exception as e:
                    print(f"USGS tsunami verisi işlenirken hata: {str(e)}")
                    continue
            
            # Veritabanına kaydet
            if alerts:
                save_tsunami_alerts_to_database(alerts, 'USGS')
            return alerts
            
    except Exception as e:
        print(f"USGS tsunami verisi çekilirken hata: {str(e)}")
    return []

@app.route('/')
def index():
    """API ana sayfası"""
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'docs': '/api/docs',
        'endpoints': {
            '/api/earthquakes/kandilli': 'Kandilli Rasathanesi deprem verileri',
            '/api/earthquakes/emsc': 'EMSC deprem verileri',
            '/api/earthquakes/all': 'Tüm kaynakların deprem verileri',
            '/api/fires/nasa-modis': 'NASA FIRMS MODIS yangın verileri',
            '/api/fires/nasa-viirs': 'NASA FIRMS VIIRS yangın verileri',
            '/api/fires/all': 'Tüm kaynakların yangın verileri',
            '/api/tsunami/alerts': 'Tsunami uyarıları',
            '/api/tsunami/usgs': 'USGS tsunami potansiyeli',
            '/api/tsunami/all': 'Tüm tsunami uyarıları'
        }
    })

@app.route('/api/earthquakes/kandilli')
def get_kandilli_earthquakes():
    """Kandilli deprem verilerini getir"""
    fetch_and_save_kandilli_data()
    
    session = Session()
    earthquakes = session.query(Earthquake).filter_by(source='Kandilli').order_by(Earthquake.date.desc()).all()
    
    result = [{
        'id': eq.id,
        'source': eq.source,
        'date': eq.date.isoformat(),
        'latitude': eq.latitude,
        'longitude': eq.longitude,
        'depth': eq.depth,
        'magnitude': eq.magnitude,
        'location': eq.location
    } for eq in earthquakes]
    
    session.close()
    
    return jsonify({
        'source': 'Kandilli',
        'count': len(result),
        'earthquakes': result
    })

@app.route('/api/earthquakes/emsc')
def get_emsc_earthquakes():
    """EMSC deprem verilerini getir"""
    min_magnitude = request.args.get('min_magnitude', default=0, type=float)
    limit = request.args.get('limit', default=100, type=int)
    
    fetch_and_save_emsc_data(min_magnitude, limit)
    
    session = Session()
    earthquakes = session.query(Earthquake).filter_by(source='EMSC').order_by(Earthquake.date.desc()).all()
    
    result = [{
        'id': eq.id,
        'source': eq.source,
        'date': eq.date.isoformat(),
        'latitude': eq.latitude,
        'longitude': eq.longitude,
        'depth': eq.depth,
        'magnitude': eq.magnitude,
        'location': eq.location
    } for eq in earthquakes]
    
    session.close()
    
    return jsonify({
        'source': 'EMSC',
        'count': len(result),
        'earthquakes': result
    })

@app.route('/api/earthquakes/all')
def get_all_earthquakes():
    """Tüm kaynakların deprem verilerini getir"""
    min_magnitude = request.args.get('min_magnitude', default=0, type=float)
    
    # Verileri güncelle
    fetch_and_save_kandilli_data()
    fetch_and_save_emsc_data(min_magnitude)
    
    session = Session()
    earthquakes = session.query(Earthquake).filter(Earthquake.magnitude >= min_magnitude).order_by(Earthquake.date.desc()).all()
    
    result = [{
        'id': eq.id,
        'source': eq.source,
        'date': eq.date.isoformat(),
        'latitude': eq.latitude,
        'longitude': eq.longitude,
        'depth': eq.depth,
        'magnitude': eq.magnitude,
        'location': eq.location
    } for eq in earthquakes]
    
    session.close()
    
    return jsonify({
        'sources': ['Kandilli', 'EMSC'],
        'count': len(result),
        'earthquakes': result
    })

@app.route('/api/fires/nasa-modis')
def get_nasa_modis_fires():
    """NASA FIRMS MODIS yangın verilerini getir"""
    region = request.args.get('region', default='Global', type=str)
    days = request.args.get('days', default=1, type=int)
    min_confidence = request.args.get('min_confidence', default=0, type=int)
    
    fetch_and_save_nasa_firms_data(region, days)
    
    session = Session()
    fires = session.query(Fire).filter_by(source='NASA_FIRMS_MODIS')
    
    if min_confidence > 0:
        fires = fires.filter(Fire.confidence >= min_confidence)
    
    fires = fires.order_by(Fire.date.desc()).all()
    
    result = [{
        'id': fire.id,
        'source': fire.source,
        'date': fire.date.isoformat(),
        'latitude': fire.latitude,
        'longitude': fire.longitude,
        'brightness': fire.brightness,
        'confidence': fire.confidence,
        'frp': fire.frp,
        'satellite': fire.satellite,
        'instrument': fire.instrument,
        'location': fire.location
    } for fire in fires]
    
    session.close()
    
    return jsonify({
        'source': 'NASA_FIRMS_MODIS',
        'count': len(result),
        'fires': result
    })

@app.route('/api/fires/nasa-viirs')
def get_nasa_viirs_fires():
    """NASA FIRMS VIIRS yangın verilerini getir"""
    region = request.args.get('region', default='Global', type=str)
    days = request.args.get('days', default=1, type=int)
    min_confidence = request.args.get('min_confidence', default=0, type=int)
    
    fetch_and_save_nasa_viirs_data(region, days)
    
    session = Session()
    fires = session.query(Fire).filter_by(source='NASA_FIRMS_VIIRS')
    
    if min_confidence > 0:
        fires = fires.filter(Fire.confidence >= min_confidence)
    
    fires = fires.order_by(Fire.date.desc()).all()
    
    result = [{
        'id': fire.id,
        'source': fire.source,
        'date': fire.date.isoformat(),
        'latitude': fire.latitude,
        'longitude': fire.longitude,
        'brightness': fire.brightness,
        'confidence': fire.confidence,
        'frp': fire.frp,
        'satellite': fire.satellite,
        'instrument': fire.instrument,
        'location': fire.location
    } for fire in fires]
    
    session.close()
    
    return jsonify({
        'source': 'NASA_FIRMS_VIIRS',
        'count': len(result),
        'fires': result
    })

@app.route('/api/fires/all')
def get_all_fires():
    """Tüm kaynakların yangın verilerini getir"""
    region = request.args.get('region', default='Global', type=str)
    days = request.args.get('days', default=1, type=int)
    min_confidence = request.args.get('min_confidence', default=0, type=int)
    min_frp = request.args.get('min_frp', default=0, type=float)
    
    # Verileri güncelle
    fetch_and_save_nasa_firms_data(region, days)
    fetch_and_save_nasa_viirs_data(region, days)
    
    session = Session()
    fires = session.query(Fire)
    
    if min_confidence > 0:
        fires = fires.filter(Fire.confidence >= min_confidence)
    
    if min_frp > 0:
        fires = fires.filter(Fire.frp >= min_frp)
    
    fires = fires.order_by(Fire.date.desc()).all()
    
    result = [{
        'id': fire.id,
        'source': fire.source,
        'date': fire.date.isoformat(),
        'latitude': fire.latitude,
        'longitude': fire.longitude,
        'brightness': fire.brightness,
        'confidence': fire.confidence,
        'frp': fire.frp,
        'satellite': fire.satellite,
        'instrument': fire.instrument,
        'location': fire.location
    } for fire in fires]
    
    session.close()
    
    return jsonify({
        'sources': ['NASA_FIRMS_MODIS', 'NASA_FIRMS_VIIRS'],
        'count': len(result),
        'fires': result
    })

@app.route('/api/tsunami/usgs')
def get_usgs_tsunami_alerts():
    """USGS tsunami uyarılarını getir"""
    fetch_and_save_usgs_tsunami_data()
    
    session = Session()
    alerts = session.query(TsunamiAlert).filter_by(source='USGS').order_by(TsunamiAlert.date.desc()).all()
    
    result = [{
        'id': alert.id,
        'source': alert.source,
        'date': alert.date.isoformat(),
        'latitude': alert.latitude,
        'longitude': alert.longitude,
        'magnitude': alert.magnitude,
        'depth': alert.depth,
        'alert_level': alert.alert_level,
        'status': alert.status,
        'affected_regions': alert.affected_regions,
        'message': alert.message,
        'location': alert.location
    } for alert in alerts]
    
    session.close()
    
    return jsonify({
        'source': 'USGS',
        'count': len(result),
        'tsunami_alerts': result
    })

@app.route('/api/tsunami/all')
def get_all_tsunami_alerts():
    """Tüm tsunami uyarılarını getir"""
    min_magnitude = request.args.get('min_magnitude', default=6.0, type=float)
    alert_level = request.args.get('alert_level', default='', type=str)
    
    # Verileri güncelle
    fetch_and_save_usgs_tsunami_data()
    
    session = Session()
    alerts = session.query(TsunamiAlert)
    
    if min_magnitude > 0:
        alerts = alerts.filter(TsunamiAlert.magnitude >= min_magnitude)
    
    if alert_level:
        alerts = alerts.filter(TsunamiAlert.alert_level.ilike(f'%{alert_level}%'))
    
    alerts = alerts.order_by(TsunamiAlert.date.desc()).all()
    
    result = [{
        'id': alert.id,
        'source': alert.source,
        'date': alert.date.isoformat(),
        'latitude': alert.latitude,
        'longitude': alert.longitude,
        'magnitude': alert.magnitude,
        'depth': alert.depth,
        'alert_level': alert.alert_level,
        'status': alert.status,
        'affected_regions': alert.affected_regions,
        'message': alert.message,
        'location': alert.location
    } for alert in alerts]
    
    session.close()
    
    return jsonify({
        'sources': ['USGS'],
        'count': len(result),
        'tsunami_alerts': result
    })

@app.errorhandler(404)
def not_found_error(error):
    """404 hatası için özel yanıt"""
    return jsonify({
        "error": "Sayfa bulunamadı",
        "message": "İstediğiniz endpoint mevcut değil.",
        "docs": "/api/docs",
        "available_endpoints": {
            "/": "API bilgisi",
            "/api/earthquakes/kandilli": "Kandilli Rasathanesi deprem verileri",
            "/api/earthquakes/emsc": "EMSC deprem verileri",
            "/api/earthquakes/all": "Tüm kaynakların deprem verileri",
            "/api/fires/nasa-modis": "NASA FIRMS MODIS yangın verileri",
            "/api/fires/nasa-viirs": "NASA FIRMS VIIRS yangın verileri",
            "/api/fires/all": "Tüm kaynakların yangın verileri",
            "/api/tsunami/usgs": "USGS tsunami uyarıları",
            "/api/tsunami/all": "Tüm tsunami uyarıları"
        }
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 hatası için özel yanıt"""
    return jsonify({
        "error": "Sunucu hatası",
        "message": "İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
    }), 500

if __name__ == '__main__':
    # static klasörünü oluştur
    if not os.path.exists('static'):
        os.makedirs('static')
    
    # Swagger JSON dosyasını oluştur
    swagger_data = {
        "swagger": "2.0",
        "info": {
            "title": "Deprem API",
            "description": "Türkiye ve dünya genelindeki deprem verilerini sunan API",
            "version": "1.0.0"
        },
        "host": "localhost:3001",
        "basePath": "/api",
        "schemes": ["http"],
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "servers": [
            {
                "url": "http://localhost:3001",
                "description": "Development server"
            }
        ],
        "tags": [
            {
                "name": "Earthquakes",
                "description": "Deprem verileri ile ilgili endpoint'ler"
            }
        ],
        "paths": {
            "/earthquakes/kandilli": {
                "get": {
                    "tags": ["Earthquakes"],
                    "summary": "Kandilli Rasathanesi deprem verilerini getir",
                    "operationId": "getKandilliEarthquakes",
                    "produces": ["application/json"],
                    "responses": {
                        "200": {
                            "description": "Başarılı",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "source": {"type": "string"},
                                    "count": {"type": "integer"},
                                    "earthquakes": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/Earthquake"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/earthquakes/emsc": {
                "get": {
                    "tags": ["Earthquakes"],
                    "summary": "EMSC deprem verilerini getir",
                    "operationId": "getEMSCEarthquakes",
                    "produces": ["application/json"],
                    "parameters": [
                        {
                            "name": "min_magnitude",
                            "in": "query",
                            "type": "number",
                            "description": "Minimum deprem büyüklüğü"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "type": "integer",
                            "description": "Maksimum sonuç sayısı"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Başarılı",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "source": {"type": "string"},
                                    "count": {"type": "integer"},
                                    "earthquakes": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/Earthquake"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/earthquakes/all": {
                "get": {
                    "tags": ["Earthquakes"],
                    "summary": "Tüm kaynakların deprem verilerini getir",
                    "operationId": "getAllEarthquakes",
                    "produces": ["application/json"],
                    "parameters": [
                        {
                            "name": "min_magnitude",
                            "in": "query",
                            "type": "number",
                            "description": "Minimum deprem büyüklüğü"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Başarılı",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "sources": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    },
                                    "count": {"type": "integer"},
                                    "earthquakes": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/definitions/Earthquake"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "definitions": {
            "Earthquake": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "source": {"type": "string"},
                    "date": {"type": "string", "format": "date-time"},
                    "latitude": {"type": "number"},
                    "longitude": {"type": "number"},
                    "depth": {"type": "number"},
                    "magnitude": {"type": "number"},
                    "location": {"type": "string"}
                }
            }
        }
    }
    
    with open('static/swagger.json', 'w', encoding='utf-8') as f:
        json.dump(swagger_data, f, ensure_ascii=False, indent=2)
    
    app.run(host='0.0.0.0', port=3001, debug=True)