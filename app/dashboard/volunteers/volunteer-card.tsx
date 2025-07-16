import React from 'react';
import { Card, Avatar, Tag, Typography, Space, Button } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface VolunteerCardProps {
  volunteer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    skills: string[];
    availability: string;
    avatar?: string;
    lastActive?: string;
  };
  onSelect?: (id: string) => void;
}

const VolunteerCard: React.FC<VolunteerCardProps> = ({ volunteer, onSelect }) => {
  return (
    <Card
      hoverable
      variant="outlined"
      style={{ marginBottom: 16 }}
      actions={[
        <Button key="select" type="primary" onClick={() => onSelect && onSelect(volunteer.id)}>
          Görevlendir
        </Button>,
        <Button key="view" type="link">
          Profili Görüntüle
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar 
          size={64} 
          src={volunteer.avatar} 
          icon={<UserOutlined />} 
          style={{ marginRight: 16 }}
        />
        <div>
          <Title level={5} style={{ marginBottom: 4 }}>{volunteer.name}</Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text><MailOutlined style={{ marginRight: 8 }} />{volunteer.email}</Text>
            <Text><PhoneOutlined style={{ marginRight: 8 }} />{volunteer.phone}</Text>
            <Text><EnvironmentOutlined style={{ marginRight: 8 }} />{volunteer.location}</Text>
            <Text><CalendarOutlined style={{ marginRight: 8 }} />{volunteer.availability}</Text>
          </Space>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong>Yetenekler:</Text>
        </div>
        <div>
          {volunteer.skills.map((skill, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>{skill}</Tag>
          ))}
        </div>
      </div>
      {volunteer.lastActive && (
        <div style={{ marginTop: 16, fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
          Son aktif: {volunteer.lastActive}
        </div>
      )}
    </Card>
  );
};

export default VolunteerCard; 