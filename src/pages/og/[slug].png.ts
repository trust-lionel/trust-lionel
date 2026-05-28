import satori from 'satori';
import sharp from 'sharp';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

// Load Inter font from @fontsource package at build time
const fontRegular = readFileSync(
  resolve('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2')
);
const fontBold = readFileSync(
  resolve('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2')
);

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const { title, author = 'Lionel Mosley', date, tags = [] } = post.data;

  const displayDate = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  const primaryTag = tags[0] ?? 'ahr-ki-tekt';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          width: '1200px', height: '630px', background: '#0d0d0d',
          padding: '60px', fontFamily: 'Inter, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '2px' },
                    children: [
                      { type: 'span', props: { style: { fontSize: '18px', fontWeight: '700', color: '#f5f5f5', letterSpacing: '-0.01em' }, children: 'Lionel Mosley' } },
                      { type: 'span', props: { style: { fontSize: '13px', fontWeight: '400', color: '#6b67f0' }, children: 'ahr-ki-tekt' } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: '400', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.05em' },
                    children: primaryTag,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'center', padding: '40px 0' },
              children: [
                { type: 'div', props: { style: { fontSize: title.length > 60 ? '42px' : '52px', fontWeight: '700', lineHeight: '1.15', color: '#ffffff', letterSpacing: '-0.025em', maxWidth: '960px' }, children: title } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '16px' },
                    children: [
                      { type: 'div', props: { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#6b67f0', fontSize: '13px', fontWeight: '700', color: '#ffffff' }, children: 'LM' } },
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column', gap: '2px' },
                          children: [
                            { type: 'span', props: { style: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.75)' }, children: author } },
                            { type: 'span', props: { style: { fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.35)' }, children: displayDate } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { type: 'span', props: { style: { fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }, children: 'trust-lionel.com' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
