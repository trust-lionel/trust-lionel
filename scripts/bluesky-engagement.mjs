// ============================================================
// scripts/bluesky-engagement.mjs
// Weekly engagement monitor for @ahr-ki-tekt.trust-lionel.com
// Queries likes, reposts, replies, and quotes for all posts
// with a stored URI in cache/bluesky-posted.json
// Writes results to cache/engagement.json
// ============================================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ───────────────────────────────────────────────────
const BSKY_SERVICE    = 'https://bsky.social'
const IDENTIFIER      = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD    = process.env.BLUESKY_APP_PASSWORD
const __dirname       = path.dirname(fileURLToPath(import.meta.url))
const POSTED_CACHE    = path.resolve(__dirname, '../cache/bluesky-posted.json')
const ENGAGEMENT_FILE = path.resolve(__dirname, '../cache/engagement.json')
const FETCH_TIMEOUT   = 15000
const MAX_RETRIES     = 3
const RETRY_DELAY_MS  = 5000

// ── Credential validation ─────────────────────────────────────
if (!IDENTIFIER || !APP_PASSWORD) {
  console.error('✗ Missing BLUESKY_IDENTIFIER or BLUESKY_APP_PASSWORD')
  process.exit(1)
}

// ── Session store ─────────────────────────────────────────────
let SESSION = null

// ── Load posted cache ─────────────────────────────────────────
function loadPostedCache() {
  if (!fs.existsSync(POSTED_CACHE)) return {}
  try {
    return JSON.parse(fs.readFileSync(POSTED_CACHE, 'utf8'))
  } catch {
    console.error('✗ Posted cache file corrupt')
    return {}
  }
}

// ── Load / save engagement data ───────────────────────────────
function loadEngagement() {
  if (fs.existsSync(ENGAGEMENT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf8'))
    } catch {
      console.error('✗ Engagement file corrupt — starting fresh')
      return {}
    }
  }
  return {}
}

function saveEngagement(data) {
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(data, null, 2))
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

