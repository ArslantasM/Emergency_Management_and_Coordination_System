"use client";

import React, { useState } from "react";
import { Card, List, Tag, Progress } from "antd";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";

interface Task {
  id: string;
  title: string;
  priority: "yuksek" | "orta" | "dusuk";
  status: "bekliyor" | "devam_ediyor" | "tamamlandi";
  assignedTo: string;
  progress: number;
  deadline: string;
}

const DashboardTasks = () => {
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Arama ve Kurtarma - A Sektörü",
      priority: "yuksek",
      status: "devam_ediyor",
      assignedTo: "Alfa Ekibi",
      progress: 75,
      deadline: "2024-01-15"
    },
    {
      id: "2", 
      title: "Tıbbi Malzeme Dağıtımı",
      priority: "orta",
      status: "bekliyor",
      assignedTo: "Beta Ekibi",
      progress: 25,
      deadline: "2024-01-16"
    },
    {
      id: "3",
      title: "Tahliye Rotası Kurulumu",
      priority: "yuksek",
      status: "tamamlandi",
      assignedTo: "Gama Ekibi",
      progress: 100,
      deadline: "2024-01-14"
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "yuksek": return "red";
      case "orta": return "orange";
      case "dusuk": return "green";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "tamamlandi": return "green";
      case "devam_ediyor": return "blue";
      case "bekliyor": return "orange";
      default: return "default";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "yuksek": return "YÜKSEK";
      case "orta": return "ORTA";
      case "dusuk": return "DÜŞÜK";
      default: return priority.toUpperCase();
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "tamamlandi": return "TAMAMLANDI";
      case "devam_ediyor": return "DEVAM EDİYOR";
      case "bekliyor": return "BEKLİYOR";
      default: return status.toUpperCase();
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ClockCircleOutlined />
          Aktif Görevler
        </div>
      }
      size="small"
      style={{ minHeight: "300px" }}
    >
      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item
            key={task.id}
            style={{ 
              border: "1px solid #f0f0f0", 
              borderRadius: "8px", 
              marginBottom: "8px",
              padding: "12px"
            }}
          >
            <div style={{ width: "100%" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "8px"
              }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Tag color={getPriorityColor(task.priority)}>
                    {getPriorityText(task.priority)}
                  </Tag>
                  <Tag color={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Tag>
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <UserOutlined />
                  <span>{task.assignedTo}</span>
                </div>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  Son Tarih: {task.deadline}
                </span>
              </div>
              
              <Progress 
                percent={task.progress} 
                size="small"
                status={task.status === "tamamlandi" ? "success" : "active"}
              />
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DashboardTasks;
