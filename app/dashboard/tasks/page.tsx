"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Progress,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Tabs,
  Badge,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
  Checkbox,
  Alert,
  Divider,
  Empty,
  message,
  Modal,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  UserAddOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  AlertOutlined,
  ExportOutlined,
  FileDoneOutlined,
  DownOutlined,
  AppstoreAddOutlined,
  ToolOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import locale from 'antd/es/date-picker/locale/tr_TR';
import { useSession } from 'next-auth/react';
import TeslimTutanagi from "@/components/TeslimTutanagi";

dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Bölge adını getiren yardımcı fonksiyon
const getRegionName = (regionValue: string) => {
  const region = regions.find(r => r.value === regionValue);
  return region ? region.label : regionValue;
};

// Departman adını getiren yardımcı fonksiyon
const getDepartmentName = (departmentValue: string) => {
  const departmentMap: Record<string, string> = {
    'search-rescue': 'Arama Kurtarma',
    'medical': 'Sağlık',
    'logistics': 'Lojistik',
    'coordination': 'Koordinasyon',
    'shelter': 'Barınma'
  };
  
  return departmentMap[departmentValue] || departmentValue;
};

// Task tipi için interface
interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  region: string;
  startDate: string;
  endDate: string;
  assignees: { id: string; name: string; role: string }[];
  deadline?: string;
  createdAt?: string;
  department?: string;
  // Görev grubu özellikleri
  isTaskGroup?: boolean;
  parentTaskId?: string;
  childTasks?: string[]; // Alt görev ID'leri
  // Ekip atama özellikleri
  team?: {
    id: string;
    name: string;
    leader?: { id: string; name: string; role: string; department?: string };
    members: { id: string; name: string; role: string }[];
  };
  // Ekipman ve envanter atama özellikleri
  assignedEquipment?: {
    id: string;
    name: string;
    type: string;
    quantity: number;
    serialNumber?: string;
  }[];
  assignedInventory?: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }[];
}

// Gönüllü yetenek/beceri kategorileri
enum VolunteerSkillCategory {
  MEDICAL = 'medical',
  SEARCH_RESCUE = 'search_rescue',
  LOGISTICS = 'logistics', 
  COMMUNICATION = 'communication',
  SHELTER = 'shelter',
  TECHNICAL = 'technical',
  TRANSPORT = 'transport',
  FOOD_SUPPLY = 'food_supply',
  LANGUAGE = 'language',
  OTHER = 'other'
}

// Görev departmanı ile yetenek kategorisi eşleştirmesi
const departmentToSkillMap: Record<string, VolunteerSkillCategory[]> = {
  'search-rescue': [VolunteerSkillCategory.SEARCH_RESCUE, VolunteerSkillCategory.TECHNICAL],
  'medical': [VolunteerSkillCategory.MEDICAL],
  'logistics': [VolunteerSkillCategory.LOGISTICS, VolunteerSkillCategory.TRANSPORT, VolunteerSkillCategory.FOOD_SUPPLY],
  'coordination': [VolunteerSkillCategory.COMMUNICATION, VolunteerSkillCategory.LANGUAGE],
  'shelter': [VolunteerSkillCategory.SHELTER]
};

// Gönüllü tipi - basitleştirilmiş
interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  district?: string;
  skills: {
    id: string;
    category: VolunteerSkillCategory;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }[];
  status: string;
  profileImageUrl?: string;
}

