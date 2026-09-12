// ============================================================
// src/pages/projects.json.js
// Static JSON endpoint — pre-rendered at build time
// Accessible at: https://trust-lionel.com/projects.json
// ============================================================

import { getCollection } from 'astro:content'
import { SITE } from '~/config'

export const prerender = true

export async function GET() {
  const allProjects = await getCollection('projects')

  const projects = allProjects
    .filter((project) => !project.data.draft)
    .map((project) => ({
      id: project.id,
      name: project.data.name,
      description: project.data.description,
      githubUrl: project.data.githubUrl ?? null,
      website: project.data.website ?? null,
      type: project.data.type ?? null,
      star: project.data.star ?? 0,
      fork: project.data.fork ?? 0,
      version: project.data.version ?? null,
      status: project.data.status ?? 'active',
      lastUpdated: project.data.lastUpdated?.toISOString() ?? null,
      techStack: project.data.techStack ?? [],
      url: `${SITE.website}/projects`,
    }))
    .filter((project) => project.status !== 'archived')
    .sort((a, b) => a.name.localeCompare(b.name))

  return new Response(JSON.stringify(projects, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
