// ============================================================
// scripts/bluesky-events.mjs
// Posts event lifecycle announcements to Bluesky
// Reads directly from src/content/events/*.md
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE  = 'https://bsky.social'
const IDENTIFIER    = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD  = process.env.BLUESKY_APP_PASSWORD
const __dirname     = path.dirname(fileURLToPath(import.meta.url))
const EVENTS_DIR    = path.resolve(__dirname, '../src/content/events')
const CACHE_FILE    = path.resolve(__dirname, '../cache/bluesky-events.json')
const SITE_URL      = 'https://trust-lionel.com'
const MAX_LENGTH    = 300
const DRY_RUN       = process.env.DRY_RUN === 'true'
const FETCH_TIMEOUT = 15000
const MAX_RETRIES   = 3
const RETRY_DELAY_MS = 5000
const UA            = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

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

// ── Lifecycle stages ──────────────────────────────────────────
const STAGES = [
  { key: 't7',    daysOffset: -7 },
  { key: 't2',    daysOffset: -2 },
  { key: 't1',    daysOffset: -1 },
  { key: 't0',    daysOffset:  0 },
  { key: 'recap', daysOffset:  1 },
]

// ── Hashtag map ───────────────────────────────────────────────
const HASHTAG_MAP = {
  'Entrepreneurship':       '#Entrepreneurs',
  'Small Business':         '#Tech',
  'Website Strategy':       '#AI',
  'Digital Transformation': '#Tech',
  'AI Governance':          '#AIGovernance',
  'Cybersecurity':          '#Cybersecurity',
  'Microsoft 365':          '#Microsoft',
  'Cloud Migration':        '#Tech',
  'Business Continuity':    '#Cybersecurity',
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

// ── Load all upcoming events ──────────────────────────────────
function loadEvents() {
  const files = fs.readdirSync(EVENTS_DIR)
    .filter(f => /^[a-zA-Z0-9_-]+\.(md|mdx)$/.test(f)) // Safe filename check

  return files.map(file => {
    const id      = file.replace(/\.(md|mdx)$/, '')
    const content = fs.readFileSync(path.join(EVENTS_DIR, file), 'utf8')
    const data    = parseFrontmatter(content)
    return { id, ...data }
  }).filter(e => e.eventStatus === 'upcoming' && e.eventDate)
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

// ── Timezone-aware days difference (UTC-normalized) ───────────
function daysDiff(dateStr) {
  // Normalize both dates to UTC midnight to avoid CDT/CST edge cases
  const nowUtc    = new Date()
  const todayUtc  = Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate())
  const parsed    = new Date(dateStr)
  const targetUtc = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  return Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24))
}

// ── Build hashtags ────────────────────────────────────────────
function buildHashtags(tags) {
  if (!tags || !Array.isArray(tags)) return '#AI #Tech'
  const mapped = tags.map(t => HASHTAG_MAP[t]).filter(Boolean).slice(0, 3)
  if (!mapped.includes('#AI')) mapped.unshift('#AI')
  return [...new Set(mapped)].slice(0, 4).join(' ')
}

// ── Trim to fit ───────────────────────────────────────────────
function trimToFit(str, available) {
  if (!str) return ''
  if (str.length <= available) return str
  return str.slice(0, available - 1) + '…'
}

