"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, Input, Select, Tag, 
  Row, Col, Divider, Rate, Pagination, Drawer, 
  Form, InputNumber, Space, message, Image, Badge,
  Table, Upload, Modal, Tabs, Switch, Empty, List, Avatar
} from 'antd';
import { 
  ShoppingCartOutlined, SearchOutlined, 
  FilterOutlined, ShoppingOutlined, HeartOutlined, 
  HeartFilled, AppstoreOutlined, BarsOutlined,
  PlusOutlined, MinusOutlined, EditOutlined,
  DeleteOutlined, UploadOutlined, SaveOutlined,
  DollarOutlined, SettingOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Ürün kategorileri
const productCategories = [
  { value: 'first-aid', label: 'İlk Yardım Malzemeleri' },
  { value: 'survival', label: 'Hayatta Kalma Kitleri' },
  { value: 'food', label: 'Uzun Ömürlü Gıda' },
  { value: 'equipment', label: 'Ekipman ve Aletler' },
  { value: 'clothing', label: 'Özel Giyim' },
  { value: 'communication', label: 'İletişim Araçları' },
  { value: 'shelter', label: 'Barınma Malzemeleri' },
];

// Ürün verileri arayüzü
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  stock: number;
  discount?: number;
  tags?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

// Sepet öğesi arayüzü
interface CartItem {
  product: Product;
  quantity: number;
}

const VolunteerStore: React.FC = () => {
  // Durum değişkenleri
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('featured');
  const [adminMode, setAdminMode] = useState(false);
  const [addProductVisible, setAddProductVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Örnek ürün verileri
  useEffect(() => {
    // Gerçek uygulamada API'den gelecek
    const dummyProducts: Product[] = [
      {
        id: '1',
        name: 'Temel İlk Yardım Kiti',
        description: 'En temel ilk yardım malzemelerini içeren kompakt kit',
        price: 179.99,
        category: 'first-aid',
        imageUrl: 'https://via.placeholder.com/200x200?text=İlk+Yardım+Kiti',
        rating: 4.5,
        stock: 25,
        isNew: true,
        tags: ['İlk Yardım', 'Kompakt', 'Temel']
      },
      {
        id: '2',
        name: '72 Saatlik Acil Durum Seti',
        description: '72 saat boyunca hayatta kalmanız için gerekli tüm malzemeleri içeren set',
        price: 499.99,
        category: 'survival',
        imageUrl: 'https://via.placeholder.com/200x200?text=Acil+Durum+Seti',
        rating: 4.8,
        stock: 12,
        isBestseller: true,
        tags: ['Hayatta Kalma', 'Acil Durum', '72 Saat']
      },
      {
        id: '3',
        name: 'Liyofilize Yemek Paketi (7 Gün)',
        description: '7 günlük liyofilize yemek paketi, uzun raf ömrü',
        price: 329.99,
        category: 'food',
        imageUrl: 'https://via.placeholder.com/200x200?text=Liyofilize+Yemek',
        rating: 4.3,
        stock: 30,
        discount: 15,
        tags: ['Gıda', 'Uzun Ömürlü', 'Liyofilize']
      },
      {
        id: '4',
        name: 'Çok Amaçlı Survival Bıçağı',
        description: 'Acil durumlarda kullanım için çok amaçlı survival bıçağı',
        price: 149.99,
        category: 'equipment',
        imageUrl: 'https://via.placeholder.com/200x200?text=Survival+Bıçağı',
        rating: 4.7,
        stock: 18,
        tags: ['Ekipman', 'Bıçak', 'Çok Amaçlı']
      },
      {
        id: '5',
        name: 'Su Geçirmez Termal Ceket',
        description: 'Extreme koşullarda vücut ısısını koruyan termal ceket',
        price: 399.99,
        category: 'clothing',
        imageUrl: 'https://via.placeholder.com/200x200?text=Termal+Ceket',
        rating: 4.6,
        stock: 8,
        discount: 10,
        tags: ['Giyim', 'Su Geçirmez', 'Termal']
      },
      {
        id: '6',
        name: 'El Tipi Telsiz Seti (2 Adet)',
        description: 'İki adet el tipi telsiz, 5km menzilli, şarj edilebilir',
        price: 259.99,
        category: 'communication',
        imageUrl: 'https://via.placeholder.com/200x200?text=Telsiz+Seti',
        rating: 4.2,
        stock: 15,
        tags: ['İletişim', 'Telsiz', 'Şarj Edilebilir']
      },
      {
        id: '7',
        name: 'Acil Durum Çadırı',
        description: 'Hızlı kurulumlu, su geçirmez acil durum barınma çadırı',
        price: 219.99,
        category: 'shelter',
        imageUrl: 'https://via.placeholder.com/200x200?text=Acil+Durum+Çadırı',
        rating: 4.4,
        stock: 10,
        isNew: true,
        tags: ['Barınma', 'Çadır', 'Su Geçirmez']
      },
      {
        id: '8',
        name: 'Solar Şarj Cihazı',
        description: 'Güneş enerjisi ile telefonunuzu şarj edebilmenizi sağlayan cihaz',
        price: 189.99,
        category: 'equipment',
        imageUrl: 'https://via.placeholder.com/200x200?text=Solar+Şarj',
        rating: 4.1,
        stock: 22,
        tags: ['Ekipman', 'Solar', 'Şarj']
      },
      {
        id: '9',
        name: 'Yangın Söndürücü (Mini)',
        description: 'Taşınabilir mini boyutlu yangın söndürücü',
        price: 129.99,
        category: 'equipment',
        imageUrl: 'https://via.placeholder.com/200x200?text=Yangın+Söndürücü',
        rating: 4.9,
        stock: 5,
        isBestseller: true,
        tags: ['Ekipman', 'Yangın', 'Mini']
      },
      {
        id: '10',
        name: 'Su Arıtma Filtresi',
        description: 'Doğadaki suları içilebilir hale getiren filtre sistemi',
        price: 159.99,
        category: 'survival',
        imageUrl: 'https://via.placeholder.com/200x200?text=Su+Arıtma',
        rating: 4.7,
        stock: 14,
        tags: ['Hayatta Kalma', 'Su', 'Filtre']
      },
      {
        id: '11',
        name: 'Profesyonel İlk Yardım Çantası',
        description: 'Profesyonel sağlık çalışanları için kapsamlı ilk yardım çantası',
        price: 349.99,
        category: 'first-aid',
        imageUrl: 'https://via.placeholder.com/200x200?text=Pro+İlk+Yardım',
        rating: 4.8,
        stock: 7,
        discount: 5,
        tags: ['İlk Yardım', 'Profesyonel', 'Kapsamlı']
      },
      {
        id: '12',
        name: 'Krank Radyo',
        description: 'Pil gerektirmeyen, elle çevrilerek çalışabilen acil durum radyosu',
        price: 139.99,
        category: 'communication',
        imageUrl: 'https://via.placeholder.com/200x200?text=Krank+Radyo',
        rating: 4.3,
        stock: 20,
        tags: ['İletişim', 'Radyo', 'Krank']
      },
    ];
    
    setProducts(dummyProducts);
    setFilteredProducts(dummyProducts);
  }, []);

  // Ürünleri filtrele ve sırala
  useEffect(() => {
    let result = [...products];
    
    // Kategori filtresi
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Arama filtresi
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(lowerCaseSearch) || 
        product.description.toLowerCase().includes(lowerCaseSearch) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch)))
      );
    }
    
    // Sıralama
    switch (sortOrder) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
      case 'featured':
      default:
        // Önce en çok satanlar
        result.sort((a, b) => {
          if (a.isBestseller === b.isBestseller) {
            // Sonra yeni ürünler
            if (a.isNew === b.isNew) {
              // Sonra indirimli ürünler
              if ((a.discount || 0) === (b.discount || 0)) {
                // Son olarak puan
                return b.rating - a.rating;
              }
              return (b.discount || 0) - (a.discount || 0);
            }
            return a.isNew ? -1 : 1;
          }
          return a.isBestseller ? -1 : 1;
        });
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchText, sortOrder]);

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Sepet işlemleri
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    
    message.success(`${product.name} sepete eklendi`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
    message.success('Ürün sepetten çıkarıldı');
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(
      cartItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const toggleFavorite = (productId: string) => {
    if (favoriteProducts.includes(productId)) {
      setFavoriteProducts(favoriteProducts.filter(id => id !== productId));
      message.info('Ürün favorilerden çıkarıldı');
    } else {
      setFavoriteProducts([...favoriteProducts, productId]);
      message.success('Ürün favorilere eklendi');
    }
  };

  // Sepet toplamı
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

  // Grid görünümündeki ürün kartı
  const renderGridItem = (product: Product) => (
    <Col xs={24} sm={12} md={8} lg={6} key={product.id} style={{ marginBottom: 16 }}>
      <Card
        hoverable
        cover={
          <div style={{ position: 'relative', padding: 12 }}>
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              preview={false}
              style={{ height: 180, objectFit: 'contain' }}
            />
            {product.isNew && (
              <Tag color="green" style={{ position: 'absolute', top: 12, left: 12 }}>
                YENİ
              </Tag>
            )}
            {product.isBestseller && (
              <Tag color="orange" style={{ position: 'absolute', top: 12, right: 12 }}>
                ÇOK SATAN
              </Tag>
            )}
            {product.discount && (
              <Tag color="red" style={{ position: 'absolute', bottom: 12, left: 12 }}>
                %{product.discount} İNDİRİM
              </Tag>
            )}
            <Button
              type="text"
              icon={favoriteProducts.includes(product.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              style={{ position: 'absolute', bottom: 12, right: 12 }}
            />
          </div>
        }
        actions={[
          <Rate disabled defaultValue={product.rating} />,
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
          >
            Sepete Ekle
          </Button>
        ]}
      >
        <Card.Meta
          title={product.name}
          description={
            <>
              <Text type="secondary">{product.description}</Text>
              <div style={{ marginTop: 12 }}>
                <Text strong style={{ fontSize: 18 }}>₺{product.price.toFixed(2)}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Stok: {product.stock > 0 ? product.stock : 'Tükendi'}
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                {product.tags?.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </>
          }
        />
      </Card>
    </Col>
  );

  // Liste görünümündeki ürün satırı
  const renderListItem = (product: Product) => (
    <div key={product.id} style={{ marginBottom: 16 }}>
      <Card>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <div style={{ position: 'relative' }}>
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                preview={false}
                style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }}
              />
              {product.isNew && (
                <Tag color="green" style={{ position: 'absolute', top: 0, left: 0 }}>
                  YENİ
                </Tag>
              )}
              {product.isBestseller && (
                <Tag color="orange" style={{ position: 'absolute', top: 0, right: 0 }}>
                  ÇOK SATAN
                </Tag>
              )}
            </div>
          </Col>
          <Col xs={24} sm={16} md={12} lg={14}>
            <Title level={5}>{product.name}</Title>
            <Text type="secondary">{product.description}</Text>
            <div style={{ marginTop: 8 }}>
              <Rate disabled defaultValue={product.rating} />
            </div>
            <div style={{ marginTop: 8 }}>
              {product.tags?.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} style={{ textAlign: 'right' }}>
            <div>
              <Text strong style={{ fontSize: 18 }}>₺{product.price.toFixed(2)}</Text>
              {product.discount && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  %{product.discount} İNDİRİM
                </Tag>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Stok: {product.stock > 0 ? product.stock : 'Tükendi'}
              </Text>
            </div>
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={favoriteProducts.includes(product.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={() => toggleFavorite(product.id)}
              />
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
              >
                Sepete Ekle
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // Admin fonksiyonları
  const handleAddProduct = (values: any) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      price: values.price,
      category: values.category,
      imageUrl: values.imageUrl || 'https://via.placeholder.com/200x200?text=Ürün+Resmi',
      rating: 0,
      stock: values.stock,
      tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
      isNew: values.isNew,
      isBestseller: values.isBestseller,
      discount: values.discount
    };

    setProducts([...products, newProduct]);
    setFilteredProducts([...filteredProducts, newProduct]);
    setAddProductVisible(false);
    form.resetFields();
    message.success('Ürün başarıyla eklendi');
  };

  const handleEditProduct = (values: any) => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: values.name,
      description: values.description,
      price: values.price,
      category: values.category,
      imageUrl: values.imageUrl || editingProduct.imageUrl,
      stock: values.stock,
      tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
      isNew: values.isNew,
      isBestseller: values.isBestseller,
      discount: values.discount
    };

    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? updatedProduct : p
    );
    
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setEditingProduct(null);
    form.resetFields();
    message.success('Ürün başarıyla güncellendi');
  };

  const handleDeleteProduct = (productId: string) => {
    Modal.confirm({
      title: 'Ürünü silmek istediğinize emin misiniz?',
      content: 'Bu işlem geri alınamaz.',
      okText: 'Evet',
      okType: 'danger',
      cancelText: 'Hayır',
      onOk() {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        message.success('Ürün silindi');
      }
    });
  };

  // Ürün düzenleme formunu açar
  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
      tags: product.tags?.join(', '),
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      discount: product.discount || 0
    });
  };

  // Admin paneli için ürün tablosu kolonları
  const adminColumns = [
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Space>
          <Image 
            src={record.imageUrl} 
            alt={record.name}
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        </Space>
      )
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (text: string, record: Product) => (
        <Text strong style={{ fontSize: 18 }}>₺{record.price.toFixed(2)}</Text>
      )
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      render: (text: string, record: Product) => (
        <Text type="secondary">
          {record.stock > 0 ? record.stock : 'Tükendi'}
        </Text>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text: string, record: Product) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => startEditProduct(record)}
          >
            Düzenle
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record.id)}
          >
            Sil
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Başlık ve Filtreler */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>Gönüllü Mağazası</Title>
          <Space>
            <Button 
              type={adminMode ? "default" : "primary"}
              icon={adminMode ? <ShoppingOutlined /> : <SettingOutlined />}
              onClick={() => setAdminMode(!adminMode)}
            >
              {adminMode ? 'Mağaza Görünümü' : 'Yönetim Paneli'}
            </Button>
            <Badge count={cartItems.reduce((total, item) => total + item.quantity, 0)}>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                onClick={() => setCartDrawerVisible(true)}
                size="large"
              >
                Sepet (₺{cartTotal.toFixed(2)})
              </Button>
            </Badge>
          </Space>
        </div>
        
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Ürün ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Kategori Seçin"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setSelectedCategory(value)}
              value={selectedCategory}
            >
              {productCategories.map(category => (
                <Option key={category.value} value={category.value}>{category.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Sırala"
              style={{ width: '100%' }}
              onChange={(value) => setSortOrder(value)}
              value={sortOrder}
            >
              <Option value="featured">Öne Çıkanlar</Option>
              <Option value="price-low">Fiyat (Düşükten Yükseğe)</Option>
              <Option value="price-high">Fiyat (Yüksekten Düşüğe)</Option>
              <Option value="rating">Puan</Option>
              <Option value="newest">En Yeniler</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<AppstoreOutlined />} 
                type={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => setViewMode('grid')}
              />
              <Button 
                icon={<BarsOutlined />} 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => setViewMode('list')}
              />
              <Text>
                {filteredProducts.length} ürün bulundu
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Admin paneli görünümü */}
      {adminMode ? (
        <Card title="Ürün Yönetimi" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                setAddProductVisible(true);
              }}
            >
              Yeni Ürün Ekle
            </Button>
          </div>
          
          <Table 
            dataSource={products} 
            columns={adminColumns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />

          <Modal
            title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            open={addProductVisible || editingProduct !== null}
            onCancel={() => {
              setAddProductVisible(false);
              setEditingProduct(null);
            }}
            footer={null}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={editingProduct ? handleEditProduct : handleAddProduct}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Ürün Adı"
                    rules={[{ required: true, message: 'Lütfen ürün adı girin' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="Kategori"
                    rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
                  >
                    <Select>
                      {productCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Ürün Açıklaması"
                rules={[{ required: true, message: 'Lütfen ürün açıklaması girin' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="price"
                    label="Fiyat (₺)"
                    rules={[{ required: true, message: 'Lütfen fiyat girin' }]}
                  >
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="stock"
                    label="Stok Adedi"
                    rules={[{ required: true, message: 'Lütfen stok adedi girin' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="discount"
                    label="İndirim Oranı (%)"
                    initialValue={0}
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="imageUrl"
                label="Ürün Görseli URL"
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>

              <Form.Item
                name="tags"
                label="Etiketler (virgülle ayırın)"
              >
                <Input placeholder="İlk Yardım, Kompakt, Hafif..." />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="isNew"
                    label="Yeni Ürün"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="isBestseller"
                    label="Çok Satan"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button 
                    onClick={() => {
                      setAddProductVisible(false);
                      setEditingProduct(null);
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      ) : (
        <>
          {/* Ürün Listesi */}
          {viewMode === 'grid' ? (
            <Row gutter={16}>
              {paginatedProducts.map(product => renderGridItem(product))}
            </Row>
          ) : (
            paginatedProducts.map(product => renderListItem(product))
          )}
        </>
      )}

      {/* Sayfalama - sadece normal mağaza görünümünde göster */}
      {!adminMode && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            total={filteredProducts.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            pageSizeOptions={['8', '12', '24', '36']}
          />
        </div>
      )}

      {/* Sepet Çekmecesi */}
      <Drawer
        title="Alışveriş Sepetiniz"
        placement="right"
        onClose={() => setCartDrawerVisible(false)}
        open={cartDrawerVisible}
        width={500}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCartDrawerVisible(false)} style={{ marginRight: 8 }}>
              Alışverişe Devam Et
            </Button>
            <Button type="primary" onClick={() => message.success('Ödeme işlemi başlatıldı')}>
              Ödemeye Geç
            </Button>
          </div>
        }
      >
        {cartItems.length > 0 ? (
          <div>
            <Tabs 
              defaultActiveKey="cart" 
              items={[
                {
                  key: "cart",
                  label: "Sepetim",
                  children: (
                    <>
                      {cartItems.map(item => (
                        <Card key={item.product.id} style={{ marginBottom: 10 }} variant="outlined">
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex' }}>
                              <Image
                                width={80}
                                src={item.product.imageUrl}
                                preview={false}
                              />
                              <div style={{ marginLeft: 10 }}>
                                <Text strong>{item.product.name}</Text>
                                <div>
                                  <Text type="secondary">{item.product.price.toFixed(2)} ₺ x {item.quantity}</Text>
                                </div>
                                <Text strong type="danger">{(item.product.price * item.quantity).toFixed(2)} ₺</Text>
                              </div>
                            </div>
                            <div>
                              <Space>
                                <Button 
                                  type="text" 
                                  icon={<MinusOutlined />} 
                                  onClick={() => updateCartItemQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                />
                                <Text>{item.quantity}</Text>
                                <Button 
                                  type="text" 
                                  icon={<PlusOutlined />} 
                                  onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                                />
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                  onClick={() => removeFromCart(item.product.id)}
                                />
                              </Space>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Divider />
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 16 }}>Toplam: </Text>
                        <Text strong type="danger" style={{ fontSize: 18 }}>
                          {cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)} ₺
                        </Text>
                      </div>
                    </>
                  )
                },
                {
                  key: "favorites",
                  label: "Favorilerim",
                  children: (
                    <>
                      {favoriteProducts.length > 0 ? (
                        <div>
                          {products
                            .filter(product => favoriteProducts.includes(product.id))
                            .map(product => (
                              <Card key={product.id} style={{ marginBottom: 10 }} variant="outlined">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex' }}>
                                    <Image
                                      width={80}
                                      src={product.imageUrl}
                                      preview={false}
                                    />
                                    <div style={{ marginLeft: 10 }}>
                                      <Text strong>{product.name}</Text>
                                      <div>
                                        <Text type="secondary">{product.price.toFixed(2)} ₺</Text>
                                      </div>
                                      <Button 
                                        type="link" 
                                        size="small"
                                        onClick={() => addToCart(product)}
                                      >
                                        Sepete Ekle
                                      </Button>
                                    </div>
                                  </div>
                                  <Button 
                                    type="text" 
                                    danger 
                                    icon={<HeartFilled />} 
                                    onClick={() => toggleFavorite(product.id)}
                                  />
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <Empty description="Favori ürün bulunmuyor" />
                      )}
                    </>
                  )
                }
              ]}
            />
          </div>
        ) : (
          <Empty description="Sepetinizde ürün bulunmuyor" />
        )}
      </Drawer>
    </div>
  );
};

export default VolunteerStore; 