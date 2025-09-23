/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
    },
    
    // Enable React strict mode
    reactStrictMode: true,
    
    // Configure image domains (if using external images)
    images: {
      domains: ['localhost'],
      unoptimized: process.env.NODE_ENV === 'production' ? false : true,
    },
    
    // Environment variables that should be available at build time
    env: {
      // Add environment variables here if needed
    },
    
    // Webpack configuration for handling file uploads and dependencies
    webpack: (config, { isServer }) => {
      // Handle file uploads
      config.module.rules.push({
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/images/',
              outputPath: 'static/images/',
              name: '[name]-[hash].[ext]',
            },
          },
        ],
      });
  
      // Important: return the modified config
      return config;
    },
    
    // Headers configuration (API routes and security)
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || 'http://localhost:3000' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
          ],
        },
      ];
    },
    
    // RTL support configuration
    i18n: {
      locales: ['ar'],
      defaultLocale: 'ar',
    },
    
    // Output file tracing for production (reduces bundle size)
    output: 'standalone',
    
    // Enable SWC minification (faster builds)
    swcMinify: true,
    
    // Compiler options
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === 'production' ? {
        exclude: ['error', 'warn'],
      } : false,
    },
    
    // Custom page extensions
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  }
  
  // Development-specific configuration
  if (process.env.NODE_ENV === 'development') {
    nextConfig.experimental = {
      ...nextConfig.experimental,
      // Enable more verbose logging in development
      serverComponentsExternalPackages: ['bcryptjs', '@prisma/client', 'multer'],
    }
  }
  
  // Production-specific configuration
  if (process.env.NODE_ENV === 'production') {
    nextConfig.compiler = {
      ...nextConfig.compiler,
      reactRemoveProperties: { properties: ['^data-testid$'] },
    }
  }
  
  module.exports = nextConfig