// ── Build post text per lifecycle stage ───────────────────────
//
// Canonical formats:
//
// t7:  One week away:\n\n{title}\n\n{description}\n\n{hashtags}\n\n{url}
// t2:  {title} is in 2 days.\n\n{format}{date} · {time}\n\nHosted by {host}\n\n{hashtags}\n\n{url}
// t1:  {title} is tomorrow.\n\n{format}{date} · {time}\n\nHosted by {host}\n\n{hashtags}\n\n{url}
// t0:  Today on ahr-ki-tekt:\n\n{title} starts in a few hours.\n\n{format}{time}\n\nRegister now — limited seats.\n\n{hashtags}\n\n{url}
// recap: Thank you to everyone who joined us for:\n\n{title}\n\nHosted by {host}\n\n{hashtags}\n\n{url}
//
function buildPostText(event, stage) {
  const hashtags = buildHashtags(event.tags)
  const url      = event.eventPrimaryButtonUrl
    ?? event.eventRegistrationUrl
    ?? `${SITE_URL}/events/${event.id}`
  const format   = event.eventFormat ? `${event.eventFormat} · ` : ''
  const host     = event.eventHost   ? `Hosted by ${event.eventHost}` : ''
  const suffix   = `\n\n${hashtags}\n\n${url}`

  let text = ''

  switch (stage.key) {
    case 't7': {
      const fixed     = `One week away:\n\n${event.title}`
      const available = MAX_LENGTH - fixed.length - suffix.length - 2
      const desc      = trimToFit(event.description ?? '', available)
      text = `${fixed}${desc ? '\n\n' + desc : ''}${suffix}`
      break
    }
    case 't2': {
      text = `${event.title} is in 2 days.\n\n${format}${event.eventDate} · ${event.eventTime ?? ''}\n\n${host}${suffix}`
      break
    }
    case 't1': {
      text = `${event.title} is tomorrow.\n\n${format}${event.eventDate} · ${event.eventTime ?? ''}\n\n${host}${suffix}`
      break
    }
    case 't0': {
      text = `Today on ahr-ki-tekt:\n\n${event.title} starts in a few hours.\n\n${format}${event.eventTime ?? ''}\n\nRegister now — limited seats.${suffix}`
      break
    }
    case 'recap': {
      text = `Thank you to everyone who joined us for:\n\n${event.title}\n\n${host}${suffix}`
      break
    }
  }

  // Hard safety trim
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH - 1) + '…'
  }

  return { text, url }
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
    if (imgBuf.byteLength > 976 * 1024) return null

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

  // Always attach embed card — image is mandatory per specification
  // thumb must be non-null before calling this function
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
  console.log('ahr-ki-tekt Events → Bluesky | Starting run...')

  const events = loadEvents()
  const cache  = loadCache()
  await withRetry(createSession, 'Auth')

  console.log(`Events found: ${events.length}`)

  let posted = 0

  for (const event of events) {
    if (!cache[event.id]) cache[event.id] = {}

    const diff = daysDiff(event.eventDate)
    console.log(`  ${event.id}: ${diff} days from today (UTC-normalized)`)

    for (const stage of STAGES) {
      if (diff !== stage.daysOffset) continue

      if (cache[event.id][stage.key]?.posted) {
        console.log(`  ↳ ${stage.key} already posted — skipping`)
        continue
      }

      try {
        const { text, url } = buildPostText(event, stage)

        // Fetch OG image — mandatory per specification
        console.log(`  ↳ Fetching OG image for ${stage.key}...`)
        const thumb = await fetchThumb(url)

        if (!thumb) {
          console.error(`  ✗ No OG image found for ${event.id} stage ${stage.key} — skipping`)
          console.error(`    Post will not be published without a social sharing image`)
          continue
        }

        console.log(`  ↳ Posting ${stage.key} (${text.length} chars):`)
        console.log(`---\n${text}\n---`)

        const uri = await withRetry(() => createPost(text, url, thumb), `Post ${stage.key}`)

        cache[event.id][stage.key] = {
          posted  : true,
          postedAt: new Date().toISOString(),
          uri,
        }

        // Write cache immediately after each successful post
        if (!DRY_RUN) saveCache(cache)
        posted++

        await new Promise(r => setTimeout(r, 2000))
      } catch (err) {
        console.error(`  ✗ Failed ${stage.key} for ${event.id}: ${err.message}`)
      }
    }
  }

  saveCache(cache)
  console.log(`Done. ${posted} event post(s) published.`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
