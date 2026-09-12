// ============================================================
// scripts/bluesky-projects.mjs
// Posts project announcements to Bluesky
// Reads directly from src/content/projects/*/index.mdx
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE   = 'https://bsky.social'
const IDENTIFIER     = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD   = process.env.BLUESKY_APP_PASSWORD
const __dirname      = path.dirname(fileURLToPath(import.meta.url))
const PROJECTS_DIR   = path.resolve(__dirname, '../src/content/projects')
const CACHE_FILE     = path.resolve(__dirname, '../cache/bluesky-projects.json')
const MAX_LENGTH     = 300

// ── Tech stack → Bluesky hashtag map ─────────────────────────
const TECH_HASHTAG_MAP = {
  'Swift'         : '#Apple',
  'SwiftUI'       : '#Apple',
  'macOS'         : '#macOS',
  'Xcode'         : '#Apple',
  'Node.js'       : '#DevOps',
  'JavaScript'    : '#DevOps',
  'TypeScript'    : '#DevOps',
  'Python'        : '#DevOps',
  'Astro'         : '#DevOps',
  'Netlify'       : '#DevOps',
  'Markdown'      : '#OpenSource',
  'PWA'           : '#Tech',
  'ArcGIS'        : '#Tech',
  'Shopify'       : '#SaaS',
  'Windows Service': '#Tech',
  'C#'            : '#DevOps',
}

// ── Minimal YAML frontmatter parser ──────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const yaml = match[1]
  const data = {}

  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key   = line.slice(0, colonIdx).trim()
    let   value = line.slice(colonIdx + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }

    data[key] = value
  }

  return data
}

// ── Load all active projects ──────────────────────────────────
function loadProjects() {
  const dirs = fs.readdirSync(PROJECTS_DIR)
    .filter(d => {
      const full = path.join(PROJECTS_DIR, d)
      return fs.statSync(full).isDirectory()
    })

  return dirs.map(dir => {
    const mdxPath = path.join(PROJECTS_DIR, dir, 'index.mdx')
    const mdPath  = path.join(PROJECTS_DIR, dir, 'index.md')
    const file    = fs.existsSync(mdxPath) ? mdxPath : mdPath

    if (!fs.existsSync(file)) return null

    const content = fs.readFileSync(file, 'utf8')
    const data    = parseFrontmatter(content)
    return { id: dir, ...data }
  })
  .filter(p => p && p.status !== 'archived' && !p.draft)
}

// ── Load / save cache ─────────────────────────────────────────
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  }
  return {}
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ── Build hashtags from techStack ─────────────────────────────
function buildHashtags(techStack) {
  if (!techStack || !Array.isArray(techStack)) return '#AI #Tech #OpenSource'
  const mapped = techStack
    .map(t => TECH_HASHTAG_MAP[t])
    .filter(Boolean)
  const unique = [...new Set(mapped)]
  if (!unique.includes('#AI')) unique.unshift('#AI')
  return unique.slice(0, 4).join(' ')
}

// ── Build post text ───────────────────────────────────────────
function buildPostText(project) {
  const hashtags  = buildHashtags(project.techStack)
  const version   = project.version ? ` ${project.version}` : ''
  const url       = project.website ?? project.githubUrl ?? 'https://trust-lionel.com/projects'

  const prefix  = `New on ahr-ki-tekt Projects:\n\n${project.name}${version}\n\n`
  const suffix  = `\n\n${hashtags}\n\n${url}`
  const available = MAX_LENGTH - prefix.length - suffix.length

  const desc    = project.description ?? ''
  const trimmed = desc.length > available
    ? desc.slice(0, available - 1) + '…'
    : desc

  return { text: `${prefix}${trimmed}${suffix}`, url }
}

// ── Build facets ──────────────────────────────────────────────
function buildFacets(text, url) {
  const facets  = []
  const encoder = new TextEncoder()

  const hashtagRegex = /#([a-zA-Z0-9]+)/g
  let match
  while ((match = hashtagRegex.exec(text)) !== null) {
    const start = encoder.encode(text.slice(0, match.index)).length
    const end   = encoder.encode(text.slice(0, match.index + match[0].length)).length
    facets.push({
      index   : { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }],
    })
  }

  const urlIndex = text.indexOf(url)
  if (urlIndex !== -1) {
    const start = encoder.encode(text.slice(0, urlIndex)).length
    const end   = encoder.encode(text.slice(0, urlIndex + url.length)).length
    facets.push({
      index   : { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    })
  }

  return facets
}

// ── Bluesky auth ──────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ── Post to Bluesky ───────────────────────────────────────────
async function createPost(session, text, url) {
  const facets = buildFacets(text, url)
  const record = {
    $type    : 'app.bsky.feed.post',
    text,
    facets,
    createdAt: new Date().toISOString(),
    langs    : ['en'],
  }

  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.createRecord`, {
    method : 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({
      repo      : session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  })

  if (!res.ok) throw new Error(`Post failed: ${res.status} ${await res.text()}`)
  const result = await res.json()
  console.log(`✓ Posted: ${result.uri}`)
  return result.uri
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt Projects → Bluesky | Starting run...')

  const projects = loadProjects()
  const cache    = loadCache()
  const session  = await createSession()

  console.log(`Projects found: ${projects.length}`)

  let posted = 0

  for (const project of projects) {
    // Skip if already announced
    if (cache[project.id]?.announced) {
      // Check for version update
      const cachedVersion = cache[project.id]?.version
      if (!project.version || project.version === cachedVersion) {
        console.log(`  ${project.id}: already announced — skipping`)
        continue
      }
      console.log(`  ${project.id}: version update ${cachedVersion} → ${project.version}`)
    }

    try {
      const { text, url } = buildPostText(project)
      const uri = await createPost(session, text, url)

      cache[project.id] = {
        announced: true,
        version  : project.version ?? null,
        postedAt : new Date().toISOString(),
        uri,
      }
      posted++

      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`  ✗ Failed ${project.id}: ${err.message}`)
    }
  }

  saveCache(cache)
  console.log(`Done. ${posted} project post(s) published.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
