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
const BSKY_SERVICE   = 'https://bsky.social'
const IDENTIFIER     = process.env.BLUESKY_IDENTIFIER
const APP_PASSWORD   = process.env.BLUESKY_APP_PASSWORD
const __dirname      = path.dirname(fileURLToPath(import.meta.url))
const POSTED_CACHE   = path.resolve(__dirname, '../cache/bluesky-posted.json')
const ENGAGEMENT_FILE = path.resolve(__dirname, '../cache/engagement.json')

// ── Load posted cache ─────────────────────────────────────────
function loadPostedCache() {
  if (!fs.existsSync(POSTED_CACHE)) return {}
  return JSON.parse(fs.readFileSync(POSTED_CACHE, 'utf8'))
}

// ── Load / save engagement data ───────────────────────────────
function loadEngagement() {
  if (fs.existsSync(ENGAGEMENT_FILE)) {
    return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf8'))
  }
  return {}
}

function saveEngagement(data) {
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(data, null, 2))
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

// ── Fetch likes for a post URI ────────────────────────────────
async function getLikes(uri, accessJwt) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getLikes?uri=${encodeURIComponent(uri)}&limit=100`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessJwt}` },
    })
    if (!res.ok) return { count: 0, accounts: [] }
    const data = await res.json()
    return {
      count   : data.likes?.length ?? 0,
      accounts: (data.likes ?? []).map(l => ({
        handle     : l.actor?.handle ?? '',
        displayName: l.actor?.displayName ?? '',
        followersCount: l.actor?.followersCount ?? 0,
      })),
    }
  } catch {
    return { count: 0, accounts: [] }
  }
}

// ── Fetch reposts for a post URI ──────────────────────────────
async function getReposts(uri, accessJwt) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getRepostedBy?uri=${encodeURIComponent(uri)}&limit=100`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessJwt}` },
    })
    if (!res.ok) return { count: 0, accounts: [] }
    const data = await res.json()
    return {
      count   : data.repostedBy?.length ?? 0,
      accounts: (data.repostedBy ?? []).map(a => ({
        handle        : a.handle ?? '',
        displayName   : a.displayName ?? '',
        followersCount: a.followersCount ?? 0,
      })),
    }
  } catch {
    return { count: 0, accounts: [] }
  }
}

// ── Fetch post thread for reply and quote counts ──────────────
async function getThreadStats(uri, accessJwt) {
  try {
    const url = `${BSKY_SERVICE}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=1`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessJwt}` },
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

// ── Format engagement summary for console ────────────────────
function summarize(url, entry) {
  const e = entry.engagement
  const slug = url.split('/posts/')[1] ?? url
  console.log(`  ${slug}`)
  console.log(`    Likes: ${e.likeCount}  Reposts: ${e.repostCount}  Replies: ${e.replyCount}  Quotes: ${e.quoteCount}`)
  if (e.topLiker) {
    console.log(`    Top liker: @${e.topLiker.handle} (${e.topLiker.followersCount} followers)`)
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt Engagement Monitor | Starting run...')

  const posted     = loadPostedCache()
  const engagement = loadEngagement()
  const session    = await createSession()

  // Filter to posts with a stored URI
  const posts = Object.entries(posted)
    .filter(([, v]) => v?.uri)
    .map(([url, v]) => ({ url, uri: v.uri, postedAt: v.postedAt }))

  console.log(`Posts with URIs: ${posts.length}`)

  let updated = 0

  for (const post of posts) {
    console.log(`\nChecking: ${post.url}`)

    try {
      // Get authoritative counts from thread endpoint
      const stats = await getThreadStats(post.uri, session.accessJwt)

      // Get like accounts to identify influential likers
      const likes = await getLikes(post.uri, session.accessJwt)

      // Get repost accounts
      const reposts = await getReposts(post.uri, session.accessJwt)

      // Find most influential liker by follower count
      const topLiker = likes.accounts.length > 0
        ? likes.accounts.reduce((a, b) =>
            (b.followersCount ?? 0) > (a.followersCount ?? 0) ? b : a
          )
        : null

      // Find most influential reposter
      const topReposter = reposts.accounts.length > 0
        ? reposts.accounts.reduce((a, b) =>
            (b.followersCount ?? 0) > (a.followersCount ?? 0) ? b : a
          )
        : null

      // Calculate engagement score
      // Weighted: reposts (3x) > replies (2x) > quotes (2x) > likes (1x)
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
          likers      : likes.accounts.slice(0, 10),   // Top 10 likers
          reposters   : reposts.accounts.slice(0, 10), // Top 10 reposters
        },
      }

      summarize(post.url, engagement[post.url])
      updated++

      // Respect rate limits
      await new Promise(r => setTimeout(r, 1000))

    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  saveEngagement(engagement)

  // ── Summary report ──────────────────────────────────────────
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
    if (e.topLiker) console.log(`  Top liker: @${e.topLiker.handle} (${e.topLiker.followersCount} followers)`)
    if (e.topReposter) console.log(`  Top reposter: @${e.topReposter.handle} (${e.topReposter.followersCount} followers)`)
  })

  console.log(`\nDone. ${updated} post(s) checked.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
