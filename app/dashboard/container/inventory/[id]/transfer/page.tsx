"use client";

import React from 'react';
import { Card, Form, Input, Button, Select, InputNumber, DatePicker, Typography, Space, message } from 'antd';
import { SwapOutlined, ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TransferInventoryPage = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Örnek envanter verisi
  const inventory = {
    id: params.id,
    name: 'Battaniye',
    category: 'Barınma',
    quantity: 500,
    unit: 'adet',
    location: 'A Deposu',
  };

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    message.success('Transfer başarıyla kaydedildi');
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
            <Title level={2} style={{ margin: 0 }}>Envanter Transferi</Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            sourceLocation: inventory.location,
            itemName: inventory.name,
            unit: inventory.unit,
          }}
        >
          <Form.Item
            name="itemName"
            label="Malzeme Adı"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="sourceLocation"
            label="Kaynak Konum"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="targetLocation"
            label="Hedef Konum"
            rules={[{ required: true, message: 'Lütfen hedef konum seçin' }]}
          >
            <Select placeholder="Hedef konum seçin">
              <Option value="B Deposu">B Deposu</Option>
              <Option value="C Deposu">C Deposu</Option>
              <Option value="D Deposu">D Deposu</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Transfer Miktarı"
            rules={[
              { required: true, message: 'Lütfen transfer miktarını girin' },
              { type: 'number', max: inventory.quantity, message: 'Transfer miktarı mevcut stoktan fazla olamaz' }
            ]}
          >
            <InputNumber
              min={1}
              max={inventory.quantity}
              style={{ width: '100%' }}
              addonAfter={inventory.unit}
            />
          </Form.Item>

          <Form.Item
            name="transferDate"
            label="Transfer Tarihi"
            rules={[{ required: true, message: 'Lütfen transfer tarihini seçin' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="transferType"
            label="Transfer Tipi"
            rules={[{ required: true, message: 'Lütfen transfer tipini seçin' }]}
          >
            <Select placeholder="Transfer tipi seçin">
              <Option value="normal">Normal Transfer</Option>
              <Option value="emergency">Acil Transfer</Option>
              <Option value="planned">Planlı Transfer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="responsiblePerson"
            label="Sorumlu Kişi"
            rules={[{ required: true, message: 'Lütfen sorumlu kişiyi seçin' }]}
          >
            <Select placeholder="Sorumlu kişi seçin">
              <Option value="1">Ahmet Yılmaz</Option>
              <Option value="2">Mehmet Demir</Option>
              <Option value="3">Ayşe Kaya</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Transfer Notları"
          >
            <TextArea rows={4} placeholder="Transfer ile ilgili notları girin" />
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
                icon={<SwapOutlined />} 
                htmlType="submit"
                style={{ 
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Transfer Et
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TransferInventoryPage; 