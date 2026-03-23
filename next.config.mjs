/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages: static HTML export
  output: 'export',

  images: {
    // static export에서는 Next.js Image 최적화 미지원 → unoptimized 필수
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
