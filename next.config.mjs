/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi', 'ar', 'ru'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  async rewrites() {
    return [
      {
        source: '/:locale(en|es|fr|de|it|pt|ja|ko|zh|hi|ar|ru)/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
