"use client";

import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, DatePicker, Typography, Space, message } from 'antd';
import { SaveOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditInventoryPage = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Örnek envanter verisi
  const inventory = {
    id: params.id,
    name: 'Battaniye',
    category: 'Barınma',
    quantity: 500,
    unit: 'adet',
    minQuantity: 100,
    maxQuantity: 1000,
    status: 'Normal',
    location: 'A Deposu',
    lastUpdate: '2025-05-22',
    value: 25000,
    description: 'Tek kişilik, yün battaniye',
    supplier: 'ABC Tekstil',
    expiryDate: '2026-05-22',
    batchNumber: 'BT2025001',
    notes: 'Acil durum için ayrılmış stok',
  };

  useEffect(() => {
    form.setFieldsValue({
      ...inventory,
      expiryDate: dayjs(inventory.expiryDate),
    });
  }, [form, inventory]);

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    message.success('Envanter başarıyla güncellendi');
    router.push(`/dashboard/container/inventory/${params.id}`);
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center mb-6">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/dashboard/container/inventory/${params.id}`)}
            >
              Geri
            </Button>
            <Title level={2} style={{ margin: 0 }}>Envanter Düzenle</Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Malzeme Adı"
            rules={[{ required: true, message: 'Lütfen malzeme adını girin' }]}
          >
            <Input placeholder="Malzeme adını girin" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
          >
            <Select placeholder="Kategori seçin">
              <Option value="Barınma">Barınma</Option>
              <Option value="Gıda">Gıda</Option>
              <Option value="Sağlık">Sağlık</Option>
              <Option value="Hijyen">Hijyen</Option>
              <Option value="Giyim">Giyim</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Miktar"
            rules={[{ required: true, message: 'Lütfen miktar girin' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Birim"
            rules={[{ required: true, message: 'Lütfen birim seçin' }]}
          >
            <Select placeholder="Birim seçin">
              <Option value="adet">Adet</Option>
              <Option value="kg">Kilogram</Option>
              <Option value="litre">Litre</Option>
              <Option value="paket">Paket</Option>
              <Option value="kutu">Kutu</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="minQuantity"
            label="Minimum Stok Miktarı"
            rules={[{ required: true, message: 'Lütfen minimum stok miktarını girin' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxQuantity"
            label="Maksimum Stok Miktarı"
            rules={[{ required: true, message: 'Lütfen maksimum stok miktarını girin' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Konum"
            rules={[{ required: true, message: 'Lütfen konum seçin' }]}
          >
            <Select placeholder="Konum seçin">
              <Option value="A Deposu">A Deposu</Option>
              <Option value="B Deposu">B Deposu</Option>
              <Option value="C Deposu">C Deposu</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Birim Değer (₺)"
            rules={[{ required: true, message: 'Lütfen birim değer girin' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₺\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="Tedarikçi"
          >
            <Input placeholder="Tedarikçi adını girin" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Son Kullanma Tarihi"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="batchNumber"
            label="Parti Numarası"
          >
            <Input placeholder="Parti numarasını girin" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea rows={4} placeholder="Açıklama girin" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={4} placeholder="Notlar girin" />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button 
                icon={<CloseOutlined />} 
                onClick={() => router.push(`/dashboard/container/inventory/${params.id}`)}
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
                style={{ 
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Kaydet
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditInventoryPage; 