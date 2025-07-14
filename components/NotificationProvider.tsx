'use client';

import React, { createContext, useContext, useState } from 'react';
import { notification } from 'antd';

interface NotificationContextType {
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => {
    api[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 