// ── Fetch profile to resolve follower count ───────────────────
async function getFollowerCount(handle) {
  try {
    if (!handle) return 0
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SESSION.accessJwt}` },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.followersCount ?? 0
  } catch {
    return 0
  }
}

// ── Fetch likes for a post URI ────────────────────────────────
async function getLikes(uri) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getLikes?uri=${encodeURIComponent(uri)}&limit=100`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SESSION.accessJwt}` },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return { count: 0, accounts: [] }
    const data = await res.json()

    // Resolve follower counts via profile lookup
    const accounts = []
    for (const l of (data.likes ?? [])) {
      const handle        = l.actor?.handle ?? ''
      const displayName   = l.actor?.displayName ?? ''
      const followersCount = await getFollowerCount(handle)
      accounts.push({ handle, displayName, followersCount })
      await new Promise(r => setTimeout(r, 300)) // Gentle rate limiting
    }

    return { count: accounts.length, accounts }
  } catch {
    return { count: 0, accounts: [] }
  }
}

// ── Fetch reposts for a post URI ──────────────────────────────
async function getReposts(uri) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getRepostedBy?uri=${encodeURIComponent(uri)}&limit=100`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SESSION.accessJwt}` },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return { count: 0, accounts: [] }
    const data = await res.json()

    const accounts = []
    for (const a of (data.repostedBy ?? [])) {
      const handle        = a.handle ?? ''
      const displayName   = a.displayName ?? ''
      const followersCount = await getFollowerCount(handle)
      accounts.push({ handle, displayName, followersCount })
      await new Promise(r => setTimeout(r, 300))
    }

    return { count: accounts.length, accounts }
  } catch {
    return { count: 0, accounts: [] }
  }
}

// ── Fetch post thread for authoritative counts ────────────────
async function getThreadStats(uri) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=1`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SESSION.accessJwt}` },
      signal : AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return { replyCount: 0, quoteCount: 0, likeCount: 0, repostCount: 0 }
    const data = await res.json()
    const post = data.thread?.post
    return {
      replyCount : post?.replyCount  ?? 0,
      quoteCount : post?.quoteCount  ?? 0,
      likeCount  : post?.likeCount   ?? 0,
      repostCount: post?.repostCount ?? 0,
    }
  } catch {
    return { replyCount: 0, quoteCount: 0, likeCount: 0, repostCount: 0 }
  }
}

// ── Format engagement summary for console ─────────────────────
function summarize(url, entry) {
  const e    = entry.engagement
  const slug = url.split('/posts/')[1] ?? url
  console.log(`  ${slug}`)
  console.log(`    Likes: ${e.likeCount}  Reposts: ${e.repostCount}  Replies: ${e.replyCount}  Quotes: ${e.quoteCount}  Score: ${e.score}`)
  if (e.topLiker) {
    console.log(`    Top liker: @${e.topLiker.handle} (${e.topLiker.followersCount} followers)`)
  }
  if (e.topReposter) {
    console.log(`    Top reposter: @${e.topReposter.handle} (${e.topReposter.followersCount} followers)`)
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt Engagement Monitor | Starting run...')

  const posted     = loadPostedCache()
  const engagement = loadEngagement()
  await withRetry(createSession, 'Auth')

  // Filter to posts with a stored URI
  const posts = Object.entries(posted)
    .filter(([, v]) => v?.uri)
    .map(([url, v]) => ({ url, uri: v.uri, postedAt: v.postedAt }))

  console.log(`Posts with URIs: ${posts.length}`)

  let updated = 0

  for (const post of posts) {
    console.log(`\nChecking: ${post.url}`)

    try {
      const stats    = await withRetry(() => getThreadStats(post.uri), 'Thread stats')
      const likes    = await getLikes(post.uri)
      const reposts  = await getReposts(post.uri)

      // Find most influential liker and reposter by follower count
      const topLiker = likes.accounts.length > 0
        ? likes.accounts.reduce((a, b) => (b.followersCount > a.followersCount ? b : a))
        : null

      const topReposter = reposts.accounts.length > 0
        ? reposts.accounts.reduce((a, b) => (b.followersCount > a.followersCount ? b : a))
        : null

      // Weighted engagement score
      // Reposts (3x) > Replies (2x) > Quotes (2x) > Likes (1x)
      const score = (
        (stats.likeCount   * 1) +
        (stats.repostCount * 3) +
        (stats.replyCount  * 2) +
        (stats.quoteCount  * 2)
      )

      engagement[post.url] = {
        uri      : post.uri,
        postedAt : post.postedAt,
        checkedAt: new Date().toISOString(),
        engagement: {
          likeCount   : stats.likeCount,
          repostCount : stats.repostCount,
          replyCount  : stats.replyCount,
          quoteCount  : stats.quoteCount,
          score,
          topLiker    : topLiker    ?? null,
          topReposter : topReposter ?? null,
          likers      : likes.accounts.slice(0, 10),
          reposters   : reposts.accounts.slice(0, 10),
        },
      }

      summarize(post.url, engagement[post.url])
      updated++

      await new Promise(r => setTimeout(r, 1000))

    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  saveEngagement(engagement)

  // ── Summary report ────────────────────────────────────────
  console.log('\n══════════════════════════════════════')
  console.log('ENGAGEMENT SUMMARY')
  console.log('══════════════════════════════════════')

  const sorted = Object.entries(engagement)
    .filter(([, v]) => v.engagement)
    .sort(([, a], [, b]) => b.engagement.score - a.engagement.score)

  sorted.forEach(([url, data], i) => {
    const e    = data.engagement
    const slug = url.split('/posts/')[1] ?? url
    console.log(`\n#${i + 1} ${slug}`)
    console.log(`  Score: ${e.score} | Likes: ${e.likeCount} | Reposts: ${e.repostCount} | Replies: ${e.replyCount} | Quotes: ${e.quoteCount}`)
    if (e.topLiker)    console.log(`  Top liker: @${e.topLiker.handle} (${e.topLiker.followersCount} followers)`)
    if (e.topReposter) console.log(`  Top reposter: @${e.topReposter.handle} (${e.topReposter.followersCount} followers)`)
  })

  console.log(`\nDone. ${updated} post(s) checked.`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
