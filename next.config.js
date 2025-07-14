/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "antd", 
      "@ant-design/icons", 
      "react-leaflet", 
      "leaflet",
      "@tanstack/react-query",
      "moment"
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com https://unpkg.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://unpkg.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com https://api.mapbox.com",
              "connect-src 'self' https://api.mapbox.com https://events.mapbox.com ws: wss:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join("; ")
          }
        ]
      }
    ]
  },
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    if (dev && !isServer) {
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes("antd v5 support React is 16 ~ 18")) {
          return;
        }
        originalWarn.apply(console, args);
      };
    }
    
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          mapLibs: {
            test: /[\\/]node_modules[\\/](mapbox-gl|leaflet|react-leaflet|@mapbox)[\\/]/,
            name: "map-libs",
            chunks: "all",
            priority: 30,
          },
          antd: {
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            name: "antd",
            chunks: "all",
            priority: 20,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
};

const withBundleAnalyzer = process.env.ANALYZE === "true" 
  ? require("@next/bundle-analyzer")({ enabled: true })
  : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);
