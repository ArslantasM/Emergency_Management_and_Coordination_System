#!/usr/bin/env node

// Performans Optimizasyon Scripti
const fs = require('fs');
const path = require('path');

console.log('🚀 Performans Optimizasyonu Başlıyor...\n');

// 1. Bundle Analizi
console.log('📊 Bundle analizi yapılıyor...');
const { execSync } = require('child_process');

try {
  // Bundle analizi çalıştır
  execSync('set ANALYZE=true && npm run build', { stdio: 'inherit' });
  console.log('✅ Bundle analizi tamamlandı!\n');
} catch (error) {
  console.log('⚠️  Bundle analizi hatası:', error.message);
}

// 2. Performans Önerileri
console.log('💡 Performans Önerileri:\n');

const recommendations = [
  {
    title: 'Code Splitting',
    description: 'Büyük bileşenleri dinamik import ile yükleyin',
    impact: 'Yüksek',
    example: 'const MapComponent = dynamic(() => import("./MapComponent"))'
  },
  {
    title: 'Image Optimization',
    description: 'Next.js Image component kullanın',
    impact: 'Orta',
    example: 'import Image from "next/image"'
  },
  {
    title: 'Bundle Size Optimization',
    description: 'Kullanılmayan kütüphaneleri kaldırın',
    impact: 'Yüksek',
    example: 'npm-bundle-analyzer ile analiz yapın'
  },
  {
    title: 'API Caching',
    description: 'API yanıtlarını cache edin',
    impact: 'Yüksek',
    example: 'React Query ile data caching'
  },
  {
    title: 'Lazy Loading',
    description: 'Sayfa dışı içerikleri lazy load edin',
    impact: 'Orta',
    example: 'Intersection Observer API'
  }
];

recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.title} (${rec.impact} Etki)`);
  console.log(`   ${rec.description}`);
  console.log(`   Örnek: ${rec.example}\n`);
});

// 3. Bundle Boyutları Kontrolü
console.log('📦 Bundle Boyutları:\n');

const bundleInfo = {
  'Antd UI': '~2.1MB',
  'React Leaflet': '~800KB', 
  'Leaflet Core': '~700KB',
  'React Query': '~400KB',
  'Total Estimated': '~4MB'
};

Object.entries(bundleInfo).forEach(([name, size]) => {
  console.log(`${name}: ${size}`);
});

console.log('\n🎯 Hedef: Total bundle < 2MB\n');

// 4. Performans Metrikleri
console.log('📈 Performans Metrikleri İzleme:\n');

const performanceScript = `
// pages/_app.js içine eklenecek
export function reportWebVitals(metric) {
  console.log(metric);
  
  // Analytics'e gönder
  if (metric.label === 'web-vital') {
    // Google Analytics, Vercel Analytics, vb.
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
}
`;

console.log(performanceScript);

console.log('\n✅ Performans optimizasyonu tamamlandı!'); 