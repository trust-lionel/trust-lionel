import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Config ───────────────────────────────────────────────────────────────────
const FEED_URL        = 'https://trust-lionel.com/atom.xml';
const BSKY_SERVICE    = 'https://bsky.social';
const IDENTIFIER      = process.env.BLUESKY_IDENTIFIER;
const APP_PASSWORD    = process.env.BLUESKY_APP_PASSWORD;
const __dirname       = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE      = path.resolve(__dirname, '../cache/bluesky-posted.json');
const MAX_POST_LENGTH = 300;

// ── Load / save cache ─────────────────────────────────────────────────────────
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')));
  }
  return new Set();
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify([...cache], null, 2));
}

// ── Minimal Atom XML parser (no dependencies) ─────────────────────────────────
function parseAtom(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let entryMatch;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const block = entryMatch[1];

    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.trim() ?? '';

    const url = block.match(/<link[^>]+href=["']([^"']+)["']/)?.[1]
      ?? block.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim()
      ?? '';

    const summary = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/<[^>]+>/g, '')
      ?.trim() ?? '';

    const categories = [];
    const catRegex = /<category[^>]+term=["']([^"']+)["']/g;
    let catMatch;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1]);
    }

    if (url) entries.push({ title, url, summary, categories });
  }

  return entries;
}

// ── Fetch Atom feed ───────────────────────────────────────────────────────────
async function fetchFeed() {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseAtom(xml);
}

// ── Bluesky auth ──────────────────────────────────────────────────────────────
async function createSession() {
  const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ identifier: IDENTIFIER, password: APP_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Build post text ───────────────────────────────────────────────────────────
function buildPostText({ title, summary, url, categories }) {
  const hashtags = categories
    .map(c => '#' + c.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 4)
    .join(' ');

  const prefix    = `New on ahr-ki-tekt:\n\n${title}\n\n`;
  const suffix    = `\n\n${hashtags}\n\n${url}`;
  const available = MAX_POST_LENGTH - prefix.length - suffix.length;
  const trimmed   = summary.length > available
    ? summary.slice(0, available - 1) + '…'
    : summary;

  return `${prefix}${trimmed}${suffix}`;
}

// ── Build facets (hashtags + URL) ─────────────────────────────────────────────
function buildFacets(text, url) {
  const facets  = [];
  const encoder = new TextEncoder();

  const hashtagRegex = /#([a-zA-Z0-9]+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    const start = encoder.encode(text.slice(0, match.index)).length;
    const end   = encoder.encode(text.slice(0, match.index + match[0].length)).length;
    facets.push({
      index   : { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }],
    });
  }

  const urlIndex = text.indexOf(url);
  if (urlIndex !== -1) {
    const start = encoder.encode(text.slice(0, urlIndex)).length;
    const end   = encoder.encode(text.slice(0, urlIndex + url.length)).length;
    facets.push({
      index   : { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    });
  }

  return facets;
}

// ── Fetch OG image and upload blob ───────────────────────────────────────────
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

    const imgRes  = await fetch(ogImage);
    const imgBuf  = await imgRes.arrayBuffer();
    const imgType = imgRes.headers.get('content-type') ?? 'image/jpeg';

    const uploadRes = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.uploadBlob`, {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type' : imgType,
      },
      body: imgBuf,
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
  const text   = buildPostText(entry);
  const facets = buildFacets(text, entry.url);
  const thumb  = await fetchThumb(entry.url, session.accessJwt);

  const record = {
    $type    : 'app.bsky.feed.post',
    text,
    facets,
    createdAt: new Date().toISOString(),
    langs    : ['en'],
  };

  if (thumb) {
    record.embed = {
      $type   : 'app.bsky.embed.external',
      external: {
        uri        : entry.url,
        title      : thumb.title || entry.title,
        description: thumb.description,
        thumb      : thumb.blob,
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
  console.log(`✓ Posted: ${entry.title}`);
  console.log(`  ${result.uri}`);
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('ahr-ki-tekt → Bluesky | Starting run...');

  const cache   = loadCache();
  const entries = await fetchFeed();
  const session = await createSession();

  console.log(`Feed entries found: ${entries.length}`);
  console.log(`Cache entries: ${cache.size}`);

  let posted = 0;

  for (const entry of entries) {
    if (!entry.url || cache.has(entry.url)) continue;

    try {
      await createPost(session, entry);
      cache.add(entry.url);
      posted++;

      if (posted < entries.length) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`✗ Failed: ${entry.url}`);
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
