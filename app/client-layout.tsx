"use client";

import React from 'react';
import AuthSessionProvider from "./components/providers/SessionProvider";
import { NotificationProvider } from '@/components/NotificationProvider';
import ClientConfigProvider from "./components/providers/ClientConfigProvider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionProvider>
      <NotificationProvider>
        <ClientConfigProvider>
          {children}
        </ClientConfigProvider>
      </NotificationProvider>
    </AuthSessionProvider>
  );
} 