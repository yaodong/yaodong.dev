import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { SITE, postSlug } from '../lib/site';

// Served at /feed.xml to preserve the URL that jekyll-feed used (subscribers
// keep working). Full post content is included, matching jekyll-feed.
export const GET: APIRoute = async (context) => {
  const container = await AstroContainer.create();

  const posts = (await getCollection('blog'))
    .sort((a, b) => b.data.created_date.valueOf() - a.data.created_date.valueOf())
    .slice(0, 10);

  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const content = await container.renderToString(Content);
    items.push({
      title: post.data.title,
      pubDate: post.data.created_date,
      description: post.data.excerpt ?? '',
      link: `/${postSlug(post.id)}/`,
      content,
    });
  }

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: true,
    items,
  });
};
