"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Form,
  Select,
  Typography,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  message,
  Modal,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  MailOutlined,
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  VideoCameraOutlined,
  MessageOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

// Personel tipi tanımı
interface Personnel {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  region: string;
  status: string;
  avatar: string | null;
}

// Demo personel verileri - sabit bir dizi olarak tanımla
const demoPersonnelData: Personnel[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '0555-111-2233',
    role: 'field',
    department: 'search-rescue',
    region: 'istanbul',
    status: 'active',
    avatar: null
  },
  {
    id: '2',
    name: 'Ayşe Kaya',
    email: 'ayse.kaya@example.com',
    phone: '0555-222-3344',
    role: 'coordinator',
    department: 'medical',
    region: 'istanbul',
    status: 'active',
    avatar: null
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    email: 'mehmet.demir@example.com',
    phone: '0555-333-4455',
    role: 'field',
    department: 'logistics',
    region: 'ankara',
    status: 'inactive',
    avatar: null
  },
  {
    id: '4',
    name: 'Zeynep Şahin',
    email: 'zeynep.sahin@example.com',
    phone: '0555-444-5566',
    role: 'manager',
    department: 'coordination',
    region: 'izmir',
    status: 'active',
    avatar: null
  },
  {
    id: '5',
    name: 'Mustafa Yıldız',
    email: 'mustafa.yildiz@example.com',
    phone: '0555-555-6677',
    role: 'field',
    department: 'search-rescue',
    region: 'ankara',
    status: 'active',
    avatar: null
  },
];

let autoTableLoaded = false;

// PDF kütüphanelerini yükle
const loadPdfLibraries = async () => {
  try {
    await import('jspdf-autotable');
    autoTableLoaded = true;
    return true;
  } catch (error) {
    console.error('PDF tablo kütüphanesi yüklenirken hata:', error);
    return false;
  }
};

// jsPDF için özel tipleme
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => void;
}

