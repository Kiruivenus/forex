import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/admin/', '/admin/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'Anthropic-ai',
          'Claude-Web',
          'ClaudeBot',
          'PerplexityBot',
          'Bytespider',
          'CCBot',
          'Googlebot',
          'Bingbot',
        ],
        allow: '/',
        disallow: ['/api/admin/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
