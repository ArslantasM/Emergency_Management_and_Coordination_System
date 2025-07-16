from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

Base = declarative_base()

class Earthquake(Base):
    __tablename__ = 'Earthquake'

    id = Column(String, primary_key=True)
    event_id = Column(String, unique=True)
    source = Column(String)  # Veri kaynağı (Kandilli, EMSC)
    date = Column(DateTime)  # Deprem tarihi ve saati
    latitude = Column(Float)  # Enlem
    longitude = Column(Float)  # Boylam
    depth = Column(Float)  # Derinlik (km)
    magnitude = Column(Float)  # Büyüklük
    location = Column(String)  # Yer bilgisi
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Fire(Base):
    __tablename__ = 'Fire'

    id = Column(String, primary_key=True)
    fire_id = Column(String, unique=True)
    source = Column(String)  # Veri kaynağı (NASA FIRMS, EFFIS, etc.)
    date = Column(DateTime)  # Yangın tespit tarihi ve saati
    latitude = Column(Float)  # Enlem
    longitude = Column(Float)  # Boylam
    brightness = Column(Float)  # Parlaklık (brightness temperature)
    confidence = Column(Integer)  # Güven seviyesi (0-100)
    frp = Column(Float)  # Fire Radiative Power (MW)
    scan = Column(Float)  # Tarama açısı
    track = Column(Float)  # Takip açısı
    satellite = Column(String)  # Uydu adı (Terra, Aqua, NPP, NOAA-20)
    instrument = Column(String)  # Sensör adı (MODIS, VIIRS)
    version = Column(String)  # Veri versiyonu
    location = Column(String)  # Yer bilgisi
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TsunamiAlert(Base):
    __tablename__ = 'TsunamiAlert'

    id = Column(String, primary_key=True)
    alert_id = Column(String, unique=True)
    source = Column(String)  # Veri kaynağı (NOAA, EMSC, etc.)
    date = Column(DateTime)  # Uyarı tarihi ve saati
    latitude = Column(Float)  # Enlem
    longitude = Column(Float)  # Boylam
    magnitude = Column(Float)  # İlgili deprem büyüklüğü
    depth = Column(Float)  # İlgili deprem derinliği
    alert_level = Column(String)  # Uyarı seviyesi (Watch, Warning, Advisory)
    status = Column(String)  # Durum (Active, Cancelled, Expired)
    affected_regions = Column(String)  # Etkilenen bölgeler
    message = Column(String)  # Uyarı mesajı
    location = Column(String)  # Yer bilgisi
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# PostgreSQL veritabanı bağlantısı
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '?schema=' in DATABASE_URL:
    # SQLAlchemy için schema parametresini kaldır
    DATABASE_URL = DATABASE_URL.split('?schema=')[0]

if not DATABASE_URL:
    # Fallback olarak SQLite kullan
    DATABASE_URL = 'sqlite:///earthquakes.db'

engine = create_engine(DATABASE_URL)

# Session oluştur
Session = sessionmaker(bind=engine)

# Tabloları oluştur
def init_db():
    Base.metadata.create_all(engine) 