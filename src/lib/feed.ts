import { SITE } from '~/config'
import { getAllPosts } from '../lib/data'
import type { CollectionEntry } from 'astro:content'
import sanitizeHtml from 'sanitize-html'
import { createMarkdownProcessor } from '@astrojs/markdown-remark'
import { remarkPlugins, rehypePlugins } from '../../plugins'
import { getImage } from 'astro:assets'
import type { ImageMetadata } from 'astro'

interface RSSConfig {
  siteUrl: string
  title: string
  description: string
  author: string
  lang: string
  posts: CollectionEntry<'posts'>[]
}

// Site configuration
const config: RSSConfig = {
  siteUrl: SITE.website,
  title: SITE.title,
  description: SITE.description,
  author: SITE.author,
  lang: SITE.lang,
  posts: await getAllPosts(),
}

// XML escape function
export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

// Strip ANSI color sequences and invalid XML control characters
const ANSI_REGEX = /\u001B\[[0-?]*[ -/]*[@-~]/g
export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '')
}
export function removeInvalidXmlChars(text: string): string {
  // Only allow \t \n \r from C0 control characters; strip all others
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}

// Get all image assets - corrected types
const imageModules = import.meta.glob<{ default: ImageMetadata }>('/src/content/posts/**/assets/*.{jpeg,jpg,png,gif,webp,svg}', {
  eager: true,
})

// Clean HTML content back to markdown essentials
function cleanHtmlForRSS(htmlContent: string): string {
  let cleaned = htmlContent

  // 1. Remove anchor links from headings (h1-h6)
  cleaned = cleaned.replace(/<(h[1-6])([^>]*)>(.*?)<a[^>]*href="#[^"]*"[^>]*>[^<]*<\/a><\/\1>/gi, '<$1$2>$3</$1>')

  // 2. Convert enhanced syntax links to plain links (strip icons)
  // :link[text]{id=url} -> <a href="url">text</a>
  cleaned = cleaned.replace(/:link\[([^\]]+)\]\{id=([^}]+)\}/g, '<a href="$2">$1</a>')

  // 3. Remove all icon.horse icons
  cleaned = cleaned.replace(/<img[^>]*src="[^"]*icon\.horse[^"]*"[^>]*>/gi, '')

  // 4. Clean up extra icons and whitespace from links
  cleaned = cleaned.replace(/<a([^>]*)>\s*<img[^>]*>\s*([^<]+)\s*<\/a>/gi, '<a$1>$2</a>')

  // 5. Handle dual images in figures — keep img-light or first image
  cleaned = cleaned.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (match, content) => {
    // Find all images
    const imgMatches = content.match(/<img[^>]*>/g)
    if (imgMatches && imgMatches.length > 1) {
      // Prefer img-light; fall back to first image
      const lightImg = imgMatches.find((img: string) => img.includes('img-light'))
      const selectedImg = lightImg || imgMatches[0]

      // Extract figcaption
      const figcaptionMatch = content.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)
      const figcaption = figcaptionMatch ? figcaptionMatch[0] : ''

      return `<figure>${selectedImg}${figcaption}</figure>`
    }
    return match
  })

  return cleaned
}

// Process image paths — convert relative paths to Astro-optimized paths
async function processImagePaths(htmlContent: string, siteUrl: string, postId: string): Promise<string> {
  const imgRegex = /<img([^>]+)src=['"]([^'"]+)['"]([^>]*)>/gi
  let processedContent = htmlContent

  const matches = Array.from(htmlContent.matchAll(imgRegex))

  for (const match of matches) {
    const [fullMatch, beforeSrc, src, afterSrc] = match

    // Skip images that are already absolute paths
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/_astro/')) {
      continue
    }

    // Handle relative path images
    if (src.startsWith('assets/')) {
      const imagePath = `/src/content/posts/${postId}/${src}`
      const imageModule = imageModules[imagePath]

      if (imageModule && imageModule.default) {
        try {
          // Use imageModule.default to get ImageMetadata
          const optimizedImage = await getImage({ src: imageModule.default })
          const absoluteUrl = new URL(optimizedImage.src, siteUrl).toString()

          const newImgTag = `<img${beforeSrc}src="${absoluteUrl}"${afterSrc}>`
          processedContent = processedContent.replace(fullMatch, newImgTag)
        } catch (error) {
          console.warn(`Failed to process image: ${imagePath}`, error)
          // Fall back to basic absolute path
          const fallbackUrl = `${siteUrl}/src/content/posts/${postId}/${src}`
          const newImgTag = `<img${beforeSrc}src="${fallbackUrl}"${afterSrc}>`
          processedContent = processedContent.replace(fullMatch, newImgTag)
        }
      }
    }
  }

  return processedContent
}

