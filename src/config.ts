// ============================================================
// src/config.ts — Lionel Mosley | ahr-ki-tekt
// Litos Theme Configuration
// https://trust-lionel.com
// ============================================================

import type {
  Site,
  Link,
  SocialLink,
  GithubConfig,
  SkillsShowcaseConfig,
  PostConfig,
  ProjectConfig,
  TagsConfig,
  CommentConfig,
} from './types'

// ── SITE ─────────────────────────────────────────────────────
export const SITE: Site = {
  title: 'Lionel Mosley | ahr-ki-tekt',
  description:
    'Carefully selected frameworks, insights, and solutions from Lionel Mosley — IT Consultant & Innovative Thought Leader based in Houston, TX.',
  website: 'https://trust-lionel.com/',
  lang: 'en',
  base: '/',
  author: 'Lionel Mosley',
  ogImage: '/og-image.png',
  transition: true,
  themeAnimation: true, // Site-wide OG fallback — your existing banner
}

// ── HEADER LINKS ─────────────────────────────────────────────
// Posts, Projects, and Consulting replace the default Photos
export const HEADER_LINKS: Link[] = [
  {
    name: 'Posts',
    url: '/posts',
  },
  {
    name: 'Projects',
    url: '/projects',
  },
  {
    name: 'Consulting',
    url: '/consulting',
  },
]

// ── FOOTER LINKS ─────────────────────────────────────────────
export const FOOTER_LINKS: Link[] = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'Posts',
    url: '/posts',
  },
  {
    name: 'Projects',
    url: '/projects',
  },
  {
    name: 'Tags',
    url: '/tags',
  },
  {
    name: 'Events',
    url: '/events',
  },
  {
    name: 'Consulting',
    url: '/consulting',
  },
]

// ── SOCIAL LINKS ─────────────────────────────────────────────
// Icons sourced from Iconify Remix Icons (ri) set.
// Four platforms only — GitHub, LinkedIn, Reddit, Spotify.
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/trust-lionel',
    icon: 'icon-[ri--github-fill]',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lionelmosley',
    icon: 'icon-[ri--linkedin-fill]',
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com/user/trust-lionel/',
    icon: 'icon-[ri--reddit-fill]',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/lmosley002-spotify',
    icon: 'icon-[ri--spotify-fill]',
  },
]

// ── GITHUB / SPOTLIGHT ───────────────────────────────────────
export const GITHUB_CONFIG: GithubConfig = {
  ENABLED: true,
  GITHUB_USERNAME: 'trust-lionel',
  TOOLTIP_ENABLED: true,
}

// ── SKILLS SHOWCASE ──────────────────────────────────────────
// Three rows of domain expertise — replaces the default dev-tools marquee.
// Icons sourced from Iconify skill-icons and devicons sets.
// Row 1 scrolls left  — Cloud & Microsoft platforms
// Row 2 scrolls right — Security frameworks & standards
// Row 3 scrolls left  — Infrastructure & tooling
export const SKILLSSHOWCASE_CONFIG: SkillsShowcaseConfig = {
  SKILLS_ENABLED: true,
  SKILLS_DATA: [
    {
      direction: 'left',
      skills: [
        {
          name: 'Microsoft Azure',
          icon: 'icon-[skill-icons--azure-dark]',
          url: 'https://azure.microsoft.com/',
        },
        {
          name: 'Microsoft 365',
          icon: 'icon-[skill-icons--azure-dark]',
          url: 'https://www.microsoft.com/en-us/microsoft-365',
        },
        {
          name: 'Amazon AWS',
          icon: 'icon-[skill-icons--aws-dark]',
          url: 'https://aws.amazon.com/',
        },
        {
          name: 'Google Workspace',
          icon: 'icon-[skill-icons--gcp-dark]',
          url: 'https://workspace.google.com/',
        },
        {
          name: 'PowerShell',
          icon: 'icon-[skill-icons--powershell-dark]',
          url: 'https://learn.microsoft.com/en-us/powershell/',
        },
        {
          name: 'Windows Server',
          icon: 'icon-[skill-icons--windows-dark]',
          url: 'https://www.microsoft.com/en-us/windows-server',
        },
        {
          name: 'Linux',
          icon: 'icon-[skill-icons--linux-dark]',
          url: 'https://www.linux.org/',
        },
      ],
    },
    {
      direction: 'right',
      skills: [
        {
          name: 'CISA SCuBA',
          icon: 'icon-[skill-icons--vscode-dark]', // Placeholder — swap when Iconify adds a CISA icon
          url: 'https://www.cisa.gov/resources-tools/services/secure-cloud-business-applications-scuba-project',
        },
        {
          name: 'NIST SP 800-53',
          icon: 'icon-[skill-icons--vim-dark]', // Placeholder — swap for a shield/lock icon
          url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
        },
        {
          name: 'MITRE ATT&CK',
          icon: 'icon-[skill-icons--docker]', // Placeholder — swap for relevant icon
          url: 'https://attack.mitre.org/',
        },
        {
          name: 'CIS Benchmarks',
          icon: 'icon-[skill-icons--docker]',  // Placeholder — swap for relevant icon
          url: 'https://www.cisecurity.org/cis-benchmarks',
        },
        {
          name: 'Microsoft Defender',
          icon: 'icon-[skill-icons--azure-dark]',
          url: 'https://www.microsoft.com/en-us/security/business/microsoft-defender',
        },
        {
          name: 'Exchange Online',
          icon: 'icon-[skill-icons--github-dark]',
          url: 'https://www.microsoft.com/en-us/microsoft-365/exchange/email',
        },
      ],
    },
    {
      direction: 'left',
      skills: [
        {
          name: 'Git',
          icon: 'icon-[skill-icons--git]',
          url: 'https://git-scm.com/',
        },
        {
          name: 'GitHub',
          icon: 'icon-[skill-icons--github-dark]',
          url: 'https://github.com/',
        },
        {
          name: 'Ubuntu',
          icon: 'icon-[skill-icons--ubuntu-dark]',
          url: 'https://ubuntu.com/',
        },
        {
          name: 'Debian',
          icon: 'icon-[skill-icons--debian-dark]',
          url: 'https://www.debian.org/',
        },
        {
          name: 'Node.js',
          icon: 'icon-[skill-icons--nodejs-dark]',
          url: 'https://nodejs.org/',
        },
        {
          name: 'Vercel',
          icon: 'icon-[skill-icons--vercel-dark]',
          url: 'https://vercel.com/',
        },
        {
          name: 'VS Code',
          icon: 'icon-[skill-icons--vscode-dark]',
          url: 'https://code.visualstudio.com/',
        },
      ],
    },
  ],
}

