// ============================================================
// scripts/bluesky-events.mjs
// Posts event lifecycle announcements to Bluesky
// Reads directly from src/content/events/*.md
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE    = 'https://bsky.social'
const IDENTIFIER      = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD    = process.env.BLUESKY_APP_PASSWORD
const __dirname       = path.dirname(fileURLToPath(import.meta.url))
const EVENTS_DIR      = path.resolve(__dirname, '../src/content/events')
const CACHE_FILE      = path.resolve(__dirname, '../cache/bluesky-events.json')
const SITE_URL        = 'https://trust-lionel.com'
const MAX_LENGTH      = 300

// ── Lifecycle stages (days before/after eventDate) ───────────
const STAGES = [
  { key: 't7',    daysOffset: -7,  label: 'one week away'    },
  { key: 't2',    daysOffset: -2,  label: 'in 2 days'        },
  { key: 't1',    daysOffset: -1,  label: 'tomorrow'         },
  { key: 't0',    daysOffset:  0,  label: 'today'            },
  { key: 'recap', daysOffset:  1,  label: 'recap'            },
]

// ── Hashtag map — techStack/tags → Bluesky hashtags ─────────
const HASHTAG_MAP = {
  'Entrepreneurship':      '#Entrepreneurs',
  'Small Business':        '#Tech',
  'Website Strategy':      '#AI',
  'Digital Transformation':'#Tech',
  'AI Governance':         '#AIGovernance',
  'Cybersecurity':         '#Cybersecurity',
  'Microsoft 365':         '#Microsoft',
  'Cloud Migration':       '#Tech',
  'Business Continuity':   '#Cybersecurity',
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

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Parse arrays: ["a", "b"]  or  [a, b]
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
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))

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
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  }
  return {}
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ── Calculate days between two dates ─────────────────────────
function daysDiff(dateStr) {
  const today  = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

// ── Build hashtags from event tags ───────────────────────────
function buildHashtags(tags) {
  if (!tags || !Array.isArray(tags)) return '#AI #Tech'
  const mapped = tags
    .map(t => HASHTAG_MAP[t])
    .filter(Boolean)
    .slice(0, 3)
  if (!mapped.includes('#AI')) mapped.unshift('#AI')
  return [...new Set(mapped)].slice(0, 4).join(' ')
}

// ── Build post text for each lifecycle stage ─────────────────
function buildPostText(event, stage) {
  const hashtags  = buildHashtags(event.tags)
  const url       = event.eventPrimaryButtonUrl
    ?? event.eventRegistrationUrl
    ?? `${SITE_URL}/events/${event.id}`
  const format    = event.eventFormat ? `${event.eventFormat} · ` : ''
  const host      = event.eventHost   ? `Hosted by ${event.eventHost}` : ''

  let text = ''

  if (stage.key === 'recap') {
    text = `Thank you to everyone who joined us ${stage.label}:\n\n${event.title}\n\n${host}\n\n${hashtags}\n\n${url}`
  } else if (stage.key === 't0') {
    text = `Happening today — ${event.title}\n\n${format}${event.eventTime ?? ''}\n\n${host}\n\nRegister now:\n\n${hashtags}\n\n${url}`
  } else {
    text = `${event.title} is ${stage.label}.\n\n${format}${event.eventDate} · ${event.eventTime ?? ''}\n\n${host}\n\n${hashtags}\n\n${url}`
  }

  // Trim to 300 characters if needed
  if (text.length > MAX_LENGTH) {
    const suffix = `\n\n${hashtags}\n\n${url}`
    const available = MAX_LENGTH - suffix.length
    text = text.slice(0, available - 1) + '…' + suffix
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
  console.log('ahr-ki-tekt Events → Bluesky | Starting run...')

  const events  = loadEvents()
  const cache   = loadCache()
  const session = await createSession()

  console.log(`Events found: ${events.length}`)

  let posted = 0

  for (const event of events) {
    if (!cache[event.id]) cache[event.id] = {}

    const diff = daysDiff(event.eventDate)
    console.log(`  ${event.id}: ${diff} days`)

    for (const stage of STAGES) {
      // Check if this stage should fire today
      const shouldFire = diff === stage.daysOffset

      if (!shouldFire) continue
      if (cache[event.id][stage.key]?.posted) {
        console.log(`  ↳ ${stage.key} already posted — skipping`)
        continue
      }

      try {
        const { text, url } = buildPostText(event, stage)
        const uri = await createPost(session, text, url)

        cache[event.id][stage.key] = {
          posted  : true,
          postedAt: new Date().toISOString(),
          uri,
        }
        posted++

        // Rate limit between posts
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
  console.error(err)
  process.exit(1)
})
