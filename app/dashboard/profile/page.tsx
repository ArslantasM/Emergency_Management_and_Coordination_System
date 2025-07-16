"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  message,
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Timeline,
  Switch,
  Select
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // Form tanımları
  const [profileForm] = Form.useForm();
  
  // Oturum yükleniyor
  if (status === "loading") {
    return <div className="flex items-center justify-center h-full">
      <div>Yükleniyor...</div>
    </div>;
  }
  
  // Kullanıcı bilgisi
  const user = session?.user;
  
  // Profil bilgilerini kaydetme
  const handleSaveProfile = (values: any) => {
    console.log('Profil bilgileri güncellendi:', values);
    message.success('Profil bilgileri başarıyla güncellendi.');
    setIsEditing(false);
  };
  
  // Profil fotoğrafı yükleme
  const handleAvatarUpload: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} başarıyla yüklendi.`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} yüklenirken hata oluştu.`);
    }
  };
  
  // Kan grupları
  const bloodTypes = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'];
  
  // Tab içerikleri
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Genel Bilgiler',
      children: (
        <div>
          {isEditing ? (
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
                phone: '555-123-4567',
                position: 'Afet Koordinatörü',
                department: 'Operasyon',
                location: 'İstanbul, Türkiye',
                bio: 'Afet yönetimi alanında 8 yıllık deneyime sahibim. Deprem, sel ve yangın durumlarında saha koordinasyonu konusunda uzmanım.',
                bloodType: 'A Rh+',
                chronicDiseases: '',
                medications: '',
                disabilityStatus: false,
                prosthesisUse: false,
                homeAddress: 'Bahçelievler Mah. Atatürk Cad. No:42 D:5 Üsküdar/İstanbul',
                workAddress: 'Levent Mah. İş Kuleleri, A Blok Kat:5 Beşiktaş/İstanbul'
              }}
              onFinish={handleSaveProfile}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Temel Bilgiler">
                    <Row gutter={[16, 16]}>
                      <Col span={24} md={12}>
                        <Form.Item label="İsim" name="name" rules={[{ required: true, message: 'Lütfen isminizi girin' }]}>
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item label="E-posta" name="email" rules={[{ required: true, message: 'Lütfen e-posta adresinizi girin' }]}>
                          <Input prefix={<MailOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item label="Telefon" name="phone">
                          <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item label="Pozisyon" name="position">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item label="Departman" name="department">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item label="Konum" name="location">
                          <Input prefix={<EnvironmentOutlined />} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={24}>
                  <Card title="Sağlık Bilgileri">
                    <Row gutter={[16, 16]}>
                      <Col span={24} md={12}>
                        <Form.Item 
                          label="Kan Grubu" 
                          name="bloodType"
                          rules={[{ required: true, message: 'Lütfen kan grubunuzu seçin' }]}
                        >
                          <Select>
                            {bloodTypes.map(type => (
                              <Option key={type} value={type}>{type}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item 
                          label="Engel Durumu" 
                          name="disabilityStatus"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item 
                          label="Kronik Rahatsızlıklar" 
                          name="chronicDiseases"
                          help="Varsa kronik rahatsızlıklarınızı girin (Diyabet, Hipertansiyon vb.)"
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                      <Col span={24} md={12}>
                        <Form.Item 
                          label="Kullanılan İlaçlar" 
                          name="medications"
                          help="Düzenli kullandığınız ilaçlar"
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item 
                          label="Protez Kullanımı" 
                          name="prosthesisUse"
                          valuePropName="checked"
                          help="Protez kullanıyorsanız işaretleyin"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={24}>
                  <Card title="Adres Bilgileri">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Form.Item 
                          label="Ev Adresi" 
                          name="homeAddress"
                          rules={[{ required: true, message: 'Lütfen ev adresinizi girin' }]}
                        >
                          <Input.TextArea rows={2} placeholder="Sokak, Mahalle, İlçe/İl" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item 
                          label="İş Adresi" 
                          name="workAddress"
                        >
                          <Input.TextArea rows={2} placeholder="Sokak, Mahalle, İlçe/İl" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={24}>
                  <Card title="Ek Bilgiler">
                    <Form.Item label="Biyografi" name="bio">
                      <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label="Profil Fotoğrafı">
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleAvatarUpload}
                        maxCount={1}
                      >
                        {fileList.length < 1 && <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Yükle</div>
                        </div>}
                      </Upload>
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        Kaydet
                      </Button>
                      <Button 
                        style={{ marginLeft: 8 }} 
                        onClick={() => setIsEditing(false)}
                      >
                        İptal
                      </Button>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <Paragraph>
                      <Text strong style={{ marginRight: 8 }}>
                        <MailOutlined /> E-posta:
                      </Text>
                      {user?.email}
                    </Paragraph>
                    <Paragraph>
                      <Text strong style={{ marginRight: 8 }}>
                        <PhoneOutlined /> Telefon:
                      </Text>
                      555-123-4567
                    </Paragraph>
                    <Paragraph>
                      <Text strong style={{ marginRight: 8 }}>
                        <UserOutlined /> Pozisyon:
                      </Text>
                      Afet Koordinatörü
                    </Paragraph>
                    <Paragraph>
                      <Text strong style={{ marginRight: 8 }}>
                        <TeamOutlined /> Departman:
                      </Text>
                      Operasyon
                    </Paragraph>
                    <Paragraph>
                      <Text strong style={{ marginRight: 8 }}>
                        <EnvironmentOutlined /> Konum:
                      </Text>
                      İstanbul, Türkiye
                    </Paragraph>
                  </div>
                  <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Düzenle
                  </Button>
                </div>
                
                <Divider orientation="left">Sağlık Bilgileri</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={24} md={8}>
                    <Statistic 
                      title="Kan Grubu" 
                      value="A Rh+" 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={24} md={8}>
                    <Statistic 
                      title="Engel Durumu" 
                      value="Yok" 
                    />
                  </Col>
                  <Col span={24} md={8}>
                    <Statistic 
                      title="Protez Kullanımı" 
                      value="Yok" 
                    />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Kronik Rahatsızlıklar:</Title>
                  <Text>Belirtilmemiş</Text>
                </div>
                
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Kullanılan İlaçlar:</Title>
                  <Text>Belirtilmemiş</Text>
                </div>
                
                <Divider orientation="left">Adres Bilgileri</Divider>
                <Paragraph>
                  <Text strong>Ev Adresi:</Text><br />
                  Bahçelievler Mah. Atatürk Cad. No:42 D:5 Üsküdar/İstanbul
                </Paragraph>
                
                <Paragraph>
                  <Text strong>İş Adresi:</Text><br />
                  Levent Mah. İş Kuleleri, A Blok Kat:5 Beşiktaş/İstanbul
                </Paragraph>
                
                <Divider orientation="left">Biyografi</Divider>
                <Paragraph>
                  Afet yönetimi alanında 8 yıllık deneyime sahibim. Deprem, sel ve yangın durumlarında 
                  saha koordinasyonu konusunda uzmanım.
                </Paragraph>
                
                <Divider orientation="left">Uzmanlık Alanları</Divider>
                <div>
                  <Tag color="blue">Afet Yönetimi</Tag>
                  <Tag color="green">Saha Koordinasyonu</Tag>
                  <Tag color="orange">Acil Durum Operasyonları</Tag>
                  <Tag color="purple">Kriz Yönetimi</Tag>
                  <Tag color="cyan">Arama Kurtarma</Tag>
                </div>
              </Card>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Aktivite Geçmişi',
      children: (
        <div>
          <Timeline
            items={[
              {
                children: (
                  <>
                    <Text strong>İzmir Depremi Durum Raporu</Text> görevini tamamladınız.
                    <div><small>2 saat önce</small></div>
                  </>
                ),
                color: 'green',
              },
              {
                children: (
                  <>
                    <Text strong>Gönüllü Eğitim Programı</Text> etkinliğine katıldınız.
                    <div><small>4 saat önce</small></div>
                  </>
                ),
                color: 'blue',
              },
              {
                children: (
                  <>
                    <Text strong>Acil Durum Tatbikatı</Text> planlaması başlattınız.
                    <div><small>Dün</small></div>
                  </>
                ),
                color: 'orange',
              },
              {
                children: (
                  <>
                    <Text strong>Yeni görev atandı:</Text> İzmir Deprem Bölgesi Risk Analizi
                    <div><small>2 gün önce</small></div>
                  </>
                ),
                color: 'blue',
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'Güvenlik',
      children: (
        <div>
          <Form layout="vertical">
            <Form.Item label="Şifre Değiştir">
              <Input.Password placeholder="Mevcut şifre" prefix={<LockOutlined />} style={{ marginBottom: 16 }} />
              <Input.Password placeholder="Yeni şifre" prefix={<LockOutlined />} style={{ marginBottom: 16 }} />
              <Input.Password placeholder="Yeni şifre (tekrar)" prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary">Şifreyi Güncelle</Button>
            </Form.Item>
            
            <Divider />
            
            <Form.Item label="İki Faktörlü Kimlik Doğrulama">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>İki faktörlü kimlik doğrulamayı etkinleştir</span>
                <Switch />
              </div>
            </Form.Item>
            
            <Divider />
            
            <Form.Item label="Oturum Bilgileri">
              <List
                bordered
                dataSource={[
                  { device: 'Windows 10 - Chrome', location: 'İstanbul, Türkiye', time: 'Şu anda aktif' },
                  { device: 'iPhone 14 - Safari', location: 'İstanbul, Türkiye', time: '1 gün önce' },
                ]}
                renderItem={item => (
                  <List.Item actions={[<Button danger size="small">Çıkış Yap</Button>]}>
                    <List.Item.Meta
                      title={item.device}
                      description={
                        <>
                          <div>{item.location}</div>
                          <div><small>{item.time}</small></div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>Profil</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
          <Avatar 
            size={120} 
            icon={<UserOutlined />} 
            src={user?.image} 
            style={{ marginBottom: 16 }}
          />
          <Title level={3} style={{ marginBottom: 8 }}>{user?.name}</Title>
          <Tag color="blue" style={{ marginBottom: 16 }}>
            {user?.role === 'admin' 
              ? 'Yönetici' 
              : user?.role === 'manager' 
                ? 'Yönetici' 
                : user?.role === 'staff' 
                  ? 'Personel' 
                  : 'Kullanıcı'}
          </Tag>
          
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <Button shape="circle" icon={<TwitterOutlined />} />
            <Button shape="circle" icon={<LinkedinOutlined />} />
            <Button shape="circle" icon={<GithubOutlined />} />
          </div>
        </div>
      </Card>
      
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default ProfilePage; 