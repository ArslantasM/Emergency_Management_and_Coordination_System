'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Divider, 
  InputNumber,
  DatePicker,
  Alert,
  Tabs,
  Tag,
  Statistic
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  BankOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CampDetailData {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  description?: string;
  
  // Yeni detay alanları
  isGrantFunded?: boolean;
  hasWaterTreatment?: boolean;
  wasteCapacity?: number;
  livingAreaCount?: number;
  serviceAreaCount?: number;
  recreationAreaCount?: number;
  
  // Altyapı
  hasElectricity?: boolean;
  hasSewerage?: boolean;
  hasInternet?: boolean;
  
  // Bakanlık Hizmetleri
  hasHealthMinistryServices?: boolean;
  hasFamilyMinistryServices?: boolean;
  hasHealthCenter?: boolean;
  hasTraumaCenter?: boolean;
  hasPharmacy?: boolean;
  hasSocialServiceCenter?: boolean;
  hasEducationServices?: boolean;
  
  // Diğer
  establishedDate?: string;
  notes?: string;
}

const ContainerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const campId = params.id as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [campData, setCampData] = useState<CampDetailData | null>(null);

  // Kent verilerini yükle
  const loadCampData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/containers/${campId}`);
      const result = await response.json();
      
      if (result.success) {
        setCampData(result.data);
        // Form alanlarını doldur
        form.setFieldsValue({
          ...result.data,
          establishedDate: result.data.establishedDate ? dayjs(result.data.establishedDate) : null
        });
      } else {
        console.error('Kent verisi yüklenemedi:', result.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campId) {
      loadCampData();
    }
  }, [campId]);

  // Form gönderme
  const onFinish = async (values: any) => {
    try {
      setSaving(true);
      
      const formData = {
        ...values,
        establishedDate: values.establishedDate ? values.establishedDate.format('YYYY-MM-DD') : null
      };

      const response = await fetch(`/api/containers/${campId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Kent başarıyla güncellendi');
        // Verileri yeniden yükle
        loadCampData();
      } else {
        console.error('❌ Kent güncelleme hatası:', result.error);
      }
    } catch (error) {
      console.error('❌ API çağrısı hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card loading={true}>
          <div style={{ height: '400px' }} />
        </Card>
      </div>
    );
  }

  if (!campData) {
    return (
      <div className="p-6">
        <Alert
          message="Kent Bulunamadı"
          description="Belirtilen kent bulunamadı veya erişim izniniz yok."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/dashboard/container/list')}>
              Kent Listesine Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/dashboard/container/list')}
          >
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {campData.name} - Detay Bilgileri
          </Title>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={() => form.submit()}
          loading={saving}
          size="large"
        >
          Değişiklikleri Kaydet
        </Button>
      </div>

      {/* Özet Bilgiler */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Kent Tipi"
              value={campData.type === 'CONTAINER' ? 'Konteyner' : campData.type === 'TENT' ? 'Çadır' : 'Karma'}
              prefix={campData.type === 'CONTAINER' ? '🏠' : campData.type === 'TENT' ? '⛺' : '🏘️'}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Doluluk Oranı"
              value={Math.round((campData.currentOccupancy / campData.capacity) * 100)}
              suffix="%"
              prefix="👥"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Mevcut/Kapasite"
              value={`${campData.currentOccupancy}/${campData.capacity}`}
              prefix="🏠"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tag 
              color={campData.status === 'ACTIVE' ? 'green' : 'orange'}
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              {campData.status === 'ACTIVE' ? '✅ Aktif' : '⚠️ Pasif'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Detay Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={campData}
      >
        <Tabs 
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: <span><HomeOutlined /> Temel Bilgiler</span>,
              children: (
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Kent Adı"
                        rules={[{ required: true, message: 'Kent adı gereklidir' }]}
                      >
                        <Input placeholder="Kent adını girin" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="type"
                        label="Kent Tipi"
                        rules={[{ required: true, message: 'Kent tipi gereklidir' }]}
                      >
                        <Select placeholder="Kent tipi seçin">
                          <Option value="CONTAINER">🏠 Konteyner Kent</Option>
                          <Option value="TENT">⛺ Çadır Kent</Option>
                          <Option value="MIXED">🏘️ Karma Kent</Option>
                          <Option value="OTHER">🏕️ Diğer Kent</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="capacity"
                        label="Toplam Kapasite"
                        rules={[{ required: true, message: 'Kapasite gereklidir' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Kişi kapasitesi"
                          min={1}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="currentOccupancy"
                        label="Mevcut Doluluk"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Mevcut kişi sayısı"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="establishedDate"
                        label="Kuruluş Tarihi"
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="status"
                        label="Durum"
                      >
                        <Select placeholder="Durum seçin">
                          <Option value="ACTIVE">✅ Aktif</Option>
                          <Option value="INACTIVE">❌ Pasif</Option>
                          <Option value="MAINTENANCE">🔧 Bakımda</Option>
                          <Option value="CLOSED">🚫 Kapalı</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name="location"
                        label="Konum"
                      >
                        <Input placeholder="Kent konumu" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name="description"
                        label="Açıklama"
                      >
                        <TextArea rows={4} placeholder="Kent hakkında açıklama" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'infrastructure',
              label: <span><ToolOutlined /> Altyapı</span>,
              children: (
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Divider orientation="left">💰 Finansman Bilgileri</Divider>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="isGrantFunded"
                        label="Hibe ile Finanse Ediliyor mu?"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Evet" 
                          unCheckedChildren="Hayır" 
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24}>
                      <Divider orientation="left">🔧 Altyapı Sistemleri</Divider>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasWaterTreatment"
                        label="Su Arıtma Sistemi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasElectricity"
                        label="Elektrik Sistemi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasSewerage"
                        label="Kanalizasyon Sistemi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hasInternet"
                        label="İnternet Bağlantısı"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="wasteCapacity"
                        label="Atık Kapasitesi (ton/gün)"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Günlük atık kapasitesi"
                          min={0}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'areas',
              label: <span><EnvironmentOutlined /> Alanlar</span>,
              children: (
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Divider orientation="left">🏠 Alan Dağılımı</Divider>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="livingAreaCount"
                        label="Yaşam Alanı Sayısı"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Yaşam alanı sayısı"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="serviceAreaCount"
                        label="Hizmet Alanı Sayısı"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Hizmet alanı sayısı"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="recreationAreaCount"
                        label="Rekreasyon Alanı Sayısı"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Rekreasyon alanı sayısı"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'services',
              label: <span><MedicineBoxOutlined /> Bakanlık Hizmetleri</span>,
              children: (
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Divider orientation="left">🏥 Sağlık Bakanlığı Hizmetleri</Divider>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasHealthMinistryServices"
                        label="Sağlık Bakanlığı Hizmetleri"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasHealthCenter"
                        label="Sağlık Merkezi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasTraumaCenter"
                        label="Travma/Psikolojik Destek Merkezi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasPharmacy"
                        label="Eczane"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24}>
                      <Divider orientation="left">👨‍👩‍👧‍👦 Aile ve Sosyal Politikalar Bakanlığı</Divider>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasFamilyMinistryServices"
                        label="Aile ve Sosyal Politikalar Hizmetleri"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasSocialServiceCenter"
                        label="Sosyal Hizmet Merkezi"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="hasEducationServices"
                        label="Eğitim Hizmetleri"
                        valuePropName="checked"
                      >
                        <Switch 
                          checkedChildren="Var" 
                          unCheckedChildren="Yok" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'notes',
              label: <span><SettingOutlined /> Notlar</span>,
              children: (
                <Card>
                  <Form.Item
                    name="notes"
                    label="Ek Notlar ve Açıklamalar"
                  >
                    <TextArea 
                      rows={8} 
                      placeholder="Kent hakkında ek bilgiler, notlar ve açıklamalar..."
                    />
                  </Form.Item>
                </Card>
              )
            }
          ]}
        />

        {/* Kaydet Butonu */}
        <div className="mt-6 text-center">
          <Space size="large">
            <Button 
              size="large"
              onClick={() => router.push('/dashboard/container/list')}
            >
              İptal
            </Button>
            <Button 
              type="primary" 
              size="large"
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
            >
              Değişiklikleri Kaydet
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ContainerDetailPage;
