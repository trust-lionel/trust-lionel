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
const DRY_RUN        = process.env.DRY_RUN === 'true'
const FETCH_TIMEOUT  = 15000
const MAX_RETRIES    = 3
const RETRY_DELAY_MS = 5000
const UA             = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

// ── Credential validation ─────────────────────────────────────
if (!IDENTIFIER || !APP_PASSWORD) {
  console.error('✗ Missing BLUESKY_IDENTIFIER or BLUESKY_APP_PASSWORD')
  process.exit(1)
}

// ── Session store ─────────────────────────────────────────────
let SESSION = null

// ── URL validation — prevents SSRF ───────────────────────────
function isValidHttpUrl(str) {
  try {
    const u = new URL(str)
    if (!['https:', 'http:'].includes(u.protocol)) return false
    const h = u.hostname
    if (h === 'localhost') return false
    if (h === '127.0.0.1') return false
    if (h.startsWith('169.254')) return false
    if (h.startsWith('10.'))     return false
    if (h.startsWith('192.168')) return false
    if (h.startsWith('172.16'))  return false
    return true
  } catch { return false }
}

// ── Tech stack → Bluesky hashtag map ─────────────────────────
const TECH_HASHTAG_MAP = {
  'Swift'          : '#Apple',
  'SwiftUI'        : '#Apple',
  'macOS'          : '#macOS',
  'Xcode'          : '#Apple',
  'Node.js'        : '#DevOps',
  'JavaScript'     : '#DevOps',
  'TypeScript'     : '#DevOps',
  'Python'         : '#DevOps',
  'Astro'          : '#DevOps',
  'Netlify'        : '#DevOps',
  'Markdown'       : '#OpenSource',
  'PWA'            : '#Tech',
  'ArcGIS'         : '#Tech',
  'Shopify'        : '#SaaS',
  'Windows Service': '#Tech',
  'C#'             : '#DevOps',
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
      if (!/^[a-zA-Z0-9_-]+$/.test(d)) return false // Safe directory name check
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
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    } catch {
      console.error('✗ Cache file corrupt — starting fresh')
      return {}
    }
  }
  return {}
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ── Retry wrapper ─────────────────────────────────────────────
async function withRetry(fn, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err
      console.warn(`  ⚠ ${label} — attempt ${attempt} failed: ${err.message}. Retrying...`)
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
    }
  }
}

// ── Build hashtags from techStack ─────────────────────────────
function buildHashtags(techStack) {
  if (!techStack || !Array.isArray(techStack)) return '#AI #Tech #OpenSource'
  const mapped = techStack.map(t => TECH_HASHTAG_MAP[t]).filter(Boolean)
  const unique = [...new Set(mapped)]
  if (!unique.includes('#AI')) unique.unshift('#AI')
  return unique.slice(0, 4).join(' ')
}

// ── Build post text ───────────────────────────────────────────
function buildPostText(project) {
  const hashtags = buildHashtags(project.techStack)
  const version  = project.version ? ` ${project.version}` : ''
  const url      = project.website ?? project.githubUrl ?? 'https://trust-lionel.com/projects'

  const prefix    = `New on ahr-ki-tekt Projects:\n\n${project.name}${version}\n\n`
  const suffix    = `\n\n${hashtags}\n\n${url}`
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

// ── Fetch OG image and upload blob ───────────────────────────
async function fetchThumb(url) {
  try {
    if (!isValidHttpUrl(url)) return null

    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return null
    const html = await res.text()

    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
                 ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
                 ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? ''
    const ogDesc  = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? ''

    if (!ogImage || !isValidHttpUrl(ogImage)) return null

    const imgRes  = await fetch(ogImage, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(FETCH_TIMEOUT) })
    if (!imgRes.ok) return null
    const imgBuf  = await imgRes.arrayBuffer()
    const imgType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    if (!imgType.startsWith('image/')) return null
    if (imgBuf.byteLength > 976 * 1024) {
      console.log(`  ⚠ Image too large — skipping`)
      return null
    }

    const uploadRes = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${SESSION.accessJwt}`, 'Content-Type': imgType },
      body   : imgBuf,
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })

    if (!uploadRes.ok) return null
    const { blob } = await uploadRes.json()
    return { blob, title: ogTitle, description: ogDesc }
  } catch {
    return null
  }
}

// ── Bluesky auth ──────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
    signal : AbortSignal.timeout(FETCH_TIMEOUT),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  SESSION = await res.json()
  return SESSION
}

// ── Create Bluesky post ───────────────────────────────────────
async function createPost(text, url, thumb) {
  const facets = buildFacets(text, url)
  const record = {
    $type    : 'app.bsky.feed.post',
    text,
    facets,
    createdAt: new Date().toISOString(),
    langs    : ['en'],
  }

  // Image is mandatory — thumb must be non-null before calling this function
  record.embed = {
    $type   : 'app.bsky.embed.external',
    external: {
      uri        : url,
      title      : thumb.title       || '',
      description: thumb.description || '',
      thumb      : thumb.blob,
    },
  }

  if (DRY_RUN) {
    console.log(`  DRY RUN — would post (${text.length} chars):`)
    console.log(`---\n${text}\n---`)
    console.log(`  Embed card: ✓ image confirmed`)
    console.log(`  URL: ${url}`)
    return 'dry-run-uri'
  }

  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.createRecord`, {
    method : 'POST',
    headers: {
      'Authorization': `Bearer ${SESSION.accessJwt}`,
      'Content-Type' : 'application/json',
    },
    body  : JSON.stringify({
      repo      : SESSION.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  })

  if (!res.ok) throw new Error(`Post failed: ${res.status}`)
  const result = await res.json()
  console.log(`  ✓ Posted: ${result.uri}`)
  return result.uri
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt Projects → Bluesky | Starting run...')

  const projects = loadProjects()
  const cache    = loadCache()
  await withRetry(createSession, 'Auth')

  console.log(`Projects found: ${projects.length}`)

  let posted = 0

  for (const project of projects) {
    if (cache[project.id]?.announced) {
      const cachedVersion = cache[project.id]?.version
      if (!project.version || project.version === cachedVersion) {
        console.log(`  ${project.id}: already announced — skipping`)
        continue
      }
      console.log(`  ${project.id}: version update ${cachedVersion} → ${project.version}`)
    }

    try {
      const { text, url } = buildPostText(project)

      // Fetch OG image — mandatory per specification
      const thumbUrl = project.website ?? project.githubUrl ?? null
      if (!thumbUrl || !isValidHttpUrl(thumbUrl)) {
        console.error(`  ✗ No valid URL for OG image fetch — ${project.id} skipped`)
        continue
      }

      console.log(`  Fetching OG image from ${thumbUrl}...`)
      const thumb = await fetchThumb(thumbUrl)

      if (!thumb) {
        console.error(`  ✗ No OG image found for ${project.id} — skipping`)
        console.error(`    Post will not be published without a social sharing image`)
        continue
      }

      console.log(`  ✓ OG image found`)
      const uri = await withRetry(() => createPost(text, url, thumb), `Post ${project.id}`)

      cache[project.id] = {
        announced: true,
        version  : project.version ?? null,
        postedAt : new Date().toISOString(),
        uri,
      }

      // Write cache immediately after each successful post
      if (!DRY_RUN) saveCache(cache)
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
  console.error(err.message)
  process.exit(1)
})
