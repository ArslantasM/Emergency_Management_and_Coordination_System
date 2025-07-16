import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Rapor tiplerini tanımla
type ReportType = 'tasks' | 'personnel' | 'regions' | 'incidents';

// PDF oluşturma API rotası
export async function POST(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }
    
    // İstek gövdesini al
    const { type, data, filters } = await request.json();
    
    // Geçerli rapor tipi kontrolü
    if (!type || !['tasks', 'personnel', 'regions', 'incidents'].includes(type)) {
      return NextResponse.json(
        { error: 'Geçersiz rapor tipi' },
        { status: 400 }
      );
    }
    
    // Rapor içeriğini hazırla
    const html = generateReportHTML(type as ReportType, data, filters, session.user);
    
    // PDF olarak dışa aktar - Tarayıcı tarafında jsPDF kullanarak dönüştürülecek
    return NextResponse.json({
      success: true,
      html,
      reportTitle: getReportTitle(type as ReportType),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'PDF oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Rapor başlığını alma
function getReportTitle(type: ReportType): string {
  return type === 'tasks' ? 'Görev Raporu' :
         type === 'personnel' ? 'Personel Raporu' :
         type === 'regions' ? 'Bölge Raporu' : 
         'Olay Raporu';
}

// HTML rapor şablonu oluşturma
function generateReportHTML(
  type: ReportType, 
  data: any[], 
  filters: Record<string, any>,
  user: any
): string {
  // Rapor başlığını belirle
  const reportTitle = getReportTitle(type);
  
  // Tablo sütunlarını belirle
  const columns = getColumnsForType(type);
  
  // Tarih formatla
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };
  
  // Rapor HTML şablonu
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .meta {
          margin: 15px 0;
          font-size: 12px;
        }
        .meta div {
          margin-bottom: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        .tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        }
        .tag-high { background-color: #ffccc7; color: #a8071a; }
        .tag-medium { background-color: #ffe7ba; color: #ad6800; }
        .tag-low { background-color: #d9f7be; color: #135200; }
        
        .tag-emergency { background-color: #ffccc7; color: #a8071a; }
        .tag-warning { background-color: #ffe7ba; color: #ad6800; }
        .tag-info { background-color: #d9f7be; color: #135200; }
        .tag-task { background-color: #bae7ff; color: #0050b3; }
        
        .filters {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${reportTitle}</div>
        <div class="subtitle">Acil Durum Yönetim Sistemi</div>
      </div>
      
      <div class="meta">
        <div><strong>Rapor Tarihi:</strong> ${formatDate(new Date().toISOString())}</div>
        <div><strong>Oluşturan:</strong> ${user.name} (${user.role})</div>
      </div>
      
      <div class="filters">
        <strong>Filtreler:</strong>
        ${
          Object.entries(filters || {})
            .map(([key, value]) => `<div>${key}: ${value}</div>`)
            .join('')
        }
      </div>
      
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.title}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => {
                // Hücre değerini formatla
                let cellValue = item[col.dataIndex];
                
                // Özel hücre formatlamaları
                if (col.dataIndex === 'createdAt' || col.dataIndex === 'date' || col.dataIndex.includes('date')) {
                  cellValue = formatDate(cellValue);
                }
                else if (col.dataIndex === 'status' || col.dataIndex === 'priority' || col.dataIndex === 'type') {
                  const tagClass = 
                    (cellValue === 'high' || cellValue === 'emergency') ? 'tag-high' :
                    (cellValue === 'medium' || cellValue === 'warning') ? 'tag-medium' :
                    'tag-low';
                  
                  cellValue = `<span class="tag ${tagClass}">${cellValue}</span>`;
                }
                
                return `<td>${cellValue !== undefined && cellValue !== null ? cellValue : '-'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Bu rapor Acil Durum Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
        <p>© ${new Date().getFullYear()} Acil Durum Yönetim Sistemi. Tüm hakları saklıdır.</p>
      </div>
    </body>
    </html>
  `;
}

// Rapor türüne göre tablo sütunlarını belirle
function getColumnsForType(type: ReportType) {
  switch (type) {
    case 'tasks':
      return [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Başlık', dataIndex: 'title' },
        { title: 'Tür', dataIndex: 'type' },
        { title: 'Durum', dataIndex: 'status' },
        { title: 'Öncelik', dataIndex: 'priority' },
        { title: 'Görevli', dataIndex: 'assignee' },
        { title: 'Bölge', dataIndex: 'region' },
        { title: 'Oluşturulma', dataIndex: 'createdAt' },
        { title: 'Tamamlanma', dataIndex: 'completedAt' },
        { title: 'Süre (saat)', dataIndex: 'duration' }
      ];
    
    case 'personnel':
      return [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Ad Soyad', dataIndex: 'name' },
        { title: 'Departman', dataIndex: 'department' },
        { title: 'Pozisyon', dataIndex: 'position' },
        { title: 'Durum', dataIndex: 'status' },
        { title: 'Görevler', dataIndex: 'tasks' },
        { title: 'Tamamlanan', dataIndex: 'completedTasks' },
        { title: 'Başarı Oranı (%)', dataIndex: 'successRate' },
        { title: 'Ort. Yanıt Süresi (dk)', dataIndex: 'avgResponseTime' },
        { title: 'Çalışma Saati', dataIndex: 'hoursWorked' }
      ];
    
    case 'regions':
      return [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Bölge', dataIndex: 'name' },
        { title: 'Görevler', dataIndex: 'tasks' },
        { title: 'Tamamlanan', dataIndex: 'completedTasks' },
        { title: 'Aktif Personel', dataIndex: 'activePersonnel' },
        { title: 'Olaylar', dataIndex: 'incidents' },
        { title: 'Çözülen Olaylar', dataIndex: 'resolvedIncidents' },
        { title: 'Ort. Yanıt Süresi (dk)', dataIndex: 'avgResponseTime' },
        { title: 'Risk Seviyesi', dataIndex: 'riskLevel' },
        { title: 'Kapsanan Nüfus', dataIndex: 'populationCovered' }
      ];
    
    case 'incidents':
      return [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Başlık', dataIndex: 'title' },
        { title: 'Tür', dataIndex: 'type' },
        { title: 'Yer', dataIndex: 'location' },
        { title: 'Aciliyet', dataIndex: 'severity' },
        { title: 'Durum', dataIndex: 'status' },
        { title: 'Tarih', dataIndex: 'date' },
        { title: 'Bildiren', dataIndex: 'reportedBy' },
        { title: 'Etkilenen Kişi', dataIndex: 'affectedPeople' },
        { title: 'Yapılan İşlemler', dataIndex: 'actions' }
      ];
    
    default:
      return [];
  }
} 