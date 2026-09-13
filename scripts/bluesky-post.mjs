// ============================================================
// scripts/bluesky-post.mjs
// Posts new journal entries to Bluesky
// Reads from https://trust-lionel.com/atom.xml
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE    = 'https://bsky.social'
const IDENTIFIER      = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD    = process.env.BLUESKY_APP_PASSWORD
const __dirname       = path.dirname(fileURLToPath(import.meta.url))
const FEED_URL        = 'https://trust-lionel.com/atom.xml'
const CACHE_FILE      = path.resolve(__dirname, '../cache/bluesky-posted.json')
const MAX_POST_LENGTH = 300
const DRY_RUN         = process.env.DRY_RUN === 'true'
const FETCH_TIMEOUT   = 15000
const MAX_RETRIES     = 3
const RETRY_DELAY_MS  = 5000
const UA              = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

// ── Credential validation ─────────────────────────────────────
if (!IDENTIFIER || !APP_PASSWORD) {
  console.error('✗ Missing BLUESKY_IDENTIFIER or BLUESKY_APP_PASSWORD')
  process.exit(1)
}

// ── Session store (module-level — avoids JWT in stack traces) ─
let SESSION = null

// ── URL validation — prevents SSRF ───────────────────────────
function isValidHttpUrl(str) {
  try {
    const u = new URL(str)
    if (!['https:', 'http:'].includes(u.protocol)) return false
    const h = u.hostname
    if (h === 'localhost') return false
    if (h === '127.0.0.1') return false
    if (h.startsWith('169.254')) return false  // AWS metadata
    if (h.startsWith('10.'))     return false  // RFC1918
    if (h.startsWith('192.168')) return false  // RFC1918
    if (h.startsWith('172.16'))  return false  // RFC1918
    return true
  } catch { return false }
}

// ── File name sanitization — prevents path traversal ─────────
function isSafeFilename(name) {
  return /^[a-zA-Z0-9_-]+\.(md|mdx|json)$/.test(name)
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
      console.warn(`  ⚠ ${label} — attempt ${attempt} failed: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`)
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
    }
  }
}

// ── Atom XML parser ───────────────────────────────────────────
function parseAtom(xml) {
  const entries = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const block = entryMatch[1]

    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.trim() ?? ''

    const url = block.match(/<link[^>]+href=["']([^"']+)["']/)?.[1]
      ?? block.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim()
      ?? ''

    const summary = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/<[^>]+>/g, '')
      ?.trim() ?? ''

    const categories = []
    const catRegex = /<category[^>]+term=["']([^"']+)["']/g
    let catMatch
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1])
    }

    // ── blueskyPost — practitioner voice field ──────────────
    const blueskyPostMatch = block.match(
      /<bluesky:post><!\[CDATA\[([\s\S]*?)\]\]><\/bluesky:post>/
    )
    const blueskyPost = blueskyPostMatch ? blueskyPostMatch[1].trim() : null

    if (url && isValidHttpUrl(url)) entries.push({ title, url, summary, blueskyPost, categories })
  }

  return entries
}

// ── Fetch Atom feed ───────────────────────────────────────────
async function fetchFeed() {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': UA },
    signal : AbortSignal.timeout(FETCH_TIMEOUT),
  })
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
  const xml = await res.text()
  return parseAtom(xml)
}

// ── Bluesky auth ──────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
    signal : AbortSignal.timeout(FETCH_TIMEOUT),
  })
  // Never log response body on auth endpoints
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  SESSION = await res.json()
  return SESSION
}

