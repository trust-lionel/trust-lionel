// ============================================================
// scripts/bluesky-curated.mjs
// Posts curated industry content to Bluesky
// Runs twice daily — 11:30 AM CST and 6:30 PM CST
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE = 'https://bsky.social'
const IDENTIFIER   = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD
const __dirname    = path.dirname(fileURLToPath(import.meta.url))
const CACHE_FILE   = path.resolve(__dirname, '../cache/bluesky-curated.json')
const MAX_LENGTH   = 300

// ── Vetted sources — tiered by signal priority ───────────────
const SOURCES = [
  // Tier 1 — Security-critical, time-sensitive
  {
    tier       : 1,
    name       : 'Microsoft Security Response Center',
    shortName  : 'MSRC',
    feed       : 'https://msrc.microsoft.com/update-guide/rss',
    hashtags   : '#Microsoft #Cybersecurity #Tech',
    attribution: 2,
  },
  {
    tier       : 1,
    name       : 'NIST National Vulnerability Database',
    shortName  : 'NIST NVD',
    feed       : 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml',
    hashtags   : '#Cybersecurity #Tech #AI',
    attribution: 2,
  },
  {
    tier       : 1,
    name       : 'CISA',
    shortName  : 'CISA',
    feed       : 'https://www.cisa.gov/news.xml',
    hashtags   : '#Cybersecurity #AI #Tech',
    attribution: 2,
  },
  {
    tier       : 1,
    name       : 'Krebs on Security',
    shortName  : 'Krebs on Security',
    feed       : 'https://feeds.feedburner.com/KrebsOnSecurity',
    hashtags   : '#Cybersecurity #Tech #AI',
    attribution: 2,
  },

  // Tier 2 — Practitioner analysis
  {
    tier       : 2,
    name       : 'Dark Reading',
    shortName  : 'Dark Reading',
    feed       : 'https://www.darkreading.com/rss.xml',
    hashtags   : '#Cybersecurity #Tech #AI',
    attribution: 1,
  },
  {
    tier       : 2,
    name       : 'NIST',
    shortName  : 'NIST',
    feed       : 'https://www.nist.gov/news-events/news/rss.xml',
    hashtags   : '#AI #Tech #Cybersecurity',
    attribution: 1,
  },
  {
    tier       : 2,
    name       : 'AI Now Institute',
    shortName  : 'AI Now Institute',
    feed       : 'https://ainowinstitute.org/feed',
    hashtags   : '#AI #AIGovernance #Tech',
    attribution: 1,
  },
  {
    tier       : 2,
    name       : 'Stanford HAI',
    shortName  : 'Stanford HAI',
    feed       : 'https://hai.stanford.edu/news/rss.xml',
    hashtags   : '#AI #AIGovernance #Tech',
    attribution: 1,
  },

  // Tier 3 — Vendor intelligence
  {
    tier       : 3,
    name       : 'Microsoft Blog',
    shortName  : 'Microsoft',
    feed       : 'https://blogs.microsoft.com/feed/',
    hashtags   : '#Microsoft #AI #Tech',
    attribution: 3,
  },
  {
    tier       : 3,
    name       : 'Azure Blog',
    shortName  : 'Azure',
    feed       : 'https://azure.microsoft.com/en-us/blog/feed/',
    hashtags   : '#Microsoft #Tech #DevOps',
    attribution: 3,
  },
  {
    tier       : 3,
    name       : 'Microsoft Tech Community',
    shortName  : 'Microsoft Tech Community',
    feed       : 'https://techcommunity.microsoft.com/rss',
    hashtags   : '#Microsoft #Tech #DevOps',
    attribution: 3,
  },
  {
    tier       : 3,
    name       : 'AWS Blog',
    shortName  : 'AWS',
    feed       : 'https://aws.amazon.com/blogs/aws/feed/',
    hashtags   : '#Tech #DevOps #AI',
    attribution: 3,
  },
  {
    tier       : 3,
    name       : 'Google Cloud Release Notes',
    shortName  : 'Google Cloud',
    feed       : 'https://cloud.google.com/feeds/gcp-release-notes.xml',
    hashtags   : '#Tech #DevOps #AI',
    attribution: 3,
  },
]

