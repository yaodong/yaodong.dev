import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Posts sort and display by created_date (ISO 8601 w/ time), NOT the filename date.
    created_date: z.coerce.date(),
    updated_date: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z
      .union([
        z.string(),
        z.object({ name: z.string(), url: z.string().optional() }),
      ])
      .optional(),
  }),
});

export const collections = { blog };
