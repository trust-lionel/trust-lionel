# Patch 1: Add Events to FOOTER_LINKS in src/config.ts
with open('src/config.ts', 'r') as f:
    c = f.read()

# Add Events to footer links
c = c.replace(
    "{ name: 'Consulting', url: '/consulting' },\n]",
    "{ name: 'Consulting', url: '/consulting' },\n  { name: 'Events', url: '/events' },\n]"
)

with open('src/config.ts', 'w') as f:
    f.write(c)
print("config.ts FOOTER_LINKS updated")

# Patch 2: Add three new sameAs URLs to Layout.astro Person schema
with open('src/layouts/Layout.astro', 'r') as f:
    c = f.read()

c = c.replace(
    '"https://wordcards.co"',
    '"https://wordcards.co",\n        "https://about.lionelmosley.com",\n        "https://substack.com/@lionelmosley",\n        "https://lionelmosley.substack.com"'
)

with open('src/layouts/Layout.astro', 'w') as f:
    f.write(c)
print("Layout.astro sameAs updated")

# Patch 3: Add events to content.config.ts collection
with open('src/content.config.ts', 'r') as f:
    c = f.read()

# Add z import if needed and add events collection
old_import = "import { z, defineCollection } from 'astro:content'"
# Already imported, just add the events collection and schema

old_collections = "export const collections = {"
new_events_schema = """
const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eventDate: z.date(),
    eventTime: z.string(),
    eventFormat: z.enum(['Virtual', 'In-Person', 'Hybrid']),
    eventHost: z.string(),
    eventHostUrl: z.string().url(),
    eventRegistrationUrl: z.string().url(),
    eventStatus: z.enum(['upcoming', 'past']),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
})

"""

c = c.replace(old_collections, new_events_schema + old_collections)

# Add events to collections export
c = c.replace(
    "export const collections = { posts, projects }",
    "export const collections = { posts, projects, events }"
)
# Handle alternate export format
c = c.replace(
    "export const collections = {\n  posts,\n  projects,\n}",
    "export const collections = {\n  posts,\n  projects,\n  events,\n}"
)

with open('src/content.config.ts', 'w') as f:
    f.write(c)
print("content.config.ts updated")
