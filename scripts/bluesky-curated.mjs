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

// ── Browser-like User-Agent to avoid bot blocks ───────────────
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

// ── Keyword filter ────────────────────────────────────────────
const KEYWORDS = [
  'microsoft', 'nist', 'zero trust', 'ai', 'cve', 'cloud',
  'identity', 'mfa', 'governance', 'cybersecurity', 'security',
  'vulnerability', 'ransomware', 'phishing', 'entra', 'azure',
  'defender', 'compliance', 'framework', 'infrastructure',
  'breach', 'incident', 'patch', 'update', 'advisory',
]

function matchesKeyword(title) {
  const lower = (title ?? '').toLowerCase()
  return KEYWORDS.some(kw => lower.includes(kw))
}

// ── Vetted sources — tiered by signal priority ───────────────
const SOURCES = [
  {
    tier: 1, name: 'Microsoft Security Response Center',
    shortName: 'MSRC', feed: 'https://msrc.microsoft.com/update-guide/rss',
    hashtags: '#Microsoft #Cybersecurity #Tech', attribution: 2, filterByKeyword: false,
  },
  {
    tier: 1, name: 'NIST National Vulnerability Database',
    shortName: 'NIST NVD', feed: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml',
    hashtags: '#Cybersecurity #Tech #AI', attribution: 2, filterByKeyword: false,
  },
  {
    tier: 1, name: 'CISA',
    shortName: 'CISA', feed: 'https://www.cisa.gov/news.xml',
    hashtags: '#Cybersecurity #AI #Tech', attribution: 2, filterByKeyword: false,
  },
  {
    tier: 1, name: 'Krebs on Security',
    shortName: 'Krebs on Security', feed: 'https://feeds.feedburner.com/KrebsOnSecurity',
    hashtags: '#Cybersecurity #Tech #AI', attribution: 2, filterByKeyword: false,
  },
  {
    tier: 2, name: 'Dark Reading',
    shortName: 'Dark Reading', feed: 'https://www.darkreading.com/rss.xml',
    hashtags: '#Cybersecurity #Tech #AI', attribution: 1, filterByKeyword: true,
  },
  {
    tier: 2, name: 'NIST',
    shortName: 'NIST', feed: 'https://www.nist.gov/news-events/news/rss.xml',
    hashtags: '#AI #Tech #Cybersecurity', attribution: 1, filterByKeyword: false,
  },
  {
    tier: 2, name: 'AI Now Institute',
    shortName: 'AI Now Institute', feed: 'https://ainowinstitute.org/feed',
    hashtags: '#AI #AIGovernance #Tech', attribution: 1, filterByKeyword: false,
  },
  {
    tier: 2, name: 'Stanford HAI',
    shortName: 'Stanford HAI', feed: 'https://hai.stanford.edu/news/rss.xml',
    hashtags: '#AI #AIGovernance #Tech', attribution: 1, filterByKeyword: false,
  },
  {
    tier: 3, name: 'Microsoft Blog',
    shortName: 'Microsoft', feed: 'https://blogs.microsoft.com/feed/',
    hashtags: '#Microsoft #AI #Tech', attribution: 3, filterByKeyword: true,
  },
  {
    tier: 3, name: 'Azure Blog',
    shortName: 'Azure', feed: 'https://azure.microsoft.com/en-us/blog/feed/',
    hashtags: '#Microsoft #Tech #DevOps', attribution: 3, filterByKeyword: true,
  },
  {
    tier: 3, name: 'Microsoft Tech Community',
    shortName: 'Microsoft Tech Community', feed: 'https://techcommunity.microsoft.com/rss',
    hashtags: '#Microsoft #Tech #DevOps', attribution: 3, filterByKeyword: true,
  },
  {
    tier: 3, name: 'AWS Blog',
    shortName: 'AWS', feed: 'https://aws.amazon.com/blogs/aws/feed/',
    hashtags: '#Tech #DevOps #AI', attribution: 3, filterByKeyword: true,
  },
  {
    tier: 3, name: 'Google Cloud Release Notes',
    shortName: 'Google Cloud', feed: 'https://cloud.google.com/feeds/gcp-release-notes.xml',
    hashtags: '#Tech #DevOps #AI', attribution: 3, filterByKeyword: true,
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
  if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  return {}
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ── Minimal RSS/Atom XML parser ───────────────────────────────
function parseItems(xml) {
  const items = []

  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const link  = extractTag(block, 'link') || extractAttr(block, 'link', 'href')
    const desc  = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || '')
    if (title && link) items.push({ title, link, description: desc })
  }

  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1]
      const title = extractTag(block, 'title')
      const link  = extractAttr(block, 'link', 'href') || extractTag(block, 'id')
      const desc  = stripHtml(extractTag(block, 'summary') || extractTag(block, 'content') || '')
      if (title && link) items.push({ title, link, description: desc })
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
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ').trim()
}

