'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ConfigProvider, notification, App } from 'antd';
import trTR from 'antd/locale/tr_TR';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 dakika
            gcTime: 10 * 60 * 1000, // 10 dakika (cacheTime yerine gcTime)
            refetchOnWindowFocus: false,
            retry: 1,
            onError: (error: any) => {
              console.error('Query error:', error);
            },
          },
        },
      })
  );

  // Antd React 19 uyumsuzluk uyarılarını bastır
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('antd v5 support React is 16 ~ 18')) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={trTR}
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <App>
          <SessionProvider>{children}</SessionProvider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
} 