// ── Build post text ───────────────────────────────────────────
function buildPostText({ title, summary, url, categories }) {
  const hashtags = categories
    .map(c => '#' + c.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 4)
    .join(' ')

  const prefix       = `New on ahr-ki-tekt Design Journal:\n\n${title}\n\n`
  const suffix       = `\n\n${hashtags}\n\n${url}`
  const withSummary  = (() => {
    const available = MAX_POST_LENGTH - prefix.length - suffix.length
    if (available <= 0) return null
    const trimmed = summary.length > available
      ? summary.slice(0, available - 1) + '…'
      : summary
    return `${prefix}${trimmed}${suffix}`
  })()

  const withoutSummary = `${prefix}${suffix}`

  if (withSummary && withSummary.length <= MAX_POST_LENGTH) return withSummary
  if (withoutSummary.length <= MAX_POST_LENGTH) return withoutSummary

  // Last resort — truncate title
  const budget = MAX_POST_LENGTH - suffix.length - 'New on ahr-ki-tekt Design Journal:\n\n'.length - 1
  return `New on ahr-ki-tekt Design Journal:\n\n${title.slice(0, budget)}…${suffix}`
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
    const ogDesc  = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? ''
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? ''

    if (!ogImage || !isValidHttpUrl(ogImage)) return null

    const imgRes  = await fetch(ogImage, {
      headers: { 'User-Agent': UA },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!imgRes.ok) return null

    const imgBuf  = await imgRes.arrayBuffer()
    const imgType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    if (!imgType.startsWith('image/')) return null
    if (imgBuf.byteLength > 976 * 1024) {
      console.log(`  ⚠ Image too large (${Math.round(imgBuf.byteLength / 1024)}KB) — skipping`)
      return null
    }

    const uploadRes = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${SESSION.accessJwt}`,
        'Content-Type' : imgType,
      },
      body  : imgBuf,
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })

    if (!uploadRes.ok) return null
    const { blob } = await uploadRes.json()
    return { blob, title: ogTitle, description: ogDesc }
  } catch {
    return null
  }
}

// ── Create Bluesky post ───────────────────────────────────────
async function createPost(entry) {
  // Use blueskyPost verbatim — practitioner voice, no generation
  const text   = entry.blueskyPost
  const facets = buildFacets(text, entry.url)
  const thumb  = await fetchThumb(entry.url)

  const record = {
    $type    : 'app.bsky.feed.post',
    text,
    facets,
    createdAt: new Date().toISOString(),
    langs    : ['en'],
  }

  if (thumb) {
    record.embed = {
      $type   : 'app.bsky.embed.external',
      external: {
        uri        : entry.url,
        title      : thumb.title || entry.title,
        description: thumb.description,
        thumb      : thumb.blob,
      },
    }
  }

  if (DRY_RUN) {
    console.log(`  DRY RUN — would post (${text.length} chars):`)
    console.log(`---\n${text}\n---`)
    console.log(`  Embed card: ${thumb ? '✓ image found' : '✗ no image'}`)
    console.log(`  URL: ${entry.url}`)
    console.log(`  Source: blueskyPost frontmatter field`)
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
  console.log(`✓ Posted: ${entry.title}`)
  console.log(`  ${result.uri}`)
  return result.uri
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt → Bluesky | Starting run...')

  const cache   = loadCache()
  const entries = await withRetry(fetchFeed, 'Feed fetch')
  await withRetry(createSession, 'Auth')

  console.log(`Feed entries found: ${entries.length}`)
  console.log(`Cache entries: ${Object.keys(cache).length}`)

  let posted = 0

  for (const entry of entries) {
    // Skip if already posted
    if (!entry.url || cache[entry.url]?.uri) continue

    // Skip if no blueskyPost field — practitioner voice required
    if (!entry.blueskyPost) {
      console.log(`  ↳ No blueskyPost field — skipping: ${entry.url}`)
      continue
    }

    // Enforce 300 character limit before attempting to post
    if (entry.blueskyPost.length > MAX_POST_LENGTH) {
      console.error(`  ✗ blueskyPost exceeds 300 chars (${entry.blueskyPost.length}) — skipping`)
      console.error(`    Trim the blueskyPost field in the post frontmatter before this will publish.`)
      continue
    }

    try {
      const uri = await withRetry(() => createPost(entry), `Post: ${entry.url}`)

      cache[entry.url] = {
        postedAt: new Date().toISOString(),
        uri,
      }

      // Write cache immediately after each successful post
      saveCache(cache)
      posted++

      if (posted < entries.length) {
        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err) {
      console.error(`✗ Failed after ${MAX_RETRIES} attempts: ${entry.url}`)
      console.error(err.message)
    }
  }

  saveCache(cache)
  console.log(`Done. ${posted} new post(s) published.`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