// ── Fetch a single feed ───────────────────────────────────────
async function fetchFeed(source) {
  try {
    const res = await fetch(source.feed, {
      headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
      signal : AbortSignal.timeout(15000),
    })
    if (!res.ok) { console.log(`  ⚠ ${source.shortName}: HTTP ${res.status}`); return [] }
    const xml   = await res.text()
    const items = parseItems(xml)
    console.log(`  ${source.shortName}: ${items.length} items fetched`)
    return items
  } catch (err) {
    console.log(`  ⚠ ${source.shortName}: ${err.message}`)
    return []
  }
}

// ── Fetch OG data with browser UA and fallback strategies ─────
async function fetchThumb(url, accessJwt) {
  // Strategy 1 — fetch article page with browser UA
  const ogData = await fetchOgFromPage(url)
  if (ogData?.image) {
    const blob = await uploadImageBlob(ogData.image, accessJwt)
    if (blob) return { blob, title: ogData.title ?? '', description: ogData.description ?? '' }
  }

  // Strategy 2 — try common OG image URL patterns for known sources
  const fallbackImage = getFallbackImage(url)
  if (fallbackImage) {
    const blob = await uploadImageBlob(fallbackImage, accessJwt)
    if (blob) return { blob, title: '', description: '' }
  }

  return null
}

async function fetchOgFromPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent'     : UA,
        'Accept'         : 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control'  : 'no-cache',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const html = await res.text()

    const image = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
               ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
               ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1]

    const title = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
               ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
               ?? ''

    const description = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
                     ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1]
                     ?? ''

    return image ? { image, title, description } : null
  } catch {
    return null
  }
}

// ── Known fallback OG images for sources that block scraping ──
function getFallbackImage(url) {
  if (url.includes('cisa.gov'))              return 'https://www.cisa.gov/profiles/cisad8_gov/themes/custom/cisa/images/CISA_OG_social_share.png'
  if (url.includes('nist.gov'))              return 'https://www.nist.gov/sites/default/files/images/2019/12/06/nist-logo-brand-refresh.png'
  if (url.includes('krebsonsecurity.com'))   return 'https://krebsonsecurity.com/wp-content/uploads/2018/09/krebs-default.png'
  if (url.includes('msrc.microsoft.com'))    return 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b'
  if (url.includes('darkreading.com'))       return 'https://www.darkreading.com/resources/img/dark-reading-social.png'
  if (url.includes('ainowinstitute.org'))    return 'https://ainowinstitute.org/wp-content/uploads/2022/09/AI-Now-OG-Image.png'
  if (url.includes('hai.stanford.edu'))      return 'https://hai.stanford.edu/sites/default/files/HAI_Social_Share.png'
  if (url.includes('techcommunity.microsoft.com')) return 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b'
  if (url.includes('blogs.microsoft.com'))   return 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b'
  if (url.includes('azure.microsoft.com'))   return 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b'
  if (url.includes('aws.amazon.com'))        return 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png'
  if (url.includes('cloud.google.com'))      return 'https://cloud.google.com/_static/cloud/images/social-icon-google-cloud-1200-630.png'
  return null
}

// ── Upload image blob to Bluesky ──────────────────────────────
async function uploadImageBlob(imageUrl, accessJwt) {
  try {
    const imgRes = await fetch(imageUrl, {
      headers: { 'User-Agent': UA },
      signal : AbortSignal.timeout(15000),
    })
    if (!imgRes.ok) return null

    const imgBuf  = await imgRes.arrayBuffer()
    const imgType = imgRes.headers.get('content-type') ?? 'image/jpeg'

    // Skip if not an image content type
    if (!imgType.startsWith('image/')) return null

    // Skip if too large (Bluesky blob limit ~976KB)
    if (imgBuf.byteLength > 976 * 1024) {
      console.log(`  ⚠ Image too large (${Math.round(imgBuf.byteLength / 1024)}KB) — skipping`)
      return null
    }

    const uploadRes = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type' : imgType,
      },
      body: imgBuf,
    })

    if (!uploadRes.ok) return null
    const { blob } = await uploadRes.json()
    return blob
  } catch {
    return null
  }
}

