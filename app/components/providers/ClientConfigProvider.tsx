"use client";

import { useEffect } from "react";
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

// Typescript için tip tanımları
declare global {
  interface Element {
    _reactRoot?: ReturnType<typeof createRoot>;
  }
  
  interface DocumentFragment {
    _reactRoot?: ReturnType<typeof createRoot>;
  }
}

export default function ClientConfigProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // React 19 uyumluluğu için render fonksiyonunu ayarla
    unstableSetRender((node, container) => {
      container._reactRoot ||= createRoot(container);
      const root = container._reactRoot;
      root.render(node);
      return async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        root.unmount();
      };
    });
  }, []);

  return <>{children}</>;
} 