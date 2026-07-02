# trust-lionel.com — Platform Runbook

**Document Type:** Living Runbook / Handoff Document  
**Site:** [trust-lionel.com](https://trust-lionel.com)  
**Owner:** Lionel Mosley  
**Brand:** Lionel Mosley | ahr-ki-tekt  
**Last Updated:** Monday, June 22, 2026  
**Version:** 1.0  

---

## Table of Contents

1. [Changelog](#changelog)
2. [Platform Overview](#platform-overview)
3. [Application Architecture](#application-architecture)
4. [Repository Structure](#repository-structure)
5. [Naming Conventions and Nomenclature](#naming-conventions-and-nomenclature)
6. [Configuration](#configuration)
7. [Design System](#design-system)
8. [UX/UI Decisions](#uxui-decisions)
9. [Layout and Structure](#layout-and-structure)
10. [Integrations](#integrations)
11. [Security](#security)
12. [Content Management](#content-management)
13. [Build and Deployment](#build-and-deployment)
14. [Decision Log](#decision-log)
15. [Future Enhancements](#future-enhancements)
16. [Handoff Notes for New Collaborators](#handoff-notes-for-new-collaborators)

---

## Changelog

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 | June 22, 2026 | Lionel Mosley | Initial Runbook created. Full migration from Jekyll/GitHub Pages to Litos/Astro v6 on Netlify completed June 20–22, 2026. |

---

## Platform Overview

**trust-lionel.com** is the personal brand and thought leadership platform for Lionel Mosley, operating under the brand identity **Lionel Mosley | ahr-ki-tekt**. It serves as the primary digital presence for IT consulting services delivered through **4TH AND BAILEY**.

### Brand Identity

| Element | Value |
|---------|-------|
| Full Brand Name | Lionel Mosley \| ahr-ki-tekt |
| Tagline | IT Consultant & Innovative Thought Leader |
| Location | Houston, TX |
| Company | 4TH AND BAILEY |
| Domain | trust-lionel.com |
| Primary Color | `#0088cc` |
| Publication Name | The ahr-ki-tekt Design Journal |

### Buyer Personas

The site targets five primary decision-maker profiles:

1. **CIO** — Chief Information Officer
2. **Finance / Procurement** — Budget holders evaluating technology spend
3. **InfoSec Officer** — Security leaders evaluating compliance posture
4. **IT Director** — Technical managers overseeing infrastructure
5. **Owner / CEO / Operator** — Business leaders making technology decisions

### Site Purpose

- Publish thought leadership on cloud infrastructure, cybersecurity, Microsoft 365, and enterprise IT governance
- Generate consulting leads via the Consulting page and scheduling integration
- Demonstrate methodology through the Infrastructure Placement Framework and case studies
- Build topical authority for search engine visibility across CISA SCuBA, NIST SP 800-53, MITRE ATT&CK, CIS Benchmarks, Microsoft Azure, and cloud migration queries

---

## Application Architecture

### Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Astro | 6.1.4 | Static site generator |
| Theme | Litos | Custom fork | Originally by Dnzzk2 |
| UI Components | React | 19.x | Used for interactive components only |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Package Manager | pnpm | Latest | Required — do not use npm or yarn |
| Node.js | Node.js | 22.x | Minimum required by Astro v6 |
| Build Tool | Vite | 5.x | Bundled with Astro |
| Search | Pagefind | 1.5.0 | Static search, WASM-powered |
| Hosting | Netlify | — | Auto-deploys from GitHub main branch |
| Repository | GitHub | — | github.com/trust-lionel/trust-lionel |

### Build Pipeline

```
Source (GitHub main) → Netlify Build Trigger
  → pnpm install
  → astro check (TypeScript validation)
  → astro build (static site generation)
  → pagefind --site dist (search index generation)
  → Deploy to Netlify CDN
```

### Rendering Model

The site is fully static (SSG — Static Site Generation). No server-side rendering. All pages are pre-built at deploy time and served from Netlify's CDN. Interactive components (GitHub heatmap, search, skills marquee) hydrate client-side using Astro's `client:load` directive.

---

## Repository Structure

```
trust-lionel/
├── .nojekyll                    # Disables GitHub Pages Jekyll processing
├── astro.config.ts              # Astro configuration
├── netlify.toml                 # Netlify build and security configuration
├── package.json                 # Dependencies and build scripts
├── pnpm-lock.yaml               # Lockfile — do not delete
├── tsconfig.json                # TypeScript configuration
├── ec.config.mjs                # Expressive Code configuration (syntax highlighting)
├── public/                      # Static assets (copied as-is to dist/)
│   ├── favicon.svg              # Memoji favicon (primary)
│   ├── favicon.png              # Memoji favicon (fallback)
│   ├── apple-touch-icon.png     # Memoji favicon (iOS)
│   ├── og-image.png             # Social sharing image (trippy split portrait)
│   ├── robots.txt               # Search engine crawl instructions
│   ├── fonts/                   # Self-hosted fonts
│   │   ├── Roboto-VariableFont.woff2    # Heading font
│   │   ├── GeistVF.woff2               # Body font
│   │   └── GeistMono.woff2             # Monospace font
│   ├── projects/                # Project card icons
│   │   ├── houston-alert.png
│   │   ├── infrastructure-placement-framework.png
│   │   ├── macsystools.png
│   │   └── shopify-bw-agent.png
│   └── js/
│       └── theme.js             # Theme initialization script
├── src/
│   ├── config.ts                # Primary site configuration (edit this for content changes)
│   ├── content.config.ts        # Content collection schemas
│   ├── env.d.ts                 # TypeScript environment declarations
│   ├── types.ts                 # TypeScript type definitions
│   ├── content/
│   │   ├── posts/               # Blog post markdown files
│   │   │   ├── cloud-migration.md
│   │   │   ├── microsoft-notification-abuse.md
│   │   │   ├── three-questions.md
│   │   │   ├── vibe-coding.md
│   │   │   └── macsystools.md
│   │   └── projects/            # Project MDX files
│   │       ├── houston-alert/index.mdx
│   │       ├── infrastructure-placement-framework/index.mdx
│   │       ├── macsystools/index.mdx
│   │       └── shopify-bw-agent/index.mdx
│   ├── layouts/
│   │   ├── Layout.astro         # Root layout (head, schema, GTM, Umami)
│   │   ├── Header.astro         # Site header (nav, search, calendar, RSS)
│   │   └── Footer.astro         # Site footer (nav links, social icons, copyright)
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── 404.astro            # 404 error page
│   │   ├── atom.xml.js          # Atom feed
│   │   ├── rss.xml.js           # RSS feed
│   │   ├── consulting/
│   │   │   └── index.astro      # Consulting services page
│   │   ├── posts/
│   │   │   ├── [...id].astro    # Individual post page
│   │   │   └── [...page].astro  # Posts listing page
│   │   ├── projects/
│   │   │   └── index.astro      # Projects listing page
│   │   └── tags/
│   │       ├── index.astro      # Tags index
│   │       └── [tag]/[...page].astro  # Tag-filtered post listing
│   ├── components/
│   │   ├── base/                # Core reusable components
│   │   │   ├── Head.astro       # HTML head (SEO, preloads, fonts)
│   │   │   ├── GithubContributions.tsx   # Spotlight heatmap
│   │   │   ├── SearchSwitch.astro        # Pagefind search UI
│   │   │   ├── SkillsShowcase.astro      # Animated skills marquee
│   │   │   ├── SocialLink.astro          # Social icon link
│   │   │   └── Pagination.astro          # Post list pagination
│   │   ├── posts/               # Post-specific components
│   │   │   ├── SocialShare.astro         # Share buttons (LinkedIn, X, Facebook, Reddit)
│   │   │   ├── card/            # Post card display variants
│   │   │   │   ├── Minimal.astro         # Used on Posts listing page
│   │   │   │   ├── Compact.astro
│   │   │   │   ├── Cover.astro
│   │   │   │   ├── ImageShow.astro
│   │   │   │   └── TimeLine.astro
│   │   │   └── layouts/         # Post content layout variants
│   │   │       ├── CoverTop.astro        # Used by all current posts
│   │   │       ├── CoverSplit.astro
│   │   │       └── MetaOnly.astro
│   │   └── theme/
│   │       └── HeaderGradient.astro      # Decorative header gradient
│   ├── lib/
│   │   ├── data.ts              # Data fetching utilities (posts, projects, tags)
│   │   ├── utils.ts             # Utility functions (formatDate, cn)
│   │   ├── feed.ts              # RSS and Atom feed generation
│   │   └── github.ts            # GitHub contributions caching (1-hour localStorage)
│   └── styles/
│       ├── global.css           # Global styles, CSS variables, font config
│       ├── markdown.css         # Markdown/prose styles
│       ├── lqip.css             # Low-quality image placeholder styles
│       └── github-card.css      # GitHub card embed styles
└── plugins/
    ├── index.ts                 # Plugin exports
    ├── remark-reading-time.ts   # Reading time calculation
    ├── remark-lqip.js           # Image placeholder generation
    └── remark-github-card.ts    # GitHub card embeds
```

---

## Naming Conventions and Nomenclature

### File Naming

| Asset Type | Convention | Example |
|-----------|-----------|---------|
| Blog posts | kebab-case `.md` | `cloud-migration.md` |
| Project directories | kebab-case | `houston-alert/` |
| Astro components | PascalCase `.astro` | `SocialShare.astro` |
| React components | PascalCase `.tsx` | `GithubContributions.tsx` |
| Utility files | camelCase `.ts` | `utils.ts` |
| CSS files | kebab-case `.css` | `global.css` |
| Public assets | kebab-case | `og-image.png` |

### URL Structure

| Page | URL |
|------|-----|
| Homepage | `trust-lionel.com/` |
| Posts index | `trust-lionel.com/posts/` |
| Individual post | `trust-lionel.com/posts/{slug}/` |
| Projects | `trust-lionel.com/projects/` |
| Consulting | `trust-lionel.com/consulting/` |
| Tags index | `trust-lionel.com/tags/` |
| Tag page | `trust-lionel.com/tags/{tag-name}/` |
| RSS feed | `trust-lionel.com/rss.xml` |
| Atom feed | `trust-lionel.com/atom.xml` |
| Sitemap | `trust-lionel.com/sitemap-index.xml` |

### Brand Terminology

| Term | Usage |
|------|-------|
| ahr-ki-tekt | Phonetic spelling of "architect" — used in tagline and series names |
| The ahr-ki-tekt Design Journal | Official name for the publication/blog |
| 4TH AND BAILEY | Always all-caps, no period |
| LIONEL MOSLEY | All-caps in display headings |
| trust-lionel | Repository and domain slug — always lowercase, hyphenated |

### Post Frontmatter Schema

```yaml
---
title: "Post Title"
description: "One to two sentence SEO description."
pubDate: YYYY-MM-DD
tags: ["Tag One", "Tag Two"]
recommend: true           # Shows in recommended posts
pinned: true              # Pins to top of post lists (use sparingly)
postType: "coverTop"      # Layout variant: coverTop | coverSplit | metaOnly
cover: "https://images.unsplash.com/photo-{ID}?w=1400&q=80&auto=format&fit=crop"
---
```

---

## Configuration

### Primary Configuration File: `src/config.ts`

All site-wide settings are controlled from this single file. Edit this file for content and feature changes.

#### Site Settings (`SITE`)

```typescript
SITE = {
  title: 'Lionel Mosley | ahr-ki-tekt',
  author: 'Lionel Mosley',
  description: 'Carefully selected frameworks, insights, and solutions from Lionel Mosley — IT Consultant & Innovative Thought Leader based in Houston, TX.',
  website: 'https://trust-lionel.com/',
  base: '/',
  ogImage: '/og-image.png',
  lang: 'en',
  transition: true,
  themeAnimation: true,
}
```

#### Navigation Links

```typescript
HEADER_LINKS = [
  { name: 'Posts', url: '/posts' },
  { name: 'Projects', url: '/projects' },
  { name: 'Consulting', url: '/consulting' },
]

FOOTER_LINKS = [
  { name: 'Home', url: '/' },
  { name: 'Posts', url: '/posts' },
  { name: 'Projects', url: '/projects' },
  { name: 'Tags', url: '/tags' },
  { name: 'Consulting', url: '/consulting' },
]
```

#### Social Links (`SOCIAL_LINKS`)

| Platform | URL | Icon | Brand Color |
|----------|-----|------|-------------|
| GitHub | https://github.com/trust-lionel | `ri--github-fill` | `#181717` / `#ffffff` dark |
| LinkedIn | https://www.linkedin.com/in/lionelmosley | `ri--linkedin-fill` | `#0A66C2` |
| Reddit | https://www.reddit.com/user/trust-lionel/ | `ri--reddit-fill` | `#FF4500` |
| Spotify | https://open.spotify.com/user/lmosley002-spotify | `ri--spotify-fill` | `#1DB954` |

#### GitHub Spotlight Configuration

```typescript
GITHUB_CONFIG = {
  ENABLED: true,
  GITHUB_USERNAME: 'trust-lionel',
  TOOLTIP_ENABLED: true,
}
```

#### Analytics Configuration

```typescript
ANALYTICS_CONFIG = {
  UMAMI: {
    ENABLED: true,
    WEBSITE_ID: 'b8e2a312-e7f4-4595-95ee-38b47fc9be54',
    SRC: 'https://umami-production-f3f3.up.railway.app/script.js',
  },
}
```

#### Posts Configuration

```typescript
POSTS_CONFIG = {
  postType: 'coverTop',
  homePageConfig: {
    size: 3,
    type: 'minimal',
  },
  postPageConfig: {
    size: 10,
    type: 'minimal',
  },
}
```

### `astro.config.ts` — Key Settings

```typescript
{
  site: 'https://trust-lionel.com',
  image: {
    domains: ['images.unsplash.com'],  // Allows Unsplash cover images
  },
  markdown: {
    syntaxHighlight: false,  // Handled by Expressive Code
  },
  integrations: [
    expressiveCode(),   // Syntax highlighting
    mdx(),              // MDX support
    react(),            // React component support
    sitemap(),          // Auto-generates sitemap
    robotsTxt(),        // Auto-generates robots.txt
  ],
}
```

### `netlify.toml` — Build and Security Configuration

```toml
[build]
  command = "pnpm run build && pnpm pagefind --site dist"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

---

## Design System

### Color Palette

| Role | Light Mode | Dark Mode | Notes |
|------|-----------|-----------|-------|
| Primary brand | `#0088cc` | `#0088cc` | LIONEL MOSLEY heading, accents |
| RSS icon | `#f26522` | `#f26522` | Fixed — not theme-aware |
| GitHub social | `#181717` | `#ffffff` | Inverts in dark mode |
| LinkedIn | `#0A66C2` | `#0A66C2` | Fixed brand color |
| Reddit | `#FF4500` | `#FF4500` | Fixed brand color |
| Spotify | `#1DB954` | `#1DB954` | Fixed brand color |
| GitHub heatmap 0 | `#ebedf0` | `#161b22` | No contributions |
| GitHub heatmap 1 | `#9be9a8` | `#0e4429` | 1–4 contributions |
| GitHub heatmap 2 | `#40c463` | `#006d32` | 5–9 contributions |
| GitHub heatmap 3 | `#30a14e` | `#26a641` | 10–19 contributions |
| GitHub heatmap 4 | `#216e39` | `#39d353` | 20+ contributions |

### Typography

| Role | Font | Format | Source |
|------|------|--------|--------|
| Headings | Roboto | Variable woff2 | Self-hosted: `/fonts/Roboto-VariableFont.woff2` |
| Body | Geist | Variable woff2 | Self-hosted: `/fonts/GeistVF.woff2` |
| Monospace | Geist Mono | woff2 | Self-hosted: `/fonts/GeistMono.woff2` |

**Font stack in `global.css`:**
```css
--font-lexend: 'Roboto', 'Geist', ui-sans-serif, system-ui, sans-serif;
--font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
--font-geist-mono: 'GeistMono', 'Input Mono', 'Fira Code', monospace;
```

Note: The CSS variable is named `--font-lexend` for historical reasons (Lexend was the original Litos heading font). It now loads Roboto.

### Theme Mode

**System preference only.** No manual theme toggle. The site respects `prefers-color-scheme` automatically. The `ThemeToggle` component has been removed from both Header and Footer.

Dark mode is applied via `darkMode: 'class'` in Tailwind with the class set by `public/js/theme.js` on page load.

### Favicon and Logo

| Asset | File | Description |
|-------|------|-------------|
| Primary favicon | `/public/favicon.svg` | Memoji (Lionel at MacBook) |
| PNG fallback | `/public/favicon.png` | Memoji (Lionel at MacBook) |
| Apple touch icon | `/public/apple-touch-icon.png` | Memoji (Lionel at MacBook) |
| Social share image | `/public/og-image.png` | Trippy split portrait (1280×640) |

### Date Format

All dates display as `Month DD, YYYY` — for example, `June 22, 2026`.

Implemented in `src/lib/utils.ts` via the `formatDate()` function using `toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` with manual reconstruction to place the comma after the day number rather than the month.

Dates in the GitHub heatmap tooltip are parsed as local time (not UTC) to avoid a one-day offset for users in timezones west of UTC.

---

## UX/UI Decisions

### Homepage Structure

The homepage (`src/pages/index.astro`) is hardcoded with three featured posts rather than dynamically pulling pinned/recommended posts. This was an intentional decision to give full editorial control over which posts appear without being dependent on frontmatter flags.

**Current featured posts (newest first):**
1. Why We Moved a Regional Broadcasting Company Off Amazon EC2 — and Why Microsoft Azure Won
2. When Microsoft's Own Email Becomes the Weapon
3. Three Questions Every CEO and Board Should Be Able to Answer

To update the homepage featured posts, edit the `featuredPosts` array in `src/pages/index.astro`.

### Post Layout

All five current posts use `postType: "coverTop"` — Unsplash cover image at the top, followed by metadata (date, reading time, word count, tags), then content. The `CoverTop.astro` layout handles rendering.

Cover images are sourced from Unsplash CDN URLs stored directly in post frontmatter. The `images.unsplash.com` domain is whitelisted in `astro.config.ts`.

### Social Share

The `SocialShare.astro` component is rendered on every individual post page (`src/pages/posts/[...id].astro`), positioned below post content and above Post Navigation. It provides share buttons for LinkedIn, X (Twitter), Facebook, and Reddit.

### Header Icons

| Icon | Action | Notes |
|------|--------|-------|
| Search | Opens Pagefind search panel | Ctrl+K shortcut supported |
| Calendar | Opens scheduling link | `https://4nb.cloud/lmosley` |
| RSS | Opens Atom feed | `#f26522` orange, fixed color |

### Navigation

The site uses Astro's View Transitions for smooth page navigation. The header and theme toggle persist across navigations via `transition:persist`.

---

## Layout and Structure

### Page Anatomy

Every page follows this structure:

```
<html>
  <head>
    Head.astro (SEO, fonts, preloads, canonical)
    GTM script
    Umami script
    Person JSON-LD
    WebSite JSON-LD
    BlogPosting JSON-LD (post pages only)
  </head>
  <body>
    HeaderGradient.astro (decorative)
    Header.astro (logo, nav, search, calendar, RSS)
    SectionDivider
    <main>
      [Page content via <slot />]
    </main>
    Footer.astro (nav links, copyright, social icons)
    Safari bottom overlay fix
  </body>
</html>
```

### Post Page Anatomy

```
TocMobile (mobile table of contents)
CoverTop layout:
  - Cover image
  - Title
  - Metadata (date, reading time, word count)
  - Tags
  - Content (markdown)
  - License (if applicable)
SocialShare (LinkedIn, X, Facebook, Reddit)
PostNavigation (previous / next post)
PostFeatures (desktop table of contents, back to top, progress ring)
SectionDivider
Comment (disabled)
```

### Skills Showcase

Three rows of animated skill cards in `src/config.ts` under `SKILLSSHOWCASE_CONFIG`:

- **Row 1 (left scroll):** Cloud & Microsoft — Azure, M365, AWS, Google Workspace, PowerShell, Windows Server, Linux
- **Row 2 (right scroll):** Security Frameworks — CISA SCuBA, NIST SP 800-53, MITRE ATT&CK, CIS Benchmarks, Microsoft Defender, Exchange Online
- **Row 3 (left scroll):** Infrastructure — Git, GitHub, Ubuntu, Debian, Node.js, Vercel, VS Code

---

## Integrations

### Google Tag Manager

| Field | Value |
|-------|-------|
| Container ID | GTM-543DS8T7 |
| Container Name | trust-lionel.com |
| Implementation | `is:inline` script in `Layout.astro` head and noscript iframe in body |
| GA4 Tag | G-YNZSY2L2XL (injected by GTM) |

GTM fires on all pages. The GA4 tag `G-YNZSY2L2XL` is managed inside the GTM container — not hardcoded in the site source.

### Umami Analytics

| Field | Value |
|-------|-------|
| Instance URL | https://umami-production-f3f3.up.railway.app |
| Website ID | b8e2a312-e7f4-4595-95ee-38b47fc9be54 |
| Script path | `/script.js` |
| Mode | Cookieless, GDPR-compliant |
| Hosting | Self-hosted on Railway |

Umami is loaded via `defer` script in `Layout.astro`. It runs alongside GTM/GA4.

### GitHub Contributions API

| Field | Value |
|-------|-------|
| API | https://github-contributions-api.jogruber.de/v4/{username}?y=last |
| Username | trust-lionel |
| Cache duration | 1 hour (localStorage) |
| Component | `src/components/base/GithubContributions.tsx` |

**Known behavior:** The API returns UTC dates. The component parses dates as local time to avoid a one-day display offset for CST users. The API aggregates contributions from the `trust-lionel` GitHub account only — organization contributions from `4thandBailey` are included if those commits are attributed to the `trust-lionel` user.

### Pagefind Search

| Field | Value |
|-------|-------|
| Version | 1.5.0 (Extended) |
| Index location | `dist/pagefind/` |
| Pages indexed | 5 (post pages only — uses `data-pagefind-body`) |
| Words indexed | 1,410 |
| Build step | `pnpm pagefind --site dist` (runs as `postbuild`) |
| CSP requirement | `'wasm-unsafe-eval'` in `script-src` (required for WASM) |

### Scheduling

| Field | Value |
|-------|-------|
| Provider | 4nb.cloud |
| Link | https://4nb.cloud/lmosley |
| Surface | Header calendar icon |

### Feeds

| Feed | URL | Format |
|------|-----|--------|
| RSS | trust-lionel.com/rss.xml | RSS 2.0 |
| Atom | trust-lionel.com/atom.xml | Atom 1.0 |

Both feeds are auto-generated at build time from post content in `src/lib/feed.ts`.

### Netlify

| Field | Value |
|-------|-------|
| Site name | trust-lionel |
| Branch | main (auto-deploy on push) |
| Build command | `pnpm run build && pnpm pagefind --site dist` |
| Publish directory | `dist` |
| Node version | 22 |

---

## Security

### Content Security Policy

The full CSP is defined in `netlify.toml` as HTTP response headers applied to all routes (`/*`).

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' data:
    https://www.googletagmanager.com
    https://umami-production-f3f3.up.railway.app
    https://events.vercount.one;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data:
    https://images.unsplash.com
    https://avatars.githubusercontent.com
    https://www.google.com
    https://github.githubassets.com
    https://www.googletagmanager.com;
  connect-src 'self'
    https://umami-production-f3f3.up.railway.app
    https://api.github.com
    https://github-contributions-api.jogruber.de
    https://www.google-analytics.com
    https://www.google.com;
  font-src 'self' https://cdn.jsdelivr.net data:;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

**CSP Directive Notes:**

| Directive | Reason for non-self sources |
|-----------|----------------------------|
| `'unsafe-inline'` in script-src | Required for Astro view transitions and inline scripts |
| `'wasm-unsafe-eval'` in script-src | Required for Pagefind WASM search engine |
| `data:` in script-src | Required for Astro view transitions router |
| `data:` in font-src | Required for Astro view transitions inline fonts |
| `cdn.jsdelivr.net` in style-src | KaTeX math formula stylesheet |
| `cdn.jsdelivr.net` in font-src | KaTeX math formula fonts |
| `www.googletagmanager.com` in img-src | GTM 1×1 pixel tracking images |
| `events.vercount.one` in script-src | Vercount page view counter (Litos default, currently unused) |

### Additional Security Headers

```toml
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

### Redirects and HTTPS Enforcement

```toml
[[redirects]]
  from = "http://trust-lionel.com/*"
  to = "https://trust-lionel.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://www.trust-lionel.com/*"
  to = "https://trust-lionel.com/:splat"
  status = 301
  force = true
```

All HTTP traffic and `www.` traffic is permanently redirected to `https://trust-lionel.com`.

### Cache Control

```toml
/_astro/*    → Cache-Control: public, max-age=31536000, immutable
/fonts/*     → Cache-Control: public, max-age=31536000, immutable
/*.html      → Cache-Control: public, max-age=0, must-revalidate
/sitemap*.xml → Cache-Control: public, max-age=0, must-revalidate
/robots.txt  → Cache-Control: public, max-age=0, must-revalidate
```

Hashed static assets (`_astro/`) are immutably cached for 1 year. HTML pages and crawlable files are never cached.

### GitHub Pages

GitHub Pages is **disabled** on the repository (`trust-lionel/trust-lionel`). The repository contains a `.nojekyll` file to prevent any Jekyll processing if GitHub Pages were inadvertently re-enabled. The site is deployed exclusively via Netlify.

---

## Content Management

### Adding a New Blog Post

1. Create a new `.md` file in `src/content/posts/`
2. Use the frontmatter template from the [Post Frontmatter Schema](#post-frontmatter-schema) section
3. Find an appropriate Unsplash image and use the URL format: `https://images.unsplash.com/photo-{ID}?w=1400&q=80&auto=format&fit=crop`
4. Write content in Markdown below the frontmatter
5. If the post should appear on the homepage, update the `featuredPosts` array in `src/pages/index.astro`
6. Run `pnpm build` to confirm no errors
7. Commit and push to `main`

### Updating the Homepage Featured Posts

Edit `src/pages/index.astro` — find the `featuredPosts` array and update the three entries:

```javascript
const featuredPosts = [
  {
    title: 'Post Title',
    url: '/posts/post-slug',
    date: 'Month DD, YYYY',
  },
  // ...
]
```

Always sort newest first.

### Adding a New Project

1. Create a new directory in `src/content/projects/{project-slug}/`
2. Create `index.mdx` inside it with the project frontmatter
3. Add a project icon PNG to `public/projects/{project-slug}.png`
4. The project will automatically appear on the Projects page

### Tags

Tags are defined in post frontmatter and automatically generate tag index pages at `/tags/{tag-name}/`. No manual configuration is required. Use consistent casing — tags are case-sensitive in URL generation.

---

## Build and Deployment

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
# Site available at http://localhost:4321

# Note: Pagefind search does not work in dev mode
# Run a full build to test search locally
pnpm build
pnpm preview
```

### Production Build

```bash
pnpm build
```

This runs:
1. `astro check` — TypeScript validation
2. `astro build` — Static site generation to `dist/`
3. `pagefind --site dist` — Search index generation

### Deployment

Netlify auto-deploys on every push to the `main` branch. No manual deployment steps are required.

**Git workflow:**
```bash
git add .
git commit -m "Descriptive commit message"
git push origin main
# Netlify auto-builds and deploys in ~2-3 minutes
```

**Important:** Do not use `git push --force` unless there is an explicit reason. Force pushing overwrites any commits made directly on GitHub (favicon uploads, README edits, etc.).

### Build Output

The `dist/` directory is generated at build time and is excluded from the repository (`.gitignore`). It is not committed to GitHub — Netlify rebuilds it on every deploy.

### Known Build Warnings

| Warning | Source | Impact |
|---------|--------|--------|
| `ts(6385): z.string().url() deprecated` | `src/content.config.ts:21` | None — Zod deprecation, harmless |

---

## Decision Log

### Architecture Decisions

| Decision | Choice Made | Alternative Considered | Reason |
|----------|------------|----------------------|--------|
| Framework | Astro v6 | Next.js, Gatsby | Static-first, zero JS by default, content-focused |
| Theme | Litos (custom fork) | Build from scratch | Strong feature set, good design baseline, faster to deploy |
| Hosting | Netlify | Vercel | Netlify's security headers and redirect configuration is more straightforward for this use case |
| Package manager | pnpm | npm, yarn | Required by Litos; faster installs, strict dependency resolution |
| Node version | 22 | 20 | Astro v6 minimum requirement |
| Rendering | Static (SSG) | SSR | No dynamic data requirements; static is faster and simpler |
| Search | Pagefind | Algolia, Meilisearch | Zero cost, static, no external dependency, WASM-powered |

### Design Decisions

| Decision | Choice Made | Alternative Considered | Reason |
|----------|------------|----------------------|--------|
| Theme mode | System preference only | Manual toggle | Removes UI complexity; respects user OS preference |
| Heading font | Roboto | Lato, Inter, Lexend (default) | Clean, widely recognized, good variable font support |
| Body font | Geist (Litos default) | Inter | Designed for code-adjacent content; fits developer/technical brand |
| Favicon | Memoji (Lionel at MacBook) | LM monogram | More personal and human; stronger brand recognition |
| Social sharing image | Trippy split portrait | Text-based card | Visually distinctive; matches brand personality |
| H1 color | `#0088cc` | Default foreground | Brand color differentiation; stands out without being aggressive |
| Link colors | Default Litos theme | Custom `#0000EE` | `#0000EE` looked harsh in dark mode; theme defaults work in both modes |
| Post card style | Minimal | Compact, ImageShow | Cleaner reading experience; dates without monospace font |

### Content Decisions

| Decision | Choice Made | Reason |
|----------|------------|--------|
| Homepage posts | Hardcoded array of 3 | Full editorial control; not dependent on frontmatter flags |
| Post sorting | Newest first | Standard blog convention |
| Date format | `Month DD, YYYY` | Readable and unambiguous; matches American English convention |
| Cover images | Unsplash CDN URLs | No storage cost; high quality; free for commercial use |
| Post layout | `coverTop` for all posts | Consistent visual experience across all content |
| Tags | Sentence case | Matches how tags appear in prose |

### SEO Decisions

| Decision | Choice Made | Reason |
|----------|------------|--------|
| Schema injection method | `set:html={JSON.stringify(...)}` | `is:inline` with `{JSON.stringify()}` renders as literal text; `set:html` evaluates at build time |
| BlogPosting schema | Dynamic via Layout prop | Avoids hardcoding per-post; automatically uses frontmatter values |
| Person schema location | `Layout.astro` | Appears on every page; maximizes entity authority signals |
| `maintainer` in Person schema | Removed | Google flagged `SoftwareApplication` and `SoftwareSourceCode` as invalid in the Person context |
| `author` in Person schema | Removed | Not a recognized property for Person type in schema.org |
| OG image | `/og-image.png` (trippy split portrait) | Distinctive; per-post OG uses Unsplash cover image when available |

### Security Decisions

| Decision | Choice Made | Reason |
|----------|------------|--------|
| CSP enforcement | HTTP headers via netlify.toml | More reliable than meta tags; cannot be overridden by page content |
| `'unsafe-inline'` in script-src | Included | Required for Astro view transitions; acceptable given no user input is processed |
| HTTPS enforcement | 301 redirect from HTTP and www | All traffic canonicalized to `https://trust-lionel.com` |
| GitHub Pages | Disabled | Site deploys via Netlify; Jekyll processing was causing build errors |
| `.nojekyll` | Added | Prevents accidental Jekyll processing if GitHub Pages is re-enabled |

---

## Future Enhancements

### Technical Roadmap

#### Astro 7.0 Upgrade
- **Status:** Planned
- **Released:** June 22, 2026
- **Key benefits:** 15–61% faster builds, Rust-powered `.astro` compiler, Rust-powered Markdown pipeline (Sätteri), Vite 8
- **Approach:** Create a branch (`git checkout -b astro-7-upgrade`), run `pnpm dlx @astrojs/upgrade`, fix any markup errors surfaced by the stricter Rust compiler, confirm clean build, merge to main
- **Risk:** New Rust compiler does not silently rewrite invalid HTML — unclosed tags will error

#### About Page
- **Status:** Planned
- **URL:** `/about`
- **Content:** Full bio, credentials (Microsoft CSP, Google Partner), Houston address, 4TH AND BAILEY relationship, professional timeline
- **SEO value:** Dedicated authority page for the Person schema to point to

#### Netlify Branch Deploys
- **Status:** Planned
- **Purpose:** Preview changes before merging to main
- **Setup:** Enable in Netlify → Site Settings → Build & Deploy → Branch deploys

#### Jekyll URL Redirects
- **Status:** Planned
- **Purpose:** Preserve any backlinks from the old Jekyll site
- **Implementation:** Add `[[redirects]]` entries in `netlify.toml` mapping old Jekyll URLs to new Astro URLs

### Platform Ideas

#### 1. The ahr-ki-tekt Decision Engine
An interactive, AI-powered tool embedded on the site where a visitor answers 6–8 questions about their organization (size, industry, current stack, compliance obligations, primary pain point) and receives a custom infrastructure recommendation report. The report cites the Infrastructure Placement Framework dynamically. Lead generation tool that demonstrates methodology in real time.
- **Technical approach:** Anthropic API via artifact, client-side React component, optional email gate before results delivery

#### 2. Live Security Posture Scorecard
A publicly accessible self-assessment tool where IT leaders answer questions about their Microsoft 365 and Azure environment and receive a scored, color-coded posture report with explicit callouts to CISA SCuBA and NIST controls. No competing tool ties this to a consultant's personal framework and offers it for free.
- **Technical approach:** Anthropic API, scoring engine, PDF export of results

#### 3. The Boardroom Briefing Series
A recurring, formatted series of one-page print-ready PDFs designed to be handed to board members. Each issue covers one question boards consistently get wrong about IT infrastructure or security. Format: "The ahr-ki-tekt Boardroom Brief, Issue 04."
- **Content foundation:** "Three Questions Every CEO and Board Should Be Able to Answer" post is Issue 01

#### 4. Houston Alert → National Civic Infrastructure Kit
Open-source the Houston Alert architecture as a replicable template any municipality or regional nonprofit could deploy. Package as "The ahr-ki-tekt Civic Infrastructure Kit" with documentation, a GitHub template repo, and a consulting engagement tier for cities that want deployment help.
- **Distribution:** GovTech publications, civic tech communities

#### 5. The CISO Reading Room
A curated, annotated resource library organized by framework (NIST, CISA SCuBA, MITRE ATT&CK, CIS). Each resource includes Lionel's commentary on why it matters and how it connects to real deployment decisions.
- **SEO value:** High — security professionals bookmark and share curated framework resources

#### 6. Client Architecture Showcase (Anonymized)
A dedicated, visually rich "Before & After Architecture" section where anonymized client environments are diagrammed: what existed, what was wrong, what was built, and what changed measurably.
- **Content foundation:** Regional broadcasting company cloud migration case study (cloud-migration.md)

#### 7. The ahr-ki-tekt Certification Path
A self-guided learning path — a structured sequence of posts, frameworks, and external resources — that leads to a verifiable "ahr-ki-tekt Infrastructure Foundations" badge issued via Credly or a similar platform.
- **Community value:** Creates a reason for junior IT professionals to orbit the brand for years

### Lead Magnet Resources (Planned)

| Resource | Target Persona | Format |
|----------|---------------|--------|
| TCO Worksheet | Finance / Procurement | Downloadable PDF / Excel |
| Phishing Playbook | InfoSec Officer | Downloadable PDF |
| Uptime Checklist | IT Director | Downloadable PDF |
| CEO Risk Document | Owner / CEO / Operator | Downloadable PDF |

These resources are referenced in the Google Search Console and schema strategy but have not yet been published. Each should live at a `/resources/` URL with its own page for SEO indexing.

---

## Handoff Notes for New Collaborators

### Getting Started

1. Clone the repository: `git clone https://github.com/trust-lionel/trust-lionel.git`
2. Install dependencies: `pnpm install` (must use pnpm — not npm or yarn)
3. Start dev server: `pnpm dev`
4. Site runs at `http://localhost:4321`

### Critical Files to Understand First

| File | Why |
|------|-----|
| `src/config.ts` | All site-wide settings — start here for any content or feature changes |
| `src/layouts/Layout.astro` | Root layout — contains all schema, analytics, and head configuration |
| `netlify.toml` | Build config and all security headers — changes here affect production security |
| `src/pages/index.astro` | Homepage — featured posts are hardcoded here |

### Things That Are Different from Default Litos

| Item | What Changed |
|------|-------------|
| Theme toggle | Removed — system preference only |
| Photos page | Removed — replaced by Consulting page |
| Heading font | Roboto instead of Lexend |
| Date format | `Month DD, YYYY` instead of dot notation |
| Post card dates | Roboto instead of monospace |
| Social icons | Brand colors instead of default theme colors |
| Favicon | Memoji instead of LM monogram |
| Footer | Custom copyright with social icons instead of Litos GitHub link |
| Chinese comments | All translated to American English |
| ShangguSansSC-VF | Removed — 100+ unused Chinese font files deleted |
| Schema | Comprehensive Person + WebSite + BlogPosting JSON-LD |

### Analytics Access

- **GTM:** Log in at tagmanager.google.com — Container ID: `GTM-543DS8T7`
- **GA4:** Tag `G-YNZSY2L2XL` is managed inside the GTM container
- **Umami:** Self-hosted at `umami-production-f3f3.up.railway.app` — Website ID: `b8e2a312-e7f4-4595-95ee-38b47fc9be54`

### Deploying Changes

```bash
# Make changes locally
git add .
git commit -m "Brief description of change"
git push origin main
# Netlify auto-deploys in 2-3 minutes
```

Do not use `git push --force` without a specific reason. Force pushing overwrites commits made directly on GitHub (favicon updates, README edits, etc.).

### Checking for Build Issues

Before pushing, always run:
```bash
pnpm build
```

A successful build outputs `0 errors` in the TypeScript check and `[build] Complete!` at the end. The only expected warning is the `z.string().url()` deprecation in `content.config.ts` which is harmless.

### Rich Results Validation

After any schema changes, validate at:
`https://search.google.com/test/rich-results`

Test both:
- `https://trust-lionel.com` — Person + WebSite schema
- `https://trust-lionel.com/posts/cloud-migration` — BlogPosting schema

Both should show 0 errors and 0 warnings.

---

*This document is maintained as a living record of the trust-lionel.com platform. Update the Changelog section and relevant sections whenever significant changes are made.*