export default function PersonnelPage() {
  // useState hook'u bileşen fonksiyonu içinde kullanılmalı
  const [personnelList, setPersonnelList] = useState<Personnel[]>(demoPersonnelData);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const tableRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const { data: session, status: sessionStatus } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Rolü kontrol ederek tüm bölgeleri görüntüleme yeteneği
  const canViewAllRegions = () => {
    return session?.user.role === 'admin';
  };
  
  // Kullanıcının bölgesi, API'den alınacak, şimdilik ilk bölgeyi varsayalım
  const userRegion = "Marmara Bölgesi";
  
  // Admin dışındaki roller için bölge kısıtlaması uygula
  useEffect(() => {
    if (!canViewAllRegions() && sessionStatus !== "loading") {
      setSelectedRegion(userRegion);
      // Bölgeye göre personel filtrele
      const filteredData = personnelList.filter(person => person.region === userRegion);
      setPersonnelList(filteredData);
    } else {
      setPersonnelList(personnelList);
    }
  }, [sessionStatus]);
  
  // Bölge değiştirme işlemi
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    if (value === 'all') {
      setPersonnelList(demoPersonnelData);
    } else {
      const filtered = demoPersonnelData.filter(person => person.region === value);
      setPersonnelList(filtered);
    }
  };

  // Departman, rol ve bölge seçenekleri
  const departments = [
    { value: 'search-rescue', label: 'Arama Kurtarma' },
    { value: 'medical', label: 'Sağlık' },
    { value: 'logistics', label: 'Lojistik' },
    { value: 'coordination', label: 'Koordinasyon' },
    { value: 'communication', label: 'İletişim' },
  ];

  const roles = [
    { value: 'field', label: 'Saha Personeli' },
    { value: 'coordinator', label: 'Koordinatör' },
    { value: 'manager', label: 'Yönetici' },
    ...(isAdmin ? [
      { value: 'regional-admin', label: 'Bölge Yöneticisi (Amir)' },
      { value: 'sub-admin', label: 'Alt Admin' }
    ] : [])
  ];

  const regions = [
    { value: 'istanbul', label: 'İstanbul' },
    { value: 'ankara', label: 'Ankara' },
    { value: 'izmir', label: 'İzmir' },
    { value: 'bursa', label: 'Bursa' },
    { value: 'antalya', label: 'Antalya' },
  ];

  // Personel ekleme/düzenleme
  const handleAddPersonnel = () => {
    setEditingPersonnel(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEditPersonnel = (record: any) => {
    setEditingPersonnel(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      department: record.department,
      region: record.region,
      status: record.status,
      avatar: record.avatar ? [
        {
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: record.avatar,
        },
      ] : undefined,
    });
    setDrawerVisible(true);
  };

  const handleSavePersonnel = (values: any) => {
    // Fotoğraf işleme
    let avatarUrl = null;
    if (values.avatar && values.avatar.length > 0) {
      const file = values.avatar[0];
      if (file.originFileObj) {
        // Gerçek uygulamada, burada dosya yükleme API'si çağrılır
        // Şimdilik, Base64 olarak saklayalım
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => {
          avatarUrl = reader.result as string;
          savePersonnelWithAvatar(values, avatarUrl);
        };
        return; // Async işlem için erken dönüş
      } else if (file.url) {
        avatarUrl = file.url;
      }
    }
    
    // Doğrudan kaydet (avatar yoksa veya hazırsa)
    savePersonnelWithAvatar(values, avatarUrl);
  };

  const savePersonnelWithAvatar = (values: any, avatarUrl: string | null) => {
    const newPersonnel: Personnel = {
      id: editingPersonnel ? editingPersonnel.id : Date.now().toString(),
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      department: values.department,
      region: values.region,
      status: values.status,
      avatar: avatarUrl
    };

    if (editingPersonnel) {
      // Mevcut personeli güncelle
      setPersonnelList(personnelList.map(p => 
        p.id === editingPersonnel.id ? newPersonnel : p
      ));
      message.success(`${values.name} bilgileri güncellendi`);
    } else {
      // Yeni personel ekle
      setPersonnelList([...personnelList, newPersonnel]);
      message.success(`${values.name} başarıyla eklendi`);
    }
    
    setDrawerVisible(false);
  };

  const handleDeletePersonnel = (id: string) => {
    setPersonnelList(personnelList.filter(person => person.id !== id));
    message.success('Personel silindi');
  };

  // Excel/PDF indirme işlemleri
  const handleDownloadExcel = () => {
    // Excel oluştur
    const worksheet = XLSX.utils.json_to_sheet(
      personnelList.map(p => ({
        'Ad Soyad': p.name,
        'E-posta': p.email,
        'Telefon': p.phone,
        'Rol': getRoleName(p.role),
        'Departman': getDepartmentName(p.department),
        'Bölge': getRegionName(p.region),
        'Durum': p.status === 'active' ? 'Aktif' : 'Pasif'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personel');
    
    // Dosyayı indir
    XLSX.writeFile(workbook, 'personel-listesi.xlsx');
    message.success('Personel listesi Excel olarak indirildi');
  };

  const handleDownloadPDF = async () => {
    try {
      // AutoTable eklentisini yükle (ilk kullanımda)
      if (!autoTableLoaded) {
        await loadPdfLibraries();
      }
      
      const doc = new jsPDF() as ExtendedJsPDF;
      
      // Başlık ekle
      doc.setFontSize(18);
      doc.text('Personel Listesi', 14, 22);
      
      // Tarih ekle
      doc.setFontSize(11);
      doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);
      
      // Tablo oluştur
      const tableColumn = ['Ad Soyad', 'E-posta', 'Telefon', 'Rol', 'Departman', 'Bölge', 'Durum'];
      const tableRows = personnelList.map(p => [
        p.name,
        p.email,
        p.phone,
        getRoleName(p.role),
        getDepartmentName(p.department),
        getRegionName(p.region),
        p.status === 'active' ? 'Aktif' : 'Pasif'
      ]);
      
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          }
        });
        
        doc.save('personel-listesi.pdf');
        message.success('Personel listesi PDF olarak indirildi');
      } else {
        message.error('PDF tablo fonksiyonu yüklenemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      message.error('PDF oluşturulurken bir hata meydana geldi');
    }
  };

  // Yardımcı fonksiyonlar
  const getRoleName = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getDepartmentName = (deptValue: string) => {
    const dept = departments.find(d => d.value === deptValue);
    return dept ? dept.label : deptValue;
  };

  const getRegionName = (regionValue: string) => {
    const region = regions.find(r => r.value === regionValue);
    return region ? region.label : regionValue;
  };

  // Excel ile toplu kullanıcı yükleme
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    customRequest: ({ file, onSuccess }) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // İlk sayfayı al
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          // JSON'a dönüştür
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            message.error('Excel dosyası boş veya uyumsuz format');
            return;
          }
          
          // Yeni personelleri ekle
          const newPersonnel = jsonData.map((row: any, index: number) => ({
            id: Date.now().toString() + index,
            name: row['Ad Soyad'] || '',
            email: row['E-posta'] || '',
            phone: row['Telefon'] || '',
            role: getRoleValue(row['Rol'] || ''),
            department: getDepartmentValue(row['Departman'] || ''),
            region: getRegionValue(row['Bölge'] || ''),
            status: row['Durum'] === 'Aktif' ? 'active' : 'inactive',
            avatar: null
          }));
          
          setPersonnelList([...personnelList, ...newPersonnel]);
          message.success(`${newPersonnel.length} personel başarıyla eklendi`);
          setUploadModalVisible(false);
          if (onSuccess) onSuccess({});
        } catch (error) {
          console.error('Excel işleme hatası:', error);
          message.error('Excel dosyası işlenirken bir hata oluştu');
        }
      };
      reader.readAsArrayBuffer(file as Blob);
    },
    onDrop(e) {
      console.log('Bırakılan dosyalar', e.dataTransfer.files);
    },
  };

  // Tersine değer çevirme (isim -> değer)
  const getRoleValue = (roleName: string) => {
    const role = roles.find(r => r.label === roleName);
    return role ? role.value : 'field'; // Varsayılan değer
  };

  const getDepartmentValue = (deptName: string) => {
    const dept = departments.find(d => d.label === deptName);
    return dept ? dept.value : 'search-rescue'; // Varsayılan değer
  };

  const getRegionValue = (regionName: string) => {
    const region = regions.find(r => r.label === regionName);
    return region ? region.value : 'istanbul'; // Varsayılan değer
  };

  // Excel şablonu indirme
  const handleDownloadTemplate = () => {
    const template = [
      {
        'Ad Soyad': 'Örnek Personel',
        'E-posta': 'ornek@example.com',
        'Telefon': '0555-123-4567',
        'Rol': 'Saha Personeli',
        'Departman': 'Arama Kurtarma',
        'Bölge': 'İstanbul',
        'Durum': 'Aktif'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Şablon');
    
    XLSX.writeFile(workbook, 'personel-sablon.xlsx');
    message.success('Personel şablonu indirildi');
  };

  // Filtreleme işlemi
  const filteredData = personnelList.filter(person => 
    person.name.toLowerCase().includes(searchText.toLowerCase()) ||
    person.email.toLowerCase().includes(searchText.toLowerCase()) ||
    person.phone.includes(searchText)
  );

  // Tablo sütunları
  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center">
          {record.avatar ? (
            <Avatar src={record.avatar} className="mr-2" />
          ) : (
            <UserOutlined className="mr-2" />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = '';
        let label = '';
        
        switch(role) {
          case 'field':
            color = 'blue';
            label = 'Saha Personeli';
            break;
          case 'coordinator':
            color = 'purple';
            label = 'Koordinatör';
            break;
          case 'manager':
            color = 'red';
            label = 'Yönetici';
            break;
          case 'regional-admin':
            color = 'gold';
            label = 'Bölge Yöneticisi (Amir)';
            break;
          case 'sub-admin':
            color = 'magenta';
            label = 'Alt Admin';
            break;
        }
        
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => {
        const dept = departments.find(d => d.value === department);
        return dept ? dept.label : department;
      },
    },
    {
      title: 'Bölge',
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => {
        const reg = regions.find(r => r.value === region);
        return reg ? reg.label : region;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return status === 'active' ? 
          <Tag color="green">Aktif</Tag> : 
          <Tag color="red">Pasif</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditPersonnel(record)} 
              type="text"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Bu personeli silmek istediğinize emin misiniz?"
              onConfirm={() => handleDeletePersonnel(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="E-posta Gönder">
            <Button 
              icon={<MailOutlined />} 
              type="text"
              onClick={() => message.info(`${record.name} kişisine e-posta gönderiliyor...`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Resim yükleme işlemleri
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Personel Yönetimi</Title>
          <Text type="secondary">
            Sisteme kayıtlı personelleri görüntüleyebilir ve yönetebilirsiniz
          </Text>
        </div>
        <Space>
          <Tooltip title="Excel Olarak İndir">
            <Button 
              icon={<FileExcelOutlined />} 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleDownloadExcel}
            >
              Excel İndir
            </Button>
          </Tooltip>
          <Tooltip title="PDF Olarak İndir">
            <Button 
              icon={<FilePdfOutlined />} 
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDownloadPDF}
            >
              PDF İndir
            </Button>
          </Tooltip>
          <Tooltip title="Excel İle Toplu Personel Ekle">
            <Button 
              icon={<UploadOutlined />} 
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => setUploadModalVisible(true)}
            >
              Toplu Ekle
            </Button>
          </Tooltip>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddPersonnel}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Personel Ekle
          </Button>
        </Space>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Personel"
              value={personnelList.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aktif Personel"
              value={personnelList.filter(p => p.status === 'active').length}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saha Personeli"
              value={personnelList.filter(p => p.role === 'field').length}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yönetici Sayısı"
              value={personnelList.filter(p => p.role === 'manager').length}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Arama filtresi */}
      <div className="mb-4">
        <Input
          placeholder="Personel Ara (Ad, E-posta, Telefon)"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      {/* Personel tablosu */}
      <div ref={tableRef}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Personel ekleme/düzenleme çekmecesi */}
      <Drawer
        title={editingPersonnel ? "Personel Düzenle" : "Yeni Personel Ekle"}
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>İptal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              className="bg-blue-600"
            >
              Kaydet
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePersonnel}
        >
          <div className="mb-6 text-center">
            <Form.Item
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              label="Personel Fotoğrafı"
            >
              <Upload
                name="avatar"
                listType="picture-card"
                maxCount={1}
                onPreview={handlePreview}
                beforeUpload={() => false}
                accept="image/*"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Fotoğraf Yükle</div>
                </div>
              </Upload>
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Lütfen ad soyad girin' }]}
          >
            <Input placeholder="Ad Soyad" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'Lütfen e-posta girin' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
            ]}
          >
            <Input placeholder="E-posta" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Telefon"
            rules={[{ required: true, message: 'Lütfen telefon girin' }]}
          >
            <Input placeholder="Telefon" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true, message: 'Lütfen rol seçin' }]}
              >
                <Select placeholder="Rol seçin">
                  {roles.map(role => (
                    <Option key={role.value} value={role.value}>{role.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Departman"
                rules={[{ required: true, message: 'Lütfen departman seçin' }]}
              >
                <Select placeholder="Departman seçin">
                  {departments.map(dept => (
                    <Option key={dept.value} value={dept.value}>{dept.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="region"
                label="Bölge"
                rules={[{ required: true, message: 'Lütfen bölge seçin' }]}
              >
                <Select placeholder="Bölge seçin">
                  {regions.map(region => (
                    <Option key={region.value} value={region.value}>{region.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: 'Lütfen durum seçin' }]}
              >
                <Select placeholder="Durum seçin">
                  <Option value="active">Aktif</Option>
                  <Option value="inactive">Pasif</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      
      {/* Resim önizleme modalı */}
      <Modal
        open={previewVisible}
        title="Fotoğraf Önizleme"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Personel Fotoğrafı" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      
      {/* Excel ile Toplu Personel Yükleme Modalı */}
      <Modal
        title="Excel ile Toplu Personel Ekle"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setUploadModalVisible(false)}>
            İptal
          </Button>,
          <Button 
            key="download" 
            icon={<DownloadOutlined />} 
            type="dashed"
            onClick={handleDownloadTemplate}
          >
            Şablon İndir
          </Button>
        ]}
        width={600}
      >
        <div className="my-6">
          <Title level={5} className="mb-2">Talimatlar:</Title>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>Şablon olarak hazırlanmış Excel dosyasını indirin</li>
            <li>Eklemek istediğiniz personel bilgilerini şablona göre doldurun</li>
            <li>Doldurduğunuz Excel dosyasını yükleyin</li>
            <li>Sistem otomatik olarak personel bilgilerini işleyecektir</li>
          </ul>
          
          <Dragger {...uploadProps} className="mt-4">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Excel dosyasını yüklemek için tıklayın veya sürükleyin</p>
            <p className="ant-upload-hint">
              Yalnızca .xlsx ve .xls dosya formatları desteklenmektedir
            </p>
          </Dragger>
        </div>
      </Modal>
    </div>
  );
} 