// Add cover image to the top of the post
async function addCoverImage(post: CollectionEntry<'posts'>, siteUrl: string): Promise<string> {
  if (!post.data.cover) {
    return ''
  }

  try {
    if (post.data.cover && typeof post.data.cover === 'object' && post.data.cover.src) {
      const optimizedImage = await getImage({ src: post.data.cover })
      const absoluteUrl = new URL(optimizedImage.src, siteUrl).toString()
      const coverHtml = `<img src="${absoluteUrl}" alt="${post.data.title}" style="width: 100%; height: auto; margin-bottom: 1em;" />`
      return coverHtml
    }
    return ''
  } catch (error) {
    console.warn(`Failed to process cover image:`, error)
    return ''
  }
}

// Shared post processing logic
async function processPostsForFeed() {
  const { posts, siteUrl } = config

  // Create a markdown processor matching the project config
  const processor = await createMarkdownProcessor({
    remarkPlugins,
    rehypePlugins,
    syntaxHighlight: false, // Match astro.config.ts setting
  })

  // Process all posts
  const processedPosts = await Promise.all(
    posts.map(async (post) => {
      if (!post.body) {
        return { ...post, htmlContent: '' }
      }

      try {
        // Use Astro markdown processor
        const result = await processor.render(post.body)

        // Sanitize HTML content
        const rawHtml = removeInvalidXmlChars(stripAnsi(result.code))
        const sanitizedContent = sanitizeHtml(rawHtml, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: ['href', 'target', 'rel'], // Allow link attributes
            img: ['src', 'alt', 'width', 'height', 'class', 'style'], // Allow image attributes
            figure: ['class'],
            figcaption: ['class'],
          },
        })

        // Clean HTML back to markdown essentials
        const cleanedContent = cleanHtmlForRSS(sanitizedContent)

        // Process image paths
        const processedContent = await processImagePaths(cleanedContent, siteUrl, post.id)

        // Add cover image
        const coverImage = await addCoverImage(post, siteUrl)

        const htmlContent = coverImage + '\n' + processedContent

        return { ...post, htmlContent }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error)
        return { ...post, htmlContent: '' }
      }
    })
  )

  return processedPosts
}

export async function generateRSS20(): Promise<string> {
  const { title, description, siteUrl, author, lang } = config
  const lastBuildDate = new Date().toISOString()

  const processedPosts = await processPostsForFeed()

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss/rss-styles.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${siteUrl}</link>
    <language>${lang}</language>
    <managingEditor>${escapeXml(author)}</managingEditor>
    <webMaster>${escapeXml(author)}</webMaster>
    <author>${escapeXml(author)}</author>
    <pubDate>${lastBuildDate}</pubDate>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Astro Litos Theme</generator>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${processedPosts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${siteUrl}/posts/${post.id}</link>
      <guid>${siteUrl}/posts/${post.id}</guid>
      <updated>${(post.data.updatedDate || post.data.pubDate).toISOString()}</updated>
      <pubDate>${post.data.pubDate.toISOString()}</pubDate>
      <description><![CDATA[${post.data.description || ''}]]></description>
      <content:encoded><![CDATA[${post.htmlContent}]]></content:encoded>
      <author>${escapeXml(post.data.author || author)}</author>
      ${post.data.tags ? post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('') : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`
}

export async function generateAtom10(): Promise<string> {
  const { title, description, siteUrl, author, lang } = config
  const lastBuildDate = new Date().toISOString()

  const processedPosts = await processPostsForFeed()

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss/atom-styles.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${siteUrl}" rel="alternate" type="text/html"/>
  <updated>${lastBuildDate}</updated>
  <language>${lang}</language>
  <id>${siteUrl}/</id>
  <author>
    <name>${escapeXml(author)}</name>
    <uri>${siteUrl}</uri>
  </author>
  <generator uri="https://github.com/Dnzzk2/Litos" version="5.0">Astro Litos Theme</generator>
  <rights>Copyright © ${new Date().getFullYear()} ${escapeXml(author)}</rights>
  ${processedPosts
    .map(
      (post) => `
  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${siteUrl}/posts/${post.id}" rel="alternate" type="text/html"/>
    <id>${siteUrl}/posts/${post.id}</id>
    <updated>${(post.data.updatedDate || post.data.pubDate).toISOString()}</updated>
    <published>${post.data.pubDate.toISOString()}</published>
    <author>
      <name>${escapeXml(post.data.author || author)}</name>
    </author>
    <summary type="text">${escapeXml(post.data.description || '')}</summary>
    <content type="html"><![CDATA[${post.htmlContent}]]></content>
    ${post.data.tags ? post.data.tags.map((tag) => `<category term="${escapeXml(tag)}" />`).join('\n    ') : ''}
  </entry>`
    )
    .join('')}
</feed>`
}
