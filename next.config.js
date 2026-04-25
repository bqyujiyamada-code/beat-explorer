/** @type {import('next').NextConfig} */
const nextConfig = {
  // パターンA: トップレベル（新しいNext.jsの指示）
  allowedDevOrigins: ['18.178.204.116'],
  
  // パターンB: 実験的機能（少し前のNext.jsの指示）
  experimental: {
    allowedDevOrigins: ['18.178.204.116'],
  },
};

module.exports = nextConfig;