// Demo gönüllü verileri
const volunteersData: Volunteer[] = [
  {
    id: 'v1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    city: 'İstanbul',
    district: 'Kadıköy',
    skills: [
      { id: 's1', category: VolunteerSkillCategory.SEARCH_RESCUE, name: 'Enkaz Kurtarma', level: 'advanced' },
      { id: 's2', category: VolunteerSkillCategory.TECHNICAL, name: 'Yapı Değerlendirme', level: 'intermediate' }
    ],
    status: 'active'
  },
  {
    id: 'v2',
    firstName: 'Ayşe',
    lastName: 'Demir',
    city: 'Ankara',
    district: 'Çankaya',
    skills: [
      { id: 's3', category: VolunteerSkillCategory.MEDICAL, name: 'İlk Yardım', level: 'expert' },
      { id: 's4', category: VolunteerSkillCategory.LOGISTICS, name: 'Malzeme Yönetimi', level: 'advanced' }
    ],
    status: 'active'
  },
  {
    id: 'v3',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    city: 'İzmir',
    district: 'Konak',
    skills: [
      { id: 's5', category: VolunteerSkillCategory.TRANSPORT, name: 'Araç Kullanımı', level: 'advanced' },
      { id: 's6', category: VolunteerSkillCategory.COMMUNICATION, name: 'Kriz İletişimi', level: 'intermediate' }
    ],
    status: 'active'
  },
  {
    id: 'v4',
    firstName: 'Zeynep',
    lastName: 'Şahin',
    city: 'İstanbul',
    district: 'Beşiktaş',
    skills: [
      { id: 's7', category: VolunteerSkillCategory.SHELTER, name: 'Barınma Alanı Kurulumu', level: 'advanced' },
      { id: 's8', category: VolunteerSkillCategory.FOOD_SUPPLY, name: 'Gıda Dağıtımı', level: 'intermediate' }
    ],
    status: 'active'
  },
  {
    id: 'v5',
    firstName: 'Ali',
    lastName: 'Özkan',
    city: 'Bursa',
    district: 'Nilüfer',
    skills: [
      { id: 's9', category: VolunteerSkillCategory.LANGUAGE, name: 'İngilizce Tercüme', level: 'expert' },
      { id: 's10', category: VolunteerSkillCategory.COMMUNICATION, name: 'Sosyal Medya Yönetimi', level: 'advanced' }
    ],
    status: 'active'
  }
];

// Demo personel verileri
const personnelData = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'field', department: 'search-rescue' },
  { id: '2', name: 'Ayşe Kaya', role: 'coordinator', department: 'medical' },
  { id: '3', name: 'Mehmet Demir', role: 'field', department: 'logistics' },
  { id: '4', name: 'Zeynep Şahin', role: 'manager', department: 'coordination' },
  { id: '5', name: 'Mustafa Yıldız', role: 'field', department: 'search-rescue' },
];

// Demo görev verileri
const tasksData: TaskType[] = [
  {
    id: '1',
    title: 'Enkaz Tarama Çalışması',
    description: 'İstanbul Kadıköy bölgesinde enkaz tarama ve hasar tespiti.',
    status: 'in-progress',
    priority: 'high',
    progress: 35,
    region: 'istanbul',
    startDate: '2023-12-01',
    endDate: '2023-12-15',
    department: 'search-rescue',
    assignees: [
      { id: '1', name: 'Ahmet Yılmaz', role: 'field' },
      { id: '3', name: 'Mehmet Demir', role: 'field' }
    ],
    team: {
      id: 't1',
      name: 'Arama Kurtarma Ekibi A',
      leader: { id: '1', name: 'Ahmet Yılmaz', role: 'field', department: 'search-rescue' },
      members: [
        { id: '3', name: 'Mehmet Demir', role: 'field' },
        { id: '5', name: 'Mustafa Yıldız', role: 'field' }
      ]
    },
    assignedEquipment: [
      { id: 'e1', name: 'Termal Kamera', type: 'Elektronik', quantity: 2, serialNumber: 'TK-2023-001' },
      { id: 'e2', name: 'Kurtarma Ekipmanı Seti', type: 'Kurtarma Araçları', quantity: 1 }
    ],
    assignedInventory: [
      { id: 'i1', name: 'N95 Maske', category: 'Koruyucu Ekipman', quantity: 20, unit: 'adet' },
      { id: 'i2', name: 'İlk Yardım Çantası', category: 'Tıbbi Malzeme', quantity: 2, unit: 'adet' }
    ]
  },
  {
    id: '2',
    title: 'Sağlık Taraması',
    description: 'Ankara Çankaya bölgesinde sağlık taraması ve aşılama çalışması.',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    region: 'ankara',
    startDate: '2023-12-05',
    endDate: '2023-12-20',
    department: 'medical',
    assignees: [{ id: '2', name: 'Ayşe Kaya', role: 'coordinator' }],
  },
  {
    id: '3',
    title: 'Malzeme Dağıtımı',
    description: 'İzmir bölgesine yardım malzemelerinin dağıtımı.',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    region: 'izmir',
    startDate: '2023-11-15',
    endDate: '2023-11-30',
    department: 'logistics',
    assignees: [{ id: '3', name: 'Mehmet Demir', role: 'field' }],
  },
  {
    id: '4',
    title: 'Kriz Koordinasyonu',
    description: 'Bursa bölgesi afet koordinasyon merkezi kurulumu ve yönetimi.',
    status: 'in-progress',
    priority: 'high',
    progress: 60,
    region: 'bursa',
    startDate: '2023-11-20',
    endDate: '2023-12-20',
    department: 'coordination',
    assignees: [{ id: '4', name: 'Zeynep Şahin', role: 'manager' }],
  },
  {
    id: '5',
    title: 'Arama Kurtarma Tatbikatı',
    description: 'Antalya bölgesinde arama kurtarma tatbikatı düzenlenmesi.',
    status: 'pending',
    priority: 'low',
    progress: 0,
    region: 'antalya',
    startDate: '2023-12-10',
    endDate: '2023-12-12',
    department: 'search-rescue',
    assignees: [{ id: '5', name: 'Mustafa Yıldız', role: 'field' }],
  },
];