// ── Attribution styles ────────────────────────────────────────
const ATTRIBUTION = {
  1: 'Essential insights for enterprise technology leaders:',
  2: 'A vital read for technology executives and business operators:',
  3: 'Highly relevant for technology stakeholders:',
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

// ── Minimal RSS/Atom XML parser ───────────────────────────────
function parseItems(xml) {
  const items  = []

  // Try RSS <item> blocks first
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const link  = extractTag(block, 'link') || extractAttr(block, 'link', 'href')
    const desc  = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || '')
    const date  = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated')
    if (title && link) items.push({ title, link, description: desc, date })
  }

  // Try Atom <entry> blocks if no RSS items found
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1]
      const title = extractTag(block, 'title')
      const link  = extractAttr(block, 'link', 'href') || extractTag(block, 'id')
      const desc  = stripHtml(extractTag(block, 'summary') || extractTag(block, 'content') || '')
      const date  = extractTag(block, 'published') || extractTag(block, 'updated')
      if (title && link) items.push({ title, link, description: desc, date })
    }
  }

  return items
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    || xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return match ? match[1].trim() : null
}

function extractAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i'))
  return match ? match[1].trim() : null
}

function stripHtml(html) {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Fetch a single feed ───────────────────────────────────────
async function fetchFeed(source) {
  try {
    const res = await fetch(source.feed, {
      headers: { 'User-Agent': 'ahr-ki-tekt-bot/1.0' },
      signal : AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      console.log(`  ⚠ ${source.shortName}: HTTP ${res.status}`)
      return []
    }
    const xml   = await res.text()
    const items = parseItems(xml)
    console.log(`  ${source.shortName}: ${items.length} items`)
    return items
  } catch (err) {
    console.log(`  ⚠ ${source.shortName}: ${err.message}`)
    return []
  }
}

// ── Build post text ───────────────────────────────────────────
function buildPostText(source, item) {
  const attribution = ATTRIBUTION[source.attribution]
  const byline      = `${item.title} — ${source.shortName}`
  const suffix      = `\n\n${source.hashtags}\n\n${item.link}`

  // Calculate available space for description
  const fixed     = `${attribution}\n\n${byline}\n\n`
  const available = MAX_LENGTH - fixed.length - suffix.length

  let desc = ''
  if (item.description && available > 20) {
    desc = item.description.length > available
      ? item.description.slice(0, available - 1) + '…'
      : item.description
    desc = '\n\n' + desc
  }

  return `${fixed}${desc}${suffix}`.trim()
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
  console.log(`  ✓ Posted: ${result.uri}`)
  return result.uri
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt Curated → Bluesky | Starting run...')

  const cache   = loadCache()
  const today   = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const session = await createSession()

  // Track how many posts this run (max 1 per run — fires twice daily = 2/day)
  const MAX_PER_RUN = 1
  let posted = 0

  // Sort sources by tier
  const sorted = [...SOURCES].sort((a, b) => a.tier - b.tier)

  for (const source of sorted) {
    if (posted >= MAX_PER_RUN) break

    // Skip if already posted from this source today
    if (cache[source.feed]?.lastPostedDate === today) {
      console.log(`  ${source.shortName}: already posted today — skipping`)
      continue
    }

    console.log(`Fetching ${source.shortName}...`)
    const items = await fetchFeed(source)

    if (items.length === 0) continue

    // Find first unposted item
    const postedUrls = new Set(
      Object.values(cache)
        .flatMap(s => s.postedUrls ?? [])
    )

    const candidate = items.find(item => !postedUrls.has(item.link))
    if (!candidate) {
      console.log(`  ${source.shortName}: no new items`)
      continue
    }

    try {
      const text = buildPostText(source, candidate)

      // Safety check — never exceed 300 chars
      if (text.length > MAX_LENGTH) {
        console.log(`  ⚠ ${source.shortName}: post too long (${text.length}) — skipping`)
        continue
      }

      console.log(`  Posting from ${source.shortName} (${text.length} chars)`)
      const uri = await createPost(session, text, candidate.link)

      // Update cache
      if (!cache[source.feed]) cache[source.feed] = { postedUrls: [] }
      cache[source.feed].lastPostedDate = today
      cache[source.feed].lastPostedAt   = new Date().toISOString()
      cache[source.feed].lastUri        = uri
      cache[source.feed].postedUrls     = [
        ...(cache[source.feed].postedUrls ?? []),
        candidate.link,
      ].slice(-50) // Keep last 50 URLs per source to prevent reposting

      posted++
      await new Promise(r => setTimeout(r, 2000))

    } catch (err) {
      console.error(`  ✗ ${source.shortName}: ${err.message}`)
    }
  }

  saveCache(cache)
  console.log(`Done. ${posted} curated post(s) published.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