// ── Build post text ───────────────────────────────────────────
// URL is omitted from post text — the embed card handles the link
function buildPostText(source, item) {
  const attribution = ATTRIBUTION[source.attribution]
  const byline      = `${item.title} — ${source.shortName}`
  const suffix      = `\n\n${source.hashtags}`
  const fixed       = `${attribution}\n\n${byline}`
  const available   = MAX_LENGTH - fixed.length - suffix.length - 2 // -2 for the \n\n before desc

  let desc = ''
  if (item.description && available > 20) {
    desc = item.description.length > available
      ? item.description.slice(0, available - 1) + '…'
      : item.description
    desc = '\n\n' + desc
  }

  const text = `${fixed}${desc}${suffix}`.trim()
  return text.length > MAX_LENGTH ? text.slice(0, MAX_LENGTH - 1) + '…' : text
}

// ── Build facets — hashtags only (URL handled by embed card) ──
function buildFacets(text) {
  const facets  = []
  const encoder = new TextEncoder()

  const hashtagRegex = /#([a-zA-Z0-9]+)/g
  let match
  while ((match = hashtagRegex.exec(text)) !== null) {
    const start = encoder.encode(text.slice(0, match.index)).length
    const end   = encoder.encode(text.slice(0, match.index + match[0].length)).length
    facets.push({ index: { byteStart: start, byteEnd: end }, features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }] })
  }

  return facets
}

// ── Bluesky auth ──────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ── Post to Bluesky ───────────────────────────────────────────
async function createPost(session, text, url, thumb, item) {
  const facets = buildFacets(text)
  const record = { $type: 'app.bsky.feed.post', text, facets, createdAt: new Date().toISOString(), langs: ['en'] }

  // Always add embed card — use OG data if available, fall back to feed item metadata
  record.embed = {
    $type   : 'app.bsky.embed.external',
    external: {
      uri        : url,
      title      : thumb?.title       || item.title       || '',
      description: thumb?.description || item.description || '',
      ...(thumb?.blob ? { thumb: thumb.blob } : {}),
    },
  }

  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.createRecord`, {
    method : 'POST',
    headers: { 'Authorization': `Bearer ${session.accessJwt}`, 'Content-Type': 'application/json' },
    body   : JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
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
  const today   = new Date().toISOString().slice(0, 10)
  const session = await createSession()

  const MAX_PER_RUN = 1
  let posted = 0

  const sorted = [...SOURCES].sort((a, b) => a.tier - b.tier)

  for (const source of sorted) {
    if (posted >= MAX_PER_RUN) break

    if (cache[source.feed]?.lastPostedDate === today) {
      console.log(`  ${source.shortName}: already posted today — skipping`)
      continue
    }

    console.log(`\nFetching ${source.shortName}...`)
    const items = await fetchFeed(source)
    if (items.length === 0) continue

    const postedUrls = new Set(Object.values(cache).flatMap(s => s.postedUrls ?? []))

    const eligible = items.filter(item => {
      if (postedUrls.has(item.link)) return false
      if (source.filterByKeyword && !matchesKeyword(item.title)) return false
      return true
    })

    if (eligible.length === 0) {
      console.log(`  ${source.shortName}: no eligible items after filtering`)
      continue
    }

    const candidate = eligible[0]
    console.log(`  Candidate: "${candidate.title}"`)

    try {
      const text = buildPostText(source, candidate)
      if (text.length > MAX_LENGTH) { console.log(`  ⚠ Post too long — skipping`); continue }

      console.log(`  Fetching OG image...`)
      const thumb = await fetchThumb(candidate.link, session.accessJwt)
      console.log(`  OG image: ${thumb ? '✓ found and uploaded' : '✗ not found — posting without embed'}`)
      console.log(`  Post preview (${text.length} chars):\n---\n${text}\n---`)

      const uri = await createPost(session, text, candidate.link, thumb, candidate)

      if (!cache[source.feed]) cache[source.feed] = { postedUrls: [] }
      cache[source.feed].lastPostedDate = today
      cache[source.feed].lastPostedAt   = new Date().toISOString()
      cache[source.feed].lastUri        = uri
      cache[source.feed].postedUrls     = [...(cache[source.feed].postedUrls ?? []), candidate.link].slice(-50)

      posted++
      await new Promise(r => setTimeout(r, 2000))

    } catch (err) {
      console.error(`  ✗ ${source.shortName}: ${err.message}`)
    }
  }

  saveCache(cache)
  console.log(`\nDone. ${posted} curated post(s) published.`)
}

main().catch(err => { console.error(err); process.exit(1) })