// Bölge verileri
const regions = [
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'bursa', label: 'Bursa' },
  { value: 'antalya', label: 'Antalya' },
];

// Durum seçenekleri
const statusOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'in-progress', label: 'Devam Ediyor' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal Edildi' },
];

// Öncelik seçenekleri
const priorityOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
];

const TasksPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [form] = Form.useForm();
  const [volunteerDrawerVisible, setVolunteerDrawerVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskType | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [volunteerSearchText, setVolunteerSearchText] = useState('');
  const [assignedVolunteers, setAssignedVolunteers] = useState<Record<string, string[]>>({});
  const [currentDepartment, setCurrentDepartment] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [filteredTasks, setFilteredTasks] = useState(tasksData);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTaskGroupModalVisible, setIsTaskGroupModalVisible] = useState(false);
  const [isTeamAssignModalVisible, setIsTeamAssignModalVisible] = useState(false);
  const [isEquipmentAssignModalVisible, setIsEquipmentAssignModalVisible] = useState(false);
  const [teslimTutanagiVisible, setTeslimTutanagiVisible] = useState(false);
  const [currentTaskForTeslim, setCurrentTaskForTeslim] = useState<TaskType | null>(null);

  // Görev ekleme/düzenleme
  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEditTask = (record: TaskType) => {
    setEditingTask(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      priority: record.priority,
      status: record.status,
      progress: record.progress,
      region: record.region,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      assignees: record.assignees.map((a: any) => a.id),
    });
    setDrawerVisible(true);
  };

  const handleSaveTask = (values: Partial<TaskType>) => {
    console.log('Görev kaydedildi:', values);
    setDrawerVisible(false);
  };

  // Görüntüleme fonksiyonu
  const handleViewTask = (record: TaskType) => {
    // Burada görev detaylarını gösterebilirsiniz
    console.log('Görev detayları:', record);
  };

  // Silme fonksiyonu
  const handleDeleteTask = (taskId: string) => {
    // Burada görev silme işlemini gerçekleştirebilirsiniz
    console.log('Görev silindi:', taskId);
  };

  // Durum ve öncelik için renk ve etiket belirleme
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Tamamlandı</Tag>;
      case 'in-progress':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Devam Ediyor</Tag>;
      case 'pending':
        return <Tag icon={<ExclamationCircleOutlined />} color="warning">Beklemede</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPriorityTag = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Tag color="red">Yüksek</Tag>;
      case 'medium':
        return <Tag color="orange">Orta</Tag>;
      case 'low':
        return <Tag color="green">Düşük</Tag>;
      default:
        return <Tag color="default">{priority}</Tag>;
    }
  };

  // Gönüllü atama çekmecesini aç
  const handleAssignVolunteers = (record: TaskType) => {
    setCurrentTask(record);
    // Görevin departmanına göre gerekli yetenek kategorilerini belirle
    const department = personnelData.find(p => 
      record.assignees.some(a => a.id === p.id)
    )?.department || 'search-rescue';
    setCurrentDepartment(department);
    
    // Eğer bu görev için daha önce gönüllü atanmışsa, seçilenleri belirle
    if (assignedVolunteers[record.id]) {
      setSelectedVolunteers(assignedVolunteers[record.id]);
    } else {
      setSelectedVolunteers([]);
    }
    
    setVolunteerDrawerVisible(true);
  };

  // Gönüllü atama işlemini tamamla
  const handleVolunteerAssignmentComplete = () => {
    if (currentTask && selectedVolunteers.length > 0) {
      // Atanan gönüllüleri kaydet
      setAssignedVolunteers({
        ...assignedVolunteers,
        [currentTask.id]: selectedVolunteers
      });
      
      message.success(`${selectedVolunteers.length} gönüllü "${currentTask.title}" görevine atandı.`);
    }
    setVolunteerDrawerVisible(false);
  };

  // Uygun gönüllüleri filtrele
  const getMatchingVolunteers = () => {
    if (!currentTask) return [];
    
    // Görev için gerekli yetenekleri belirle
    const requiredSkills = departmentToSkillMap[currentDepartment] || [];
    
    return volunteersData.filter(volunteer => {
      // Arama filtresi
      const matchesSearch = !volunteerSearchText || 
        `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(volunteerSearchText.toLowerCase()) ||
        volunteer.city.toLowerCase().includes(volunteerSearchText.toLowerCase());
      
      // Yetenek uyumu
      const hasMatchingSkill = requiredSkills.length === 0 || 
        volunteer.skills.some(skill => requiredSkills.includes(skill.category));
      
      // Konum uyumu - görevin bölgesi ile gönüllünün şehrini karşılaştır
      const regionCity = regions.find(r => r.value === currentTask.region)?.label || '';
      const matchesLocation = regionCity.toLowerCase() === volunteer.city.toLowerCase();
      
      // Aktif durumda mı?
      const isActive = volunteer.status === 'active';
      
      // Tüm filtreler geçerli mi?
      return matchesSearch && isActive && (hasMatchingSkill || matchesLocation);
    });
  };

  // Gönüllüleri sırala
  const sortVolunteers = (volunteers: Volunteer[]) => {
    // İkinci calculateMatchScore fonksiyonunu kullan
    return [...volunteers].sort((a, b) => {
      const scoreA = calculateMatchScore(a);
      const scoreB = calculateMatchScore(b);
      return scoreB - scoreA;
    });
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Görev Başlığı',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TaskType) => (
        <a onClick={() => handleViewTask(record)}>{text}</a>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: 'İlerleme',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Bölge',
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => {
        const regionName = getRegionName(region);
        return <Tag icon={<EnvironmentOutlined />}>{regionName}</Tag>;
      },
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Atananlar',
      dataIndex: 'assignees',
      key: 'assignees',
      render: (assignees: { id: string; name: string; role: string }[]) => (
        <Avatar.Group max={{ count: 3 }}>
          {assignees.map((assignee: any) => (
            <Tooltip key={assignee.id} title={assignee.name}>
              <Avatar icon={<UserOutlined />} />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: TaskType) => (
        <Space size="small">
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTask(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button 
              type="text"
              icon={<EditOutlined />} 
              onClick={() => handleEditTask(record)} 
            />
          </Tooltip>
          <Tooltip title="Gönüllü Ata">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => handleAssignVolunteers(record)}
            />
          </Tooltip>
          {record.team && record.team.leader && (record.assignedEquipment?.length || record.assignedInventory?.length) && (
            <Tooltip title="Teslim Tutanağı">
              <Button
                type="text"
                icon={<FileDoneOutlined />}
                onClick={() => showTeslimTutanagi(record)}
              />
            </Tooltip>
          )}
            <Popconfirm
            title="Bu görevi silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteTask(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
            <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      ),
    },
  ];

  // Sekmeye göre görevleri filtreleme
  const getFilteredTasks = () => {
    if (activeTab === 'all') return tasksData;
    return tasksData.filter(task => task.status === activeTab);
  };

  // Gönüllü atama drawer'ını aç
  const openVolunteerAssignment = (task: TaskType) => {
    setCurrentTask(task);
    setSelectedVolunteers(assignedVolunteers[task.id] || []);
    setVolunteerDrawerVisible(true);
  };

  // Gönüllü atama işlemini tamamla
  const completeVolunteerAssignment = () => {
    if (!currentTask) return;
    
    setAssignedVolunteers({
      ...assignedVolunteers,
      [currentTask.id]: selectedVolunteers
    });
    
    message.success(`${selectedVolunteers.length} gönüllü "${currentTask.title}" görevine atandı.`);
    setVolunteerDrawerVisible(false);
  };

  // Uygun gönüllüleri filtrele (lokasyon ve yetenek bazlı)
  const getFilteredVolunteers = () => {
    if (!currentTask || !currentTask.department) return [];
    
    // Görevin gerektirdiği yetenekler
    const requiredSkills = departmentToSkillMap[currentTask.department] || [];
    
    // Görevin bölgesi
    const taskRegion = regions.find(r => r.value === currentTask.region)?.label || '';
    
    return volunteersData.filter(volunteer => {
      // Arama filtresi
      const matchesSearch = volunteerSearchText === '' || 
        `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(volunteerSearchText.toLowerCase()) ||
        volunteer.city.toLowerCase().includes(volunteerSearchText.toLowerCase());
      
      // Aktif durum kontrolü
      const isActive = volunteer.status === 'active';
      
      // En az bir kritere uymalı: ya lokasyon ya da yetenek
      const hasRequiredSkill = volunteer.skills.some(skill => 
        requiredSkills.includes(skill.category)
      );
      
      const isInSameRegion = volunteer.city.toLowerCase() === taskRegion.toLowerCase();
      
      return matchesSearch && isActive && (hasRequiredSkill || isInSameRegion);
    });
  };

  // Uygunluk puanı hesapla (0-100 arası)
  const calculateMatchScore = (volunteer: Volunteer) => {
    if (!currentTask || !currentTask.department) return 0;
    
    let score = 0;
    let maxScore = 0;
    
    // Görevin gerektirdiği yetenekler
    const requiredSkills = departmentToSkillMap[currentTask.department] || [];
    
    // Görevin bölgesi
    const taskRegion = regions.find(r => r.value === currentTask.region)?.label || '';
    
    // Yetenek puanı (60%)
    if (requiredSkills.length > 0) {
      maxScore += 60;
      
      // Her bir beceri kategorisi için en uygun beceriyi bul
      let skillScore = 0;
      for (const requiredCategory of requiredSkills) {
        const matchingSkills = volunteer.skills.filter(s => s.category === requiredCategory);
        
        if (matchingSkills.length > 0) {
          // En yüksek seviyeli beceriyi al
          const bestSkill = matchingSkills.sort((a, b) => {
            const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
            return levels[b.level] - levels[a.level];
          })[0];
          
          // Seviyeye göre puan ver
          switch (bestSkill.level) {
            case 'expert': skillScore += 15; break;
            case 'advanced': skillScore += 10; break;
            case 'intermediate': skillScore += 5; break;
            case 'beginner': skillScore += 2; break;
          }
        }
      }
      
      // Yetenek puanını normalize et (60 üzerinden)
      score += Math.min(60, (skillScore / (requiredSkills.length * 15)) * 60);
    }
    
    // Konum puanı (40%)
    maxScore += 40;
    if (volunteer.city.toLowerCase() === taskRegion.toLowerCase()) {
      score += 40; // Aynı şehir
    } else {
      // Farklı şehir ama aynı bölgede olabilir, daha detaylı konum analizi yapılabilir
      score += 0;
    }
    
    // Toplam puanı yüzdelik olarak döndür
    return Math.round((score / maxScore) * 100) || 0;
  };

  // Gönüllüleri uygunluk puanına göre sırala
  const getSortedVolunteers = () => {
    return getFilteredVolunteers().sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));
  };

  // Rolü kontrol ederek tüm bölgeleri görüntüleme yeteneği
  const canViewAllRegions = () => {
    return session?.user.role === 'admin';
  };
  
  // Bölge değiştiğinde filtreleme işlemi
  const handleRegionChange = (regionName: string) => {
    setSelectedRegion(regionName);
    applyFilters(regionName, searchText, statusFilter, priorityFilter);
  };
  
  // Arama, durum ve öncelik filtreleme işlemleri
  const applyFilters = (region: string | null, search: string, status: string, priority: string) => {
    let result = tasksData;
    
    // Bölge filtresi
    if (region && region !== 'all') {
      result = result.filter(task => task.region === region);
    }
    
    // Arama filtresi
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(searchLower) || 
          task.assignees.some(a => a.name.toLowerCase().includes(searchLower)) ||
          task.department?.toLowerCase().includes(searchLower)
      );
    }
    
    // Durum filtresi
    if (status !== 'all') {
      result = result.filter(task => task.status === status);
    }
    
    // Öncelik filtresi
    if (priority !== 'all') {
      result = result.filter(task => task.priority === priority);
    }
    
    setFilteredTasks(result);
  };
  
  // Arama işlemi
  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(selectedRegion, value, statusFilter, priorityFilter);
  };
  
  // Durum filtresi değişimi
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(selectedRegion, searchText, value, priorityFilter);
  };
  
  // Öncelik filtresi değişimi
  const handlePriorityChange = (value: string) => {
    setPriorityFilter(value);
    applyFilters(selectedRegion, searchText, statusFilter, value);
  };
  
  // Yeni görev ekleme modalı
  const showModal = () => {
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  const handleSubmit = (values: any) => {
    console.log('Yeni görev:', values);
    // API entegrasyonu burada olacak
    setIsModalVisible(false);
  };

  // Teslim tutanağı gösterme fonksiyonu
  const showTeslimTutanagi = (task: TaskType) => {
    setCurrentTaskForTeslim(task);
    setTeslimTutanagiVisible(true);
  };

  if (sessionStatus === "loading") {
    return <div>Yükleniyor...</div>;
  }

  // Kullanıcının bölgesi, API'den alınacak, şimdilik ilk bölgeyi varsayalım
  const userRegion = "Marmara Bölgesi";
  
  // Admin dışındaki roller için bölge kısıtlaması uygula
  useEffect(() => {
    if (!canViewAllRegions()) {
      setSelectedRegion(userRegion);
      applyFilters(userRegion, searchText, statusFilter, priorityFilter);
    }
  }, []);

  // Modal content
  const modalContent = (
    <Modal
      title="Yeni Görev Ekle"
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Görev Başlığı"
              rules={[{ required: true, message: 'Lütfen görev başlığını girin' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Öncelik"
              rules={[{ required: true, message: 'Lütfen öncelik seçin' }]}
            >
              <Select>
                <Select.Option value="high">Yüksek</Select.Option>
                <Select.Option value="medium">Orta</Select.Option>
                <Select.Option value="low">Düşük</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ required: true, message: 'Lütfen görev açıklamasını girin' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Durum"
              rules={[{ required: true, message: 'Lütfen durum seçin' }]}
            >
              <Select>
                <Select.Option value="pending">Beklemede</Select.Option>
                <Select.Option value="in-progress">Devam Ediyor</Select.Option>
                <Select.Option value="completed">Tamamlandı</Select.Option>
                <Select.Option value="cancelled">İptal Edildi</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="region"
              label="Bölge"
              rules={[{ required: true, message: 'Lütfen bölge seçin' }]}
            >
              <Select>
                {regions.map(region => (
                  <Select.Option key={region.value} value={region.value}>
                    {region.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateRange"
              label="Tarih Aralığı"
              rules={[{ required: true, message: 'Lütfen tarih aralığını seçin' }]}
            >
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="assignees"
              label="Atananlar"
              rules={[{ required: true, message: 'Lütfen en az bir kişi seçin' }]}
            >
              <Select mode="multiple" placeholder="Kişi seç">
                {personnelData.map(person => (
                  <Select.Option key={person.id} value={person.id}>
                    {person.name} ({person.department})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit">
              Kaydet
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <AppstoreAddOutlined />
          Tüm Görevler
        </span>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Görev Adı',
              dataIndex: 'title',
              key: 'title',
              render: (text, record) => (
                <Space direction="vertical">
                  <Text strong>{text}</Text>
                  <Text type="secondary">{record.description}</Text>
                </Space>
              )
            },
            {
              title: 'Durum',
              dataIndex: 'status',
              key: 'status',
              render: (status) => getStatusTag(status)
            },
            {
              title: 'Öncelik',
              dataIndex: 'priority',
              key: 'priority',
              render: (priority) => getPriorityTag(priority)
            },
            {
              title: 'Bölge',
              dataIndex: 'region',
              key: 'region',
              render: (region) => getRegionName(region)
            },
            {
              title: 'İlerleme',
              dataIndex: 'progress',
              key: 'progress',
              render: (progress) => (
                <Progress percent={progress} size="small" />
              )
            },
            {
              title: 'Atananlar',
              dataIndex: 'assignees',
              key: 'assignees',
              render: (assignees) => (
                <Avatar.Group max={{ count: 3 }}>
                  {assignees.map((assignee: any) => (
                    <Tooltip key={assignee.id} title={assignee.name}>
                      <Avatar icon={<UserOutlined />} />
                    </Tooltip>
                  ))}
                </Avatar.Group>
              )
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewTask(record)}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditTask(record)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTask(record.id)}
                  />
                </Space>
              )
            }
          ]}
          dataSource={getFilteredTasks()}
          rowKey="id"
        />
      )
    },
    {
      key: 'my-tasks',
      label: (
        <span>
          <UserOutlined />
          Görevlerim
        </span>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Görev Adı',
              dataIndex: 'title',
              key: 'title',
              render: (text, record) => (
                <Space direction="vertical">
                  <Text strong>{text}</Text>
                  <Text type="secondary">{record.description}</Text>
                </Space>
              )
            },
            {
              title: 'Durum',
              dataIndex: 'status',
              key: 'status',
              render: (status) => getStatusTag(status)
            },
            {
              title: 'Öncelik',
              dataIndex: 'priority',
              key: 'priority',
              render: (priority) => getPriorityTag(priority)
            },
            {
              title: 'Bölge',
              dataIndex: 'region',
              key: 'region',
              render: (region) => getRegionName(region)
            },
            {
              title: 'İlerleme',
              dataIndex: 'progress',
              key: 'progress',
              render: (progress) => (
                <Progress percent={progress} size="small" />
              )
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewTask(record)}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditTask(record)}
                  />
                </Space>
              )
            }
          ]}
          dataSource={getFilteredTasks().filter(task => 
            task.assignees.some(assignee => assignee.id === session?.user?.id)
          )}
          rowKey="id"
        />
      )
    },
    {
      key: 'teams',
      label: (
        <span>
          <TeamOutlined />
          Ekipler
        </span>
      ),
      children: (
        <List
          dataSource={getFilteredTasks().filter(task => task.team)}
          renderItem={task => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewTask(task)}
                />,
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditTask(task)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<TeamOutlined />} />}
                title={<Text strong>{task.title}</Text>}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">{task.description}</Text>
                    <Space>
                      <Tag color="blue">{task.team?.name}</Tag>
                      <Tag color="green">{task.team?.leader?.name}</Tag>
                      <Text type="secondary">{task.team?.members.length} üye</Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <Title level={2}>Görev Yönetimi</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            Yeni Görev Ekle
        </Button>
          <Dropdown 
            menu={{ 
              items: [
                {
                  key: '1',
                  label: 'Görev Grubu Oluştur',
                  icon: <AppstoreAddOutlined />,
                  onClick: () => {
                    showModal();
                    setTimeout(() => {
                      form.setFieldsValue({ isTaskGroup: true });
                      setIsTaskGroupModalVisible(true);
                    }, 100);
                  }
                },
                {
                  key: '2',
                  label: 'Ekipli Görev Oluştur',
                  icon: <TeamOutlined />,
                  onClick: () => {
                    showModal();
                    setTimeout(() => {
                      setIsTeamAssignModalVisible(true);
                    }, 100);
                  }
                },
                {
                  key: '3',
                  label: 'Ekipman/Envanter ile Görev',
                  icon: <ToolOutlined />,
                  onClick: () => {
                    showModal();
                    setTimeout(() => {
                      setIsEquipmentAssignModalVisible(true);
                    }, 100);
                  }
                }
              ]
            }} 
            placement="bottomLeft"
          >
            <Button icon={<DownOutlined />}>Görev Tipleri</Button>
          </Dropdown>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="mb-6"
        items={tabItems}
      />

      {/* Modallar */}
      {modalContent}

      <Drawer
        title="Göreve Gönüllü Atama"
        width={700}
        open={volunteerDrawerVisible}
        onClose={() => setVolunteerDrawerVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setVolunteerDrawerVisible(false)}>İptal</Button>
            <Button type="primary" onClick={completeVolunteerAssignment}>
              Görevlendirmeyi Tamamla
            </Button>
          </Space>
        }
      >
        {currentTask && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Title level={4}>{currentTask.title}</Title>
              <Text>{currentTask.description}</Text>
              <Divider />
          <Row gutter={16}>
            <Col span={12}>
                  <EnvironmentOutlined /> <Text strong>Bölge:</Text>{' '}
                  <Tag color="blue">
                    {regions.find(r => r.value === currentTask.region)?.label}
                  </Tag>
            </Col>
            <Col span={12}>
                  <AlertOutlined /> <Text strong>Öncelik:</Text>{' '}
                  {getPriorityTag(currentTask.priority)}
            </Col>
          </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <TeamOutlined /> <Text strong>Departman:</Text>{' '}
                  <Tag color="purple">
                    {currentTask.department && currentTask.department.replace('-', ' ')}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Tarih:</Text>{' '}
                  <Text>{currentTask.startDate} - {currentTask.endDate}</Text>
                </Col>
              </Row>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Gönüllü ara (isim veya şehir)"
                prefix={<SearchOutlined />}
                onChange={e => setVolunteerSearchText(e.target.value)}
                style={{ marginBottom: 8 }}
                allowClear
              />
              
              <Alert
                message="Görev için uygun gönüllüler"
                description="Gönüllüler, görevin gerektirdiği yetenekler ve konum yakınlığına göre sıralanmıştır. Yüksek uyum puanına sahip gönüllüler listenin başında gösterilir."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              {getSortedVolunteers().length === 0 ? (
                <Empty description="Uygun gönüllü bulunamadı" />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={getSortedVolunteers()}
                  renderItem={volunteer => {
                    const matchScore = calculateMatchScore(volunteer);
                    
                    return (
                      <List.Item
                        actions={[
                          <Checkbox
                            checked={selectedVolunteers.includes(volunteer.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedVolunteers([...selectedVolunteers, volunteer.id]);
                              } else {
                                setSelectedVolunteers(selectedVolunteers.filter(id => id !== volunteer.id));
                              }
                            }}
                          >
                            Seç
                          </Checkbox>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge count={matchScore >= 80 ? '✓' : null} dot={matchScore >= 80} color="green">
                              <Avatar src={volunteer.profileImageUrl} icon={!volunteer.profileImageUrl && <UserOutlined />} />
                            </Badge>
                          }
                          title={
                            <Space>
                              <Text strong>{`${volunteer.firstName} ${volunteer.lastName}`}</Text>
                              <Tag color={
                                matchScore >= 80 ? 'green' : 
                                matchScore >= 50 ? 'blue' : 
                                matchScore >= 30 ? 'orange' : 
                                'default'
                              }>
                                {matchScore}% Uyumlu
                              </Tag>
                            </Space>
                          }
                          description={
                            <>
                              <div>
                                <EnvironmentOutlined /> {volunteer.city}
                                {volunteer.district && `, ${volunteer.district}`}
                              </div>
                              <div style={{ marginTop: 4 }}>
                                {volunteer.skills.map(skill => {
                                  const isRelevant = currentTask.department && 
                                    departmentToSkillMap[currentTask.department]?.includes(skill.category);
                                  
                                  return (
                                    <Tag 
                                      key={skill.id} 
                                      color={isRelevant ? 'blue' : 'default'}
                                    >
                                      {skill.name} ({skill.level})
                                    </Tag>
                                  );
                                })}
                              </div>
                            </>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="Teslim Tutanağı"
        open={teslimTutanagiVisible}
        onCancel={() => setTeslimTutanagiVisible(false)}
        width={1000}
        footer={null}
      >
        {currentTaskForTeslim && currentTaskForTeslim.team && currentTaskForTeslim.team.leader && (
          <TeslimTutanagi
            taskName={currentTaskForTeslim.title}
            taskId={currentTaskForTeslim.id}
            teamLead={{
              id: currentTaskForTeslim.team.leader.id,
              name: currentTaskForTeslim.team.leader.name,
              role: currentTaskForTeslim.team.leader.role,
              department: currentTaskForTeslim.team.leader.department || getDepartmentName(currentTaskForTeslim.department || '')
            }}
            equipment={currentTaskForTeslim.assignedEquipment}
            inventory={currentTaskForTeslim.assignedInventory}
            issuedBy="Sistem Yöneticisi"
            issuedDate={dayjs().format('DD.MM.YYYY')}
          />
        )}
      </Modal>
    </div>
  );
};

export default TasksPage; 