import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de produção
  poweredByHeader: false, // Remove header X-Powered-By
  
  // Configurações de imagem (se usar next/image)
  images: {
    domains: [], // Adicione domínios permitidos aqui
    unoptimized: false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações de ambiente
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  
  // Experimental features (se necessário)
  experimental: {
    // Adicione features experimentais aqui se necessário
  },
};

export default nextConfig;
