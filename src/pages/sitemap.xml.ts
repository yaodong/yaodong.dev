import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, postSlug, postDatePrefix } from '../lib/site';

// Hand-rolled to preserve the exact /sitemap.xml URL referenced by robots.txt
// (the @astrojs/sitemap integration emits /sitemap-index.xml instead).
export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => a.data.created_date.valueOf() - b.data.created_date.valueOf()
  );

  const postUrls = posts.map((p) => ({
    loc: `${SITE.url}/${postSlug(p.id)}/`,
    lastmod: `${postDatePrefix(p.id)}T00:00:00+00:00`,
  }));

  const pageUrls = [
    `${SITE.url}/about/`,
    `${SITE.url}/archive/`,
    `${SITE.url}/`,
    `${SITE.url}/useful-links/`,
    `${SITE.url}/projects/`,
  ].map((loc) => ({ loc, lastmod: null as string | null }));

  const urls = [...postUrls, ...pageUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `<url>\n<loc>${u.loc}</loc>${u.lastmod ? `\n<lastmod>${u.lastmod}</lastmod>` : ''}\n</url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
