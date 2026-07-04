import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { postSlug } from '../lib/site';

// Emits /<slug>.md for every post: the title as an H1 followed by the raw
// Markdown body (front matter already excluded by the content loader). This is
// the public, fetchable source that "View as Markdown" opens and that the
// Claude/ChatGPT prompts reference. It shares postSlug() with [...slug].astro,
// so a post and its .md twin always agree on the slug.
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: postSlug(post.id) },
    props: { title: post.data.title, body: post.body ?? '' },
  }));
}

export const GET: APIRoute<{ title: string; body: string }> = ({ props }) => {
  const { title, body } = props;
  const markdown = `# ${title}\n\n${body}`;
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
