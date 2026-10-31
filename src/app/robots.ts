import { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chakribakri.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
      disallow: ['/dashboard', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
};

export default robots;
