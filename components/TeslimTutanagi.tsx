'use client';

import React from 'react';
import { Form, Input, DatePicker, Button, Space } from 'antd';
import { useNotification } from './NotificationProvider';

interface TeslimTutanagiProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
}

export default function TeslimTutanagi({ onSubmit, loading = false }: TeslimTutanagiProps) {
  const [form] = Form.useForm();
  const { showNotification } = useNotification();

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      form.resetFields();
      showNotification('success', 'Teslim tutanağı başarıyla oluşturuldu');
    } catch (error) {
      showNotification('error', 'Teslim tutanağı oluşturulurken bir hata oluştu');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="teslimEden"
        label="Teslim Eden"
        rules={[{ required: true, message: 'Lütfen teslim eden kişiyi giriniz' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="teslimAlan"
        label="Teslim Alan"
        rules={[{ required: true, message: 'Lütfen teslim alan kişiyi giriniz' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="malzemeler"
        label="Malzemeler"
        rules={[{ required: true, message: 'Lütfen malzemeleri giriniz' }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="teslimTarihi"
        label="Teslim Tarihi"
        rules={[{ required: true, message: 'Lütfen teslim tarihini seçiniz' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="aciklama"
        label="Açıklama"
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tutanak Oluştur
          </Button>
          <Button onClick={() => form.resetFields()}>
            Temizle
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
} 