// src/content.config.ts
// Astro v6 content collection config.
// Uses the glob() loader — required in v6 (legacy src/content/config.ts removed).

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Lionel Mosley'),
    tags: z.array(z.string()).default([]),
    og_image: z.string().optional(),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    image_alt: z.string().optional(),
  }),
});

export const collections = { blog };
