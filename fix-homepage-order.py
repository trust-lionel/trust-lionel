#!/usr/bin/env python3
with open('src/pages/index.astro', 'r') as f:
    c = f.read()

old = """const featuredPosts = [
  {
    title: 'What This Week\\'s American Airlines Outage Has in Common With Your Server Room',
    url: '/posts/physical-network-skill-shortage',
    date: 'July 30, 2026',
  },
  {
    title: 'What Attackers Do After They Get Past Your MFA',
    url: '/posts/what-attackers-do-after-mfa',
    date: 'July 16, 2026',
  },
  {
    title: 'Microsoft Entra ID Is Retiring SMS MFA — What Your Organization Needs to Do Before September 1, 2026',
    url: '/posts/microsoft-entra-id-sms-mfa-retirement',
    date: 'August 6, 2026',
  },
]"""

new = """const featuredPosts = [
  {
    title: 'Microsoft Entra ID Is Retiring SMS MFA — What Your Organization Needs to Do Before September 1, 2026',
    url: '/posts/microsoft-entra-id-sms-mfa-retirement',
    date: 'August 6, 2026',
  },
  {
    title: 'What This Week\\'s American Airlines Outage Has in Common With Your Server Room',
    url: '/posts/physical-network-skill-shortage',
    date: 'July 30, 2026',
  },
  {
    title: 'What Attackers Do After They Get Past Your MFA',
    url: '/posts/what-attackers-do-after-mfa',
    date: 'July 16, 2026',
  },
]"""

c = c.replace(old, new)

with open('src/pages/index.astro', 'w') as f:
    f.write(c)

print('Done')
