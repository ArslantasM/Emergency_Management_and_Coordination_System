"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Card, 
  Typography, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Select,
  Drawer,
  Form,
  DatePicker,
  Switch,
  InputNumber,
  Upload,
  Avatar,
  Modal,
  App
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  TeamOutlined,
  UserOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  HomeOutlined,
  CalendarOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Personnel {
  id: string;
  name: string;
  surname: string;
  tcNo: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'onLeave' | 'terminated';
  startDate: string;
  endDate?: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  shift: 'day' | 'night' | 'rotating';
  salary: number;
  workingHours: {
    start: string;
    end: string;
  };
  skills: string[];
  certifications: string[];
  notes?: string;
  photo?: string;
  birthDate: string;
  bloodType?: string;
  isActive: boolean;
}

const PersonnelPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  // Örnek istatistik verileri
  const stats = {
    totalPersonnel: 120,
    activePersonnel: 112,
    onLeave: 8,
    departments: 6,
  };

  // Örnek personel verileri - genişletilmiş
  const personnelData: Personnel[] = [
    {
      id: '1',
      name: 'Ahmet',
      surname: 'Yılmaz',
      tcNo: '12345678901',
      department: 'Sağlık',
      position: 'Sağlık Görevlisi',
      status: 'active',
      startDate: '2025-01-15',
      phone: '0555-111-2233',
      email: 'ahmet.yilmaz@mail.com',
      address: 'İstanbul, Türkiye',
      emergencyContact: {
        name: 'Fatma Yılmaz',
        phone: '0555-111-2234',
        relation: 'Eş'
      },
      shift: 'day',
      salary: 15000,
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      skills: ['İlk Yardım', 'Hasta Bakımı'],
      certifications: ['İlk Yardım Sertifikası'],
      birthDate: '1985-05-15',
      bloodType: 'A+',
      isActive: true
    },
    {
      id: '2',
      name: 'Ayşe',
      surname: 'Demir',
      tcNo: '12345678902',
      department: 'Güvenlik',
      position: 'Güvenlik Amiri',
      status: 'onLeave',
      startDate: '2025-02-01',
      phone: '0555-222-3344',
      email: 'ayse.demir@mail.com',
      address: 'Ankara, Türkiye',
      emergencyContact: {
        name: 'Mehmet Demir',
        phone: '0555-222-3345',
        relation: 'Eş'
      },
      shift: 'night',
      salary: 18000,
      workingHours: {
        start: '20:00',
        end: '08:00'
      },
      skills: ['Güvenlik', 'Kriz Yönetimi'],
      certifications: ['Güvenlik Sertifikası', 'Silah Ruhsatı'],
      birthDate: '1982-08-20',
      bloodType: 'B+',
      isActive: true
    }
  ];

  const departments = [
    'Sağlık',
    'Güvenlik',
    'Temizlik',
    'Yönetim',
    'Teknik',
    'Sosyal Hizmetler',
    'Lojistik',
    'İletişim'
  ];

  const positions = {
    'Sağlık': ['Doktor', 'Hemşire', 'Sağlık Görevlisi', 'Sağlık Teknisyeni'],
    'Güvenlik': ['Güvenlik Amiri', 'Güvenlik Görevlisi', 'Güvenlik Teknisyeni'],
    'Temizlik': ['Temizlik Amiri', 'Temizlik Görevlisi'],
    'Yönetim': ['Müdür', 'Müdür Yardımcısı', 'Koordinatör', 'Uzman'],
    'Teknik': ['Teknik Şef', 'Tekniker', 'Elektrikçi', 'Tesisatçı'],
    'Sosyal Hizmetler': ['Sosyal Hizmet Uzmanı', 'Psikolog', 'Rehber Öğretmen'],
    'Lojistik': ['Lojistik Uzmanı', 'Depo Sorumlusu', 'Nakliye Görevlisi'],
    'İletişim': ['İletişim Uzmanı', 'Tercüman', 'Bilgi İşlem Uzmanı']
  };

  const shifts = [
    { value: 'day', label: 'Gündüz (08:00-17:00)' },
    { value: 'night', label: 'Gece (20:00-08:00)' },
    { value: 'rotating', label: 'Dönüşümlü' }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

  const handleAddPersonnel = () => {
    form.resetFields();
    setEditingPersonnel(null);
    setFileList([]);
    setDrawerVisible(true);
  };

  const handleEditPersonnel = (personnel: Personnel) => {
    form.setFieldsValue({
      ...personnel,
      startDate: dayjs(personnel.startDate),
      endDate: personnel.endDate ? dayjs(personnel.endDate) : undefined,
      birthDate: dayjs(personnel.birthDate),
      emergencyContactName: personnel.emergencyContact.name,
      emergencyContactPhone: personnel.emergencyContact.phone,
      emergencyContactRelation: personnel.emergencyContact.relation,
      workingHoursStart: personnel.workingHours.start,
      workingHoursEnd: personnel.workingHours.end
    });
    setEditingPersonnel(personnel);
    setFileList(personnel.photo ? [{ uid: '-1', name: 'photo.jpg', status: 'done', url: personnel.photo }] : []);
    setDrawerVisible(true);
  };

  const handleDeletePersonnel = (personnel: Personnel) => {
    Modal.confirm({
      title: 'Personeli Sil',
      content: `${personnel.name} ${personnel.surname} adlı personeli silmek istediğinizden emin misiniz?`,
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: () => {
        // API çağrısı yapılacak
        notification.success({ message: 'Personel başarıyla silindi' });
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const personnelData: Partial<Personnel> = {
        name: values.name,
        surname: values.surname,
        tcNo: values.tcNo,
        department: values.department,
        position: values.position,
        status: values.status,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        phone: values.phone,
        email: values.email,
        address: values.address,
        emergencyContact: {
          name: values.emergencyContactName,
          phone: values.emergencyContactPhone,
          relation: values.emergencyContactRelation
        },
        shift: values.shift,
        salary: values.salary,
        workingHours: {
          start: values.workingHoursStart,
          end: values.workingHoursEnd
        },
        skills: values.skills || [],
        certifications: values.certifications || [],
        notes: values.notes,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
        bloodType: values.bloodType,
        isActive: values.isActive
      };

      if (editingPersonnel) {
        // API çağrısı - güncelleme
        notification.success({ message: 'Personel başarıyla güncellendi' });
      } else {
        // API çağrısı - ekleme
        notification.success({ message: 'Personel başarıyla eklendi' });
      }

      setDrawerVisible(false);
      // Veri listesini yenile
    } catch (error) {
      notification.error({ message: 'Personel kaydedilirken bir hata oluştu' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'onLeave': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'onLeave': return 'İzinli';
      case 'terminated': return 'İşten Çıkmış';
      default: return status;
    }
  };

  const getShiftText = (shift: string) => {
    switch (shift) {
      case 'day': return 'Gündüz';
      case 'night': return 'Gece';
      case 'rotating': return 'Dönüşümlü';
      default: return shift;
    }
  };

  const columns = [
    {
      title: 'Fotoğraf',
      key: 'photo',
      width: 80,
      render: (_: any, record: Personnel) => (
        <Avatar 
          size={40} 
          icon={<UserOutlined />} 
          src={record.photo}
        />
      ),
    },
    {
      title: 'Ad Soyad',
      key: 'fullName',
      filteredValue: [searchText],
      onFilter: (value: string, record: Personnel) =>
        `${record.name} ${record.surname}`.toLowerCase().includes(value.toLowerCase()),
      render: (_: any, record: Personnel) => (
        <div>
          <div className="font-medium">{record.name} {record.surname}</div>
          <div className="text-gray-500 text-sm">{record.tcNo}</div>
        </div>
      ),
    },
    {
      title: 'Departman/Pozisyon',
      key: 'departmentPosition',
      filteredValue: filterDepartment ? [filterDepartment] : null,
      onFilter: (value: string, record: Personnel) =>
        record.department === value,
      render: (_: any, record: Personnel) => (
        <div>
          <Tag color="blue">{record.department}</Tag>
          <div className="text-sm text-gray-600 mt-1">{record.position}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filteredValue: filterStatus ? [filterStatus] : null,
      onFilter: (value: string, record: Personnel) =>
        record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Vardiya',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: string, record: Personnel) => (
        <div>
          <Tag color={shift === 'day' ? 'orange' : shift === 'night' ? 'purple' : 'blue'}>
            {getShiftText(shift)}
          </Tag>
          <div className="text-xs text-gray-500">
            {record.workingHours.start} - {record.workingHours.end}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_: any, record: Personnel) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <PhoneOutlined className="text-gray-400" />
            {record.phone}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MailOutlined className="text-gray-400" />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Maaş',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary: number) => (
        <span className="font-medium">₺{salary.toLocaleString()}</span>
      ),
    },
    {
      title: 'Başlangıç Tarihi',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_: any, record: Personnel) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<UserOutlined />}
            onClick={() => router.push(`/dashboard/container/personnel/${record.id}`)}
            className="hover:text-blue-600"
          >
            Detay
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditPersonnel(record)}
            className="hover:text-green-600"
          >
            Düzenle
          </Button>
          <Button 
            type="link" 
            icon={<ScheduleOutlined />}
            onClick={() => router.push(`/dashboard/container/personnel/${record.id}/schedule`)}
            className="hover:text-purple-600"
          >
            Vardiya
          </Button>
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePersonnel(record)}
            className="hover:text-red-600"
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Kent Personeli</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPersonnel}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            Yeni Personel Ekle
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Toplam Personel"
                value={stats.totalPersonnel}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Aktif Personel"
                value={stats.activePersonnel}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="İzinli Personel"
                value={stats.onLeave}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Departman Sayısı"
                value={stats.departments}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtre ve Arama */}
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Personel Ara (Ad, Soyad, TC No)..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Departman Filtrele"
            allowClear
            onChange={(value) => setFilterDepartment(value)}
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
          <Select
            style={{ width: 150 }}
            placeholder="Durum Filtrele"
            allowClear
            onChange={(value) => setFilterStatus(value)}
          >
            <Option value="active">Aktif</Option>
            <Option value="inactive">Pasif</Option>
            <Option value="onLeave">İzinli</Option>
            <Option value="terminated">İşten Çıkmış</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={personnelData}
          rowKey="id"
          pagination={{
            total: personnelData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} personel`,
          }}
          className="bg-white rounded-lg shadow"
        />
      </Card>

      {/* Yeni Personel Ekleme/Düzenleme Drawer */}
      <Drawer
        title={editingPersonnel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
          initialValues={{
            status: 'active',
            shift: 'day',
            isActive: true,
            workingHoursStart: '08:00',
            workingHoursEnd: '17:00'
          }}
        >
          {/* Kişisel Bilgiler */}
          <Card title="Kişisel Bilgiler" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Ad"
                  rules={[{ required: true, message: 'Ad gerekli!' }]}
                >
                  <Input placeholder="Adını girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="surname"
                  label="Soyad"
                  rules={[{ required: true, message: 'Soyad gerekli!' }]}
                >
                  <Input placeholder="Soyadını girin" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tcNo"
                  label="TC Kimlik No"
                  rules={[
                    { required: true, message: 'TC Kimlik No gerekli!' },
                    { len: 11, message: 'TC Kimlik No 11 haneli olmalıdır!' }
                  ]}
                >
                  <Input placeholder="TC Kimlik No" maxLength={11} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="birthDate"
                  label="Doğum Tarihi"
                  rules={[{ required: true, message: 'Doğum tarihi gerekli!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="bloodType"
                  label="Kan Grubu"
                >
                  <Select placeholder="Kan grubu seçin">
                    {bloodTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="photo"
                  label="Fotoğraf"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                  >
                    {fileList.length >= 1 ? null : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Yükle</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* İş Bilgileri */}
          <Card title="İş Bilgileri" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label="Departman"
                  rules={[{ required: true, message: 'Departman gerekli!' }]}
                >
                  <Select 
                    placeholder="Departman seçin"
                    onChange={() => form.setFieldValue('position', undefined)}
                  >
                    {departments.map(dept => (
                      <Option key={dept} value={dept}>{dept}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="position"
                  label="Pozisyon"
                  rules={[{ required: true, message: 'Pozisyon gerekli!' }]}
                  dependencies={['department']}
                >
                  <Select 
                    placeholder="Pozisyon seçin"
                    disabled={!form.getFieldValue('department')}
                  >
                    {form.getFieldValue('department') && 
                      positions[form.getFieldValue('department') as keyof typeof positions]?.map(pos => (
                        <Option key={pos} value={pos}>{pos}</Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Durum"
                  rules={[{ required: true, message: 'Durum gerekli!' }]}
                >
                  <Select>
                    <Option value="active">Aktif</Option>
                    <Option value="inactive">Pasif</Option>
                    <Option value="onLeave">İzinli</Option>
                    <Option value="terminated">İşten Çıkmış</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="shift"
                  label="Vardiya"
                  rules={[{ required: true, message: 'Vardiya gerekli!' }]}
                >
                  <Select>
                    {shifts.map(shift => (
                      <Option key={shift.value} value={shift.value}>
                        {shift.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="salary"
                  label="Maaş (₺)"
                  rules={[{ required: true, message: 'Maaş gerekli!' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }}
                    placeholder="Maaş miktarı"
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="startDate"
                  label="İşe Başlama Tarihi"
                  rules={[{ required: true, message: 'İşe başlama tarihi gerekli!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="workingHoursStart"
                  label="Mesai Başlangıç"
                >
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="workingHoursEnd"
                  label="Mesai Bitiş"
                >
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* İletişim Bilgileri */}
          <Card title="İletişim Bilgileri" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                  rules={[{ required: true, message: 'Telefon gerekli!' }]}
                >
                  <Input placeholder="0555-123-4567" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'E-posta gerekli!' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
                  ]}
                >
                  <Input placeholder="ornek@mail.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Adres"
              rules={[{ required: true, message: 'Adres gerekli!' }]}
            >
              <TextArea rows={2} placeholder="Tam adres bilgisi" />
            </Form.Item>
          </Card>

          {/* Acil Durum İletişim */}
          <Card title="Acil Durum İletişim" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="emergencyContactName"
                  label="Acil Durum Kişisi"
                  rules={[{ required: true, message: 'Acil durum kişisi gerekli!' }]}
                >
                  <Input placeholder="Ad Soyad" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="emergencyContactPhone"
                  label="Acil Durum Telefon"
                  rules={[{ required: true, message: 'Acil durum telefonu gerekli!' }]}
                >
                  <Input placeholder="0555-123-4567" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="emergencyContactRelation"
                  label="Yakınlık Derecesi"
                  rules={[{ required: true, message: 'Yakınlık derecesi gerekli!' }]}
                >
                  <Select placeholder="Yakınlık derecesi">
                    <Option value="Eş">Eş</Option>
                    <Option value="Anne">Anne</Option>
                    <Option value="Baba">Baba</Option>
                    <Option value="Kardeş">Kardeş</Option>
                    <Option value="Çocuk">Çocuk</Option>
                    <Option value="Diğer">Diğer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Beceriler ve Sertifikalar */}
          <Card title="Beceriler ve Sertifikalar" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="skills"
                  label="Beceriler"
                >
                  <Select
                    mode="tags"
                    placeholder="Beceriler ekleyin"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="certifications"
                  label="Sertifikalar"
                >
                  <Select
                    mode="tags"
                    placeholder="Sertifikalar ekleyin"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notlar"
            >
              <TextArea rows={3} placeholder="Ek notlar..." />
            </Form.Item>
          </Card>

          {/* Aktif Durum */}
          <Form.Item
            name="isActive"
            label="Aktif Durum"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={() => setDrawerVisible(false)}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit">
              {editingPersonnel ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default PersonnelPage; 