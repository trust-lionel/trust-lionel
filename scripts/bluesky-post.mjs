import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────────────
const FEED_URL        = 'https://trust-lionel.com/atom.xml';
const BSKY_SERVICE    = 'https://bsky.social';
const IDENTIFIER      = process.env.BLUESKY_IDENTIFIER;
const APP_PASSWORD    = process.env.BLUESKY_APP_PASSWORD;
const CACHE_FILE      = path.resolve('cache/bluesky-posted.json');
const MAX_POST_LENGTH = 300;

// ── Load cache ───────────────────────────────────────────────────────────────
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')));
  }
  return new Set();
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify([...cache], null, 2));
}

// ── Fetch & parse Atom feed ──────────────────────────────────────────────────
async function fetchFeed() {
  const res = await fetch(FEED_URL);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);
  const entries = data?.feed?.entry ?? [];
  return Array.isArray(entries) ? entries : [entries];
}

// ── Bluesky auth ─────────────────────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Build post text ───────────────────────────────────────────────────────────
function buildPostText(entry) {
  const title   = entry?.title?.['#text'] ?? entry?.title ?? '';
  const summary = entry?.summary?.['#text'] ?? entry?.summary ?? '';
  const url     = entry?.link?.['@_href'] ?? entry?.id ?? '';

  // Build category hashtags
  const categories = entry?.category ?? [];
  const catArray   = Array.isArray(categories) ? categories : [categories];
  const hashtags   = catArray
    .map(c => {
      const term = c?.['@_term'] ?? c ?? '';
      return '#' + term.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    })
    .filter(Boolean)
    .slice(0, 4)  // Max 4 hashtags
    .join(' ');

  // Trim summary to fit within post limit
  const prefix    = `New on ahr-ki-tekt:\n\n${title}\n\n`;
  const suffix    = `\n\n${hashtags}\n\n${url}`;
  const available = MAX_POST_LENGTH - prefix.length - suffix.length;
  const trimmed   = summary.length > available
    ? summary.slice(0, available - 1) + '…'
    : summary;

  return { text: `${prefix}${trimmed}${suffix}`, url, title };
}

// ── Build facets for hashtags and URL ────────────────────────────────────────
function buildFacets(text, url) {
  const facets = [];
  const encoder = new TextEncoder();

  // Hashtag facets
  const hashtagRegex = /#([a-zA-Z0-9]+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    const start = encoder.encode(text.slice(0, match.index)).length;
    const end   = encoder.encode(text.slice(0, match.index + match[0].length)).length;
    facets.push({
      index: { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }],
    });
  }

  // URL facet
  const urlIndex = text.indexOf(url);
  if (urlIndex !== -1) {
    const start = encoder.encode(text.slice(0, urlIndex)).length;
    const end   = encoder.encode(text.slice(0, urlIndex + url.length)).length;
    facets.push({
      index: { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    });
  }

  return facets;
}

// ── Fetch Open Graph data for embed card ─────────────────────────────────────
async function fetchThumb(url, accessJwt) {
  try {
    const res  = await fetch(url);
    const html = await res.text();
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
                 ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    const ogDesc  = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
                 ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1]
                 ?? '';
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
                 ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
                 ?? '';

    if (!ogImage) return null;

    // Upload image blob to Bluesky
    const imgRes  = await fetch(ogImage);
    const imgBuf  = await imgRes.arrayBuffer();
    const imgType = imgRes.headers.get('content-type') ?? 'image/jpeg';

    const uploadRes = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': imgType,
      },
      body: Buffer.from(imgBuf),
    });

    if (!uploadRes.ok) return null;
    const { blob } = await uploadRes.json();

    return { blob, title: ogTitle, description: ogDesc };
  } catch {
    return null;
  }
}

// ── Create Bluesky post ───────────────────────────────────────────────────────
async function createPost(session, entry) {
  const { text, url, title } = buildPostText(entry);
  const facets = buildFacets(text, url);
  const thumb  = await fetchThumb(url, session.accessJwt);

  const record = {
    $type      : 'app.bsky.feed.post',
    text,
    facets,
    createdAt  : new Date().toISOString(),
    langs      : ['en'],
  };

  // Add embed card if OG data was found
  if (thumb) {
    record.embed = {
      $type    : 'app.bsky.embed.external',
      external : {
        uri         : url,
        title       : thumb.title || title,
        description : thumb.description,
        thumb       : thumb.blob,
      },
    };
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
  });

  if (!res.ok) throw new Error(`Post failed: ${res.status} ${await res.text()}`);
  const result = await res.json();
  console.log(`✓ Posted: ${title}`);
  console.log(`  ${result.uri}`);
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt → Bluesky | Starting run...');

  const cache   = loadCache();
  const entries = await fetchFeed();
  const session = await createSession();

  let posted = 0;

  for (const entry of entries) {
    const url = entry?.link?.['@_href'] ?? entry?.id ?? '';
    if (!url || cache.has(url)) continue;

    try {
      await createPost(session, entry);
      cache.add(url);
      posted++;

      // Respect rate limits — wait 2 seconds between posts
      if (posted < entries.length) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`✗ Failed to post: ${url}`);
      console.error(err.message);
    }
  }

  saveCache(cache);
  console.log(`Done. ${posted} new post(s) published.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});