import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			canonicalUrl: z.string().url().optional(),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		repo: z.string().url().optional(),
		demo: z.string().url().optional(),
		technologies: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		sortOrder: z.number().default(99),
		status: z.enum(['active', 'complete', 'archived']).default('active'),
	}),
});

export const collections = { blog, projects };
