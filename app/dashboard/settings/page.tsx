"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tabs, 
  Radio, 
  Select,
  Switch, 
  Slider, 
  Button, 
  Space, 
  Divider, 
  Input, 
  Spin,
  Avatar,
  Alert,
  message,
  Form,
  Collapse,
  List,
  Tag,
  Checkbox,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  SettingOutlined, 
  UserOutlined, 
  VideoCameraOutlined, 
  AudioOutlined, 
  BellOutlined, 
  EnvironmentOutlined,
  VideoCameraAddOutlined,
  AudioMutedOutlined,
  SoundOutlined,
  SaveOutlined,
  GlobalOutlined,
  CompassOutlined,
  ToolOutlined,
  NotificationOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

const SettingsPage = () => {
  const { data: session, status } = useSession();
  
  // Form nesnelerini tanımlama
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  
  // Kaydetme durumlarını izleme
  const [generalSaving, setGeneralSaving] = useState(false);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  
  // Form için başlangıç değerleri
  const generalSettings = {
    systemName: 'Acil Durum Yönetim Sistemi',
    shortName: 'ADYS',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    category: 'emergency',
    dashboardLayout: 'detailed',
    defaultSort: 'date-desc',
    recordsPerPage: '25',
    mapType: 'streets',
    theme: 'light'
  };
  
  const notificationSettings = {
    enabledChannels: ['browser'],
    smsPhone: '',
    emailAddress: '',
    notificationTypes: ['emergencyAlert', 'taskAssigned'],
    priorityThreshold: 'medium'
  };
  
  const securitySettings = {
    sessionTimeout: '60',
    twoFactorAuth: false,
    secureLogout: true,
    failedLoginThreshold: '5',
    dataBackup: true,
    backupFrequency: 'daily',
    dataEncryption: true,
    auditLogs: true,
    ipRestriction: false,
    allowedIPs: '',
    passwordExpiry: 90,
    minPasswordLength: 8,
    passwordComplexity: 'medium',
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventPasswordReuse: true
  };
  
  // Form gönderim işleyicileri
  const handleGeneralSettingsSave = (values: Record<string, any>) => {
    setGeneralSaving(true);
    // API'ye gönderilecek ayarlar burada işlenecek
    setTimeout(() => {
      setGeneralSaving(false);
      message.success('Genel ayarlar başarıyla kaydedildi');
    }, 1000);
  };
  
  const handleNotificationSettingsSave = (values: Record<string, any>) => {
    setNotificationSaving(true);
    // API'ye gönderilecek ayarlar burada işlenecek
    setTimeout(() => {
      setNotificationSaving(false);
      message.success('Bildirim ayarları başarıyla kaydedildi');
    }, 1000);
  };
  
  const handleSecuritySettingsSave = (values: Record<string, any>) => {
    setSecuritySaving(true);
    // API'ye gönderilecek ayarlar burada işlenecek
    setTimeout(() => {
      setSecuritySaving(false);
      message.success('Güvenlik ayarları başarıyla kaydedildi');
    }, 1000);
  };
  
  // Genel ayarlar
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('tr');
  const [timezone, setTimezone] = useState('Europe/Istanbul');
  
  // Kamera ve ses ayarları
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(75);
  const [defaultVideoDevice, setDefaultVideoDevice] = useState('default');
  const [defaultAudioDevice, setDefaultAudioDevice] = useState('default');
  
  // Harita ayarları
  const [defaultMapProvider, setDefaultMapProvider] = useState('mapbox');
  const [mapStyle, setMapStyle] = useState('streets');
  const [defaultZoomLevel, setDefaultZoomLevel] = useState(10);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [drawingColor, setDrawingColor] = useState('red');
  const [showToolsInFullscreen, setShowToolsInFullscreen] = useState(true);
  
  // Bildirim ayarları
  const [enableSoundNotifications, setEnableSoundNotifications] = useState(true);
  const [showSystemMessages, setShowSystemMessages] = useState(true);
  const [showUserConnectionNotifications, setShowUserConnectionNotifications] = useState(true);
  const [notificationDuration, setNotificationDuration] = useState(3);
  const [notificationPriority, setNotificationPriority] = useState('all');
  const [emergencyAlertsEnabled, setEmergencyAlertsEnabled] = useState(true);
  
  const [loading, setLoading] = useState(false);
  
  // Kullanıcı rolünü kontrol etme
  const isAdmin = session?.user?.role === 'admin';
  
  const saveSettings = () => {
    setLoading(true);
    // Normalde API'ye gönderilecek ayarlar
    // Örnek olarak bir süre bekletiyoruz
    setTimeout(() => {
      setLoading(false);
      message.success('Ayarlar başarıyla kaydedildi');
    }, 1000);
  };
  
  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '20px' }}>Yükleniyor...</div>
        </Spin>
      </div>
    );
  }
  
  // Admin olmayan kullanıcılar için sadece kişisel ayarlar gösteriliyor
  if (!isAdmin) {
    return (
      <div className="settings-page">
        <Title level={2}>Kullanıcı Ayarları</Title>
        <Divider />

        <Tabs defaultActiveKey="personal" type="card" items={[
          {
            key: 'personal',
            label: <span><UserOutlined /> Kişisel Ayarlar</span>,
            children: (
              <Card>
                <div style={{ marginBottom: 24 }}>
                  <Title level={4}>Görünüm Ayarları</Title>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <div>
                      <Text strong>Tema:</Text>
                      <Radio.Group 
                        value={darkMode ? 'dark' : 'light'}
                        onChange={(e) => setDarkMode(e.target.value === 'dark')}
                        style={{ marginLeft: 16 }}
                      >
                        <Radio.Button value="light">Açık Tema</Radio.Button>
                        <Radio.Button value="dark">Koyu Tema</Radio.Button>
                      </Radio.Group>
                    </div>
                    
                    <div>
                      <Text strong>Dil:</Text>
                      <Select 
                        value={language}
                        onChange={setLanguage}
                        style={{ width: 160, marginLeft: 16 }}
                      >
                        <Option value="tr">Türkçe</Option>
                        <Option value="en">English</Option>
                      </Select>
                    </div>
                  </Space>
                  
                  <Title level={4}>Harita Ayarları</Title>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <div>
                      <Text strong>Varsayılan Harita Stili:</Text>
                      <Select 
                        value={mapStyle}
                        onChange={setMapStyle}
                        style={{ width: 180, marginLeft: 16 }}
                      >
                        <Option value="streets">Sokak Haritası</Option>
                        <Option value="satellite">Uydu Görüntüsü</Option>
                        <Option value="terrain">Arazi Haritası</Option>
                        <Option value="dark">Karanlık Harita</Option>
                        <Option value="light">Açık Harita</Option>
                      </Select>
                    </div>
                    
                    <div>
                      <Text strong>Varsayılan Zoom Seviyesi:</Text>
                      <Slider
                        min={1}
                        max={20}
                        value={defaultZoomLevel}
                        onChange={setDefaultZoomLevel}
                        style={{ width: 200, marginLeft: 16, display: 'inline-block' }}
                      />
                      <Text style={{ marginLeft: 8 }}>{defaultZoomLevel}</Text>
                    </div>
                    
                    <div>
                      <Text strong>Ölçüm Araçlarını Göster:</Text>
                      <Switch
                        checked={showMeasurements}
                        onChange={setShowMeasurements}
                        style={{ marginLeft: 16 }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>Çizim Rengi:</Text>
                      <Select
                        value={drawingColor}
                        onChange={setDrawingColor}
                        style={{ width: 120, marginLeft: 16 }}
                      >
                        <Option value="red">Kırmızı</Option>
                        <Option value="blue">Mavi</Option>
                        <Option value="green">Yeşil</Option>
                        <Option value="yellow">Sarı</Option>
                        <Option value="purple">Mor</Option>
                      </Select>
                    </div>
                  </Space>
                </div>
                
                <Button type="primary" onClick={saveSettings} loading={loading} icon={<SaveOutlined />}>
                  Ayarları Kaydet
                </Button>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: <span><BellOutlined /> Bildirim Ayarları</span>,
            children: (
              <>
                <Form
                  form={notificationForm}
                  layout="vertical"
                  onFinish={handleNotificationSettingsSave}
                  initialValues={notificationSettings}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card title="Bildirim Kanalları">
                        <div style={{ marginBottom: '20px' }}>
                          <Text type="secondary">
                            Bildirimlerin iletileceği kanalları seçin. 
                            Birden fazla kanal seçebilirsiniz.
                          </Text>
                        </div>
                        
                        <Form.Item
                          name="enabledChannels"
                          valuePropName="checked"
                        >
                          <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                              <Col span={24}>
                                <Checkbox value="browser">Tarayıcı Bildirimleri</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="email">E-posta Bildirimleri</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="sms">SMS Bildirimleri</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="mobile">Mobil Uygulama Bildirimleri</Checkbox>
                              </Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                        
                        <Form.Item
                          label="Telefon (SMS bildirimleri için)"
                          name="smsPhone"
                        >
                          <Input placeholder="+90 555 123 4567" />
                        </Form.Item>
                        
                        <Form.Item
                          label="E-posta (E-posta bildirimleri için)"
                          name="emailAddress"
                        >
                          <Input placeholder="ornek@email.com" />
                        </Form.Item>
                      </Card>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Card title="Bildirim Tercihleri">
                        <Form.Item
                          label="Bildirim Türleri"
                          name="notificationTypes"
                        >
                          <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                              <Col span={24}>
                                <Checkbox value="emergencyAlert">Acil Durum Bildirimleri</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="taskAssigned">Görev Atamaları</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="taskUpdate">Görev Güncellemeleri</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="systemStatus">Sistem Durumu</Checkbox>
                              </Col>
                              <Col span={24}>
                                <Checkbox value="teamChanges">Ekip Değişiklikleri</Checkbox>
                              </Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                        
                        <Form.Item
                          label="Öncelik Eşiği"
                          name="priorityThreshold"
                        >
                          <Select>
                            <Option value="all">Tüm Bildirimler</Option>
                            <Option value="low">Düşük ve Üzeri</Option>
                            <Option value="medium">Orta ve Üzeri</Option>
                            <Option value="high">Sadece Yüksek Öncelikli</Option>
                          </Select>
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={notificationSaving}>
                      Bildirim Ayarlarını Kaydet
                    </Button>
                  </Form.Item>
                </Form>
              </>
            ),
          }
        ]} />
      </div>
    );
  }
  
  // Admin kullanıcılar için tüm ayarlar gösteriliyor
  return (
    <div className="settings-page">
      <Title level={2}>Sistem Ayarları</Title>
      <Divider />

      <Tabs defaultActiveKey="general" type="card" items={[
        {
          key: 'general',
          label: <span><SettingOutlined /> Genel Ayarlar</span>,
          children: (
            <>
              <Form
                form={generalForm}
                layout="vertical"
                onFinish={handleGeneralSettingsSave}
                initialValues={generalSettings}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Sistem Ayarları">
                      <Form.Item
                        label="Sistem Adı"
                        name="systemName"
                        rules={[{ required: true, message: 'Lütfen sistem adını girin' }]}
                      >
                        <Input placeholder="Sistemin tam adını girin" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Kısa Ad"
                        name="shortName"
                        rules={[{ required: true, message: 'Lütfen kısa ad girin' }]}
                      >
                        <Input placeholder="Sistemin kısa adını girin" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Arayüz Dili"
                        name="language"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="tr">Türkçe</Option>
                          <Option value="en">English</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Zaman Dilimi"
                        name="timezone"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="Europe/Istanbul">İstanbul (GMT+3)</Option>
                          <Option value="UTC">UTC</Option>
                          <Option value="Europe/London">Londra (GMT+0/+1)</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Tarih Formatı"
                        name="dateFormat"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="DD.MM.YYYY">31.12.2023</Option>
                          <Option value="YYYY-MM-DD">2023-12-31</Option>
                          <Option value="MM/DD/YYYY">12/31/2023</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Kategori"
                        name="category"
                      >
                        <Select>
                          <Option value="emergency">Acil Durum</Option>
                          <Option value="disaster">Afet</Option>
                          <Option value="crisis">Kriz</Option>
                          <Option value="general">Genel</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card title="Varsayılan Görünüm">
                      <Form.Item
                        label="Ana Panel Görünümü"
                        name="dashboardLayout"
                      >
                        <Select>
                          <Option value="compact">Kompakt</Option>
                          <Option value="detailed">Detaylı</Option>
                          <Option value="map">Harita Öncelikli</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Sıralama"
                        name="defaultSort"
                      >
                        <Select>
                          <Option value="date-desc">Tarihe Göre (Son-İlk)</Option>
                          <Option value="date-asc">Tarihe Göre (İlk-Son)</Option>
                          <Option value="priority-desc">Önceliğe Göre (Yüksek-Düşük)</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Kayıt Sayısı"
                        name="recordsPerPage"
                      >
                        <Select>
                          <Option value="10">10 kayıt</Option>
                          <Option value="25">25 kayıt</Option>
                          <Option value="50">50 kayıt</Option>
                          <Option value="100">100 kayıt</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Harita Tipi"
                        name="mapType"
                      >
                        <Radio.Group>
                          <Radio value="streets">Sokak Haritası</Radio>
                          <Radio value="satellite">Uydu Haritası</Radio>
                          <Radio value="hybrid">Hibrit</Radio>
                        </Radio.Group>
                      </Form.Item>
                      
                      <Form.Item
                        label="Tema"
                        name="theme"
                      >
                        <Radio.Group>
                          <Radio value="light">Açık Tema</Radio>
                          <Radio value="dark">Koyu Tema</Radio>
                          <Radio value="system">Sistem Teması</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={generalSaving}>
                    Ayarları Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </>
          )
        },
        {
          key: 'notifications',
          label: <span><BellOutlined /> Bildirim Ayarları</span>,
          children: (
            <>
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleNotificationSettingsSave}
                initialValues={notificationSettings}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Bildirim Kanalları">
                      <div style={{ marginBottom: '20px' }}>
                        <Text type="secondary">
                          Bildirimlerin iletileceği kanalları seçin. 
                          Birden fazla kanal seçebilirsiniz.
                        </Text>
                      </div>
                      
                      <Form.Item
                        name="enabledChannels"
                        valuePropName="checked"
                      >
                        <Checkbox.Group style={{ width: '100%' }}>
                          <Row>
                            <Col span={24}>
                              <Checkbox value="browser">Tarayıcı Bildirimleri</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="email">E-posta Bildirimleri</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="sms">SMS Bildirimleri</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="mobile">Mobil Uygulama Bildirimleri</Checkbox>
                            </Col>
                          </Row>
                        </Checkbox.Group>
                      </Form.Item>
                      
                      <Form.Item
                        label="SMS Telefon Numarası"
                        name="smsPhone"
                      >
                        <Input placeholder="+90 555 123 4567" />
                      </Form.Item>
                      
                      <Form.Item
                        label="E-posta Adresi"
                        name="emailAddress"
                      >
                        <Input placeholder="ornek@kurum.gov.tr" />
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Card title="Bildirim Türleri">
                      <div style={{ marginBottom: '20px' }}>
                        <Text type="secondary">
                          Hangi durumlarda bildirim almak istediğinizi seçin.
                        </Text>
                      </div>
                      
                      <Form.Item
                        name="notificationTypes"
                        valuePropName="checked"
                      >
                        <Checkbox.Group style={{ width: '100%' }}>
                          <Row>
                            <Col span={24}>
                              <Checkbox value="emergencyAlert">Acil Durum Uyarıları</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="taskAssigned">Görev Atamaları</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="taskUpdated">Görev Güncellemeleri</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="reportCreated">Yeni Raporlar</Checkbox>
                            </Col>
                            <Col span={24}>
                              <Checkbox value="systemUpdates">Sistem Güncellemeleri</Checkbox>
                            </Col>
                          </Row>
                        </Checkbox.Group>
                      </Form.Item>
                      
                      <Form.Item
                        label="Bildirim Önceliği"
                        name="priorityThreshold"
                      >
                        <Select>
                          <Option value="all">Tüm Bildirimler</Option>
                          <Option value="high">Sadece Yüksek Öncelikli</Option>
                          <Option value="medium">Orta ve Yüksek Öncelikli</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={notificationSaving}>
                    Bildirim Ayarlarını Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </>
          )
        },
        {
          key: 'security',
          label: <span><SafetyOutlined /> Güvenlik Ayarları</span>,
          children: (
            <>
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handleSecuritySettingsSave}
                initialValues={securitySettings}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Oturum Güvenliği">
                      <Form.Item
                        label="Otomatik Oturum Kapatma Süresi"
                        name="sessionTimeout"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="15">15 dakika</Option>
                          <Option value="30">30 dakika</Option>
                          <Option value="60">1 saat</Option>
                          <Option value="120">2 saat</Option>
                          <Option value="240">4 saat</Option>
                          <Option value="480">8 saat</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Çift Faktörlü Kimlik Doğrulama"
                        name="twoFactorAuth"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="Güvenli Çıkış Gerektiğinde Uyar"
                        name="secureLogout"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="Oturum Kilitleme (Hatalı Giriş)"
                        name="failedLoginThreshold"
                      >
                        <Select>
                          <Option value="3">3 hatalı giriş</Option>
                          <Option value="5">5 hatalı giriş</Option>
                          <Option value="10">10 hatalı giriş</Option>
                          <Option value="0">Kilitleme</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Card title="Veri Güvenliği">
                      <Form.Item
                        label="Otomatik Veri Yedekleme"
                        name="dataBackup"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="Yedekleme Aralığı"
                        name="backupFrequency"
                      >
                        <Select>
                          <Option value="daily">Günlük</Option>
                          <Option value="weekly">Haftalık</Option>
                          <Option value="monthly">Aylık</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Veri Şifreleme"
                        name="dataEncryption"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="İşlem Logları"
                        name="auditLogs"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="Kullanıcı IP Kısıtlaması"
                        name="ipRestriction"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="İzin Verilen IP Adresleri"
                        name="allowedIPs"
                      >
                        <Input.TextArea
                          placeholder="Her satıra bir IP adresi yazın"
                          autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                
                <Card title="Şifre Politikası" style={{ marginTop: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Şifre Geçerlilik Süresi (gün)"
                        name="passwordExpiry"
                      >
                        <InputNumber min={0} max={365} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Minimum Şifre Uzunluğu"
                        name="minPasswordLength"
                      >
                        <InputNumber min={6} max={24} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Şifre Karmaşıklık Seviyesi"
                        name="passwordComplexity"
                      >
                        <Select>
                          <Option value="low">Düşük</Option>
                          <Option value="medium">Orta</Option>
                          <Option value="high">Yüksek</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="requireUppercase"
                        valuePropName="checked"
                      >
                        <Checkbox>Büyük harf zorunlu</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="requireLowercase"
                        valuePropName="checked"
                      >
                        <Checkbox>Küçük harf zorunlu</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="requireNumbers"
                        valuePropName="checked"
                      >
                        <Checkbox>Rakam zorunlu</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="requireSpecialChars"
                        valuePropName="checked"
                      >
                        <Checkbox>Özel karakter zorunlu</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="preventPasswordReuse"
                        valuePropName="checked"
                      >
                        <Checkbox>Eski şifrelerin tekrar kullanımını engelle</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
                
                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="primary" htmlType="submit" loading={securitySaving}>
                    Güvenlik Ayarlarını Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </>
          )
        }
      ]} />
    </div>
  );
};

export default SettingsPage; 