// ── POSTS ────────────────────────────────────────────────────
export const POSTS_CONFIG: PostConfig = {
  title: 'Posts',
  description:
    'Carefully selected frameworks, insights, and solutions from Lionel Mosley — IT Consultant & Innovative Thought Leader.',
  introduce:
    'Frameworks, insights, and analysis on cloud infrastructure, cybersecurity, Microsoft 365, and enterprise IT governance.',
  author: 'Lionel Mosley',
  homePageConfig: {
    size: 3,         // Number of posts shown on the Readme homepage
    type: 'minimal', // compact | minimal | time-line | image
  },
  postPageConfig: {
    size: 10,
    type: 'minimal',
  },
  tagsPageConfig: {
    size: 10,
    type: 'time-line',
  },
  ogImageUseCover: true,   // Use each post's cover image as its OG image
  postType: 'coverTop',    // metaOnly | coverSplit | coverTop
  imageDarkenInDark: true,
  readMoreText: 'Read more',
  prevPageText: 'Previous',
  nextPageText: 'Next',
  tocText: 'On this page',
  backToPostsText: 'Back to Posts',
  nextPostText: 'Next Post',
  prevPostText: 'Previous Post',
  recommendText: 'Featured',
  wordCountView: true,
}

// ── PROJECTS ─────────────────────────────────────────────────
export const PROJECTS_CONFIG: ProjectConfig = {
  title: 'Projects',
  description:
    'Open-source frameworks, tools, and applications built by Lionel Mosley and 4TH AND BAILEY.',
  introduce:
    'Open-source frameworks, tools, and applications built by Lionel Mosley and 4TH AND BAILEY — free to use, fork, and build on.',
}

// ── TAGS ─────────────────────────────────────────────────────
export const TAGS_CONFIG: TagsConfig = {
  title: 'Tags',
  description: 'All tags for posts on the ahr-ki-tekt Design Journal.',
  introduce:
    'Browse all post tags — click any tag to filter posts by topic.',
}

// ── CONSULTING PAGE ──────────────────────────────────────────
// Replaces PHOTOS_CONFIG. If you rename the type in types.ts,
// update the import and export name accordingly.
export const CONSULTING_CONFIG = {
  title: 'Consulting',
  description:
    'Full-service IT consulting from Lionel Mosley and 4TH AND BAILEY — cloud services, cybersecurity, infrastructure governance, and advisory retainers.',
  introduce:
    'From cloud migration to enterprise security governance — 4TH AND BAILEY designs, builds, and operates the technology infrastructure that organizations depend on.',
}

// ── COMMENT SYSTEM ───────────────────────────────────────────
// Gitalk uses GitHub Issues as the comment backend.
// Set enabled: false to disable comments entirely.
// Store CLIENT_ID and CLIENT_SECRET in .env — never hardcode.
export const COMMENT_CONFIG: CommentConfig = {
  enabled: false, // Set to true and configure below when ready to enable
  system: 'none', // 'gitalk' | 'none'
  gitalk: {
    clientID: import.meta.env.PUBLIC_GITHUB_CLIENT_ID,
    clientSecret: import.meta.env.PUBLIC_GITHUB_CLIENT_SECRET,
    repo: 'trust-lionel',           // Your GitHub repo for storing comment issues
    owner: 'trust-lionel',
    admin: ['trust-lionel'],
    language: 'en-US',
    perPage: 10,
    pagerDirection: 'last',
    createIssueManually: false,
    distractionFreeMode: false,
    enableHotKey: true,
  },
}

// ── ANALYTICS ────────────────────────────────────────────────
// Litos built-in analytics config.
// Umami is cookieless, GDPR-compliant, self-hosted on Railway.
// GTM is added separately via Layout-additions.astro.
import type { AnalyticsConfig } from './types'

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  umami: {
    enabled: true,
    serverUrl: 'https://umami-production-f3f3.up.railway.app/script.js',
    websiteId: 'b8e2a312-e7f4-4595-95ee-38b47fc9be54',
  },
}
