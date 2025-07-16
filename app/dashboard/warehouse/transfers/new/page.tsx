'use client';

import { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Card, Space, InputNumber, Typography, App } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
}

interface Equipment {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface TransferItem {
  itemId: string;
  itemName: string;
  availableQuantity: number;
  transferQuantity: number;
  unit: string;
}

const NewTransfer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [sourceItems, setSourceItems] = useState<InventoryItem[]>([]);
  const [sourceEquipment, setSourceEquipment] = useState<Equipment[]>([]);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const sourceId = form.getFieldValue('sourceId');
    if (sourceId) {
      fetchSourceItems(sourceId);
    }
  }, [form.getFieldValue('sourceId')]);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/warehouse');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Depolar yüklenirken hata:', error);
      notification.error({ message: 'Depolar yüklenirken bir hata oluştu' });
    }
  };

  const fetchSourceItems = async (warehouseId: string) => {
    try {
      const [inventoryResponse, equipmentResponse] = await Promise.all([
        axios.get(`/api/warehouse/${warehouseId}/inventory`),
        axios.get(`/api/warehouse/${warehouseId}/equipment`),
      ]);
      setSourceItems(inventoryResponse.data);
      setSourceEquipment(equipmentResponse.data);
    } catch (error) {
      console.error('Kaynak depo öğeleri yüklenirken hata:', error);
      notification.error({ message: 'Kaynak depo öğeleri yüklenirken bir hata oluştu' });
    }
  };

  const handleSourceWarehouseChange = (warehouseId: string) => {
    setSourceWarehouseId(warehouseId);
    setTransferItems([]);
    fetchSourceItems(warehouseId);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const transferData = {
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        items: transferItems.map(item => ({
          itemId: item.itemId,
          quantity: item.transferQuantity
        })),
        notes: values.notes
      };

      await axios.post('/api/transfer', transferData);
      notification.success({ message: 'Transfer başarıyla oluşturuldu' });
      router.push('/dashboard/warehouse/transfers');
    } catch (error) {
      console.error('Transfer oluşturma hatası:', error);
      notification.error({ message: 'Transfer oluşturulurken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Yeni Transfer</Title>
      <Card className="mt-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'TRANSFER',
            date: null,
            sourceId: null,
            targetId: null,
            inventory: [],
            equipment: [],
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Transfer Tipi"
              rules={[{ required: true, message: 'Transfer tipi seçiniz' }]}
            >
              <Select>
                <Option value="IN">Giriş</Option>
                <Option value="OUT">Çıkış</Option>
                <Option value="TRANSFER">Transfer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label="Transfer Tarihi"
              rules={[{ required: true, message: 'Transfer tarihi seçiniz' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="sourceId"
              label="Kaynak Depo"
              rules={[{ required: true, message: 'Kaynak depo seçiniz' }]}
            >
              <Select onChange={handleSourceWarehouseChange}>
                {warehouses.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="targetId"
              label="Hedef Depo"
              rules={[{ required: true, message: 'Hedef depo seçiniz' }]}
            >
              <Select>
                {warehouses.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Title level={4} className="mt-4">Envanter</Title>
          <Form.List name="inventory">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'inventoryId']}
                      rules={[{ required: true, message: 'Ürün seçiniz' }]}
                    >
                      <Select style={{ width: 200 }} placeholder="Ürün Seç">
                        {sourceItems.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Miktar giriniz' }]}
                    >
                      <InputNumber min={1} placeholder="Miktar" />
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>
                      Sil
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Ürün Ekle
                </Button>
              </>
            )}
          </Form.List>

          <Title level={4} className="mt-4">Ekipman</Title>
          <Form.List name="equipment">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'equipmentId']}
                      rules={[{ required: true, message: 'Ekipman seçiniz' }]}
                    >
                      <Select style={{ width: 200 }} placeholder="Ekipman Seç">
                        {sourceEquipment.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.name} ({item.code})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>
                      Sil
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Ekipman Ekle
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="description" label="Açıklama" className="mt-4">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mt-6">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Transfer Oluştur
              </Button>
              <Button onClick={() => router.push('/dashboard/warehouse/transfers')}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewTransfer; 