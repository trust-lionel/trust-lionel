# System Theme Configuration
# Lionel Mosley | ahr-ki-tekt — Litos Migration
# =====================================================
# Two changes required to make the site follow the
# device OS light/dark setting automatically, with no
# manual toggle visible to the user.
# =====================================================


## CHANGE 1 — tailwind.config.mjs
# ─────────────────────────────────────────────────────
# File location: [project root]/tailwind.config.mjs
#
# Find this line:
#   darkMode: 'class',
#
# Replace it with:
#   darkMode: 'media',
#
# This switches Tailwind from class-based dark mode
# (where a .dark class is toggled on <html> by JS)
# to media-query-based dark mode (where the OS
# prefers-color-scheme setting drives Tailwind's
# dark: variants automatically via CSS).
#
# Result: no JavaScript, no localStorage, no toggle —
# the browser/OS setting is the sole driver.


## CHANGE 2 — Remove the ThemeToggle component
# ─────────────────────────────────────────────────────
# The ThemeToggle button appears in two places in Litos:
#
#   src/components/base/Header.astro  (header, top right)
#   src/components/base/Footer.astro  (footer, bottom right)
#
# In each file, locate and remove the ThemeToggle import
# and its usage:
#
#   // Remove this import line:
#   import ThemeToggle from '~/components/base/ThemeToggle'
#
#   // Remove this JSX/Astro element wherever it appears:
#   <ThemeToggle client:load />
#
# Once removed, the header and footer will no longer
# show the sun/moon/system toggle icon.


## CHANGE 3 — Simplify or remove public/js/theme.js
# ─────────────────────────────────────────────────────
# Litos ships a theme.js script that reads localStorage
# and applies the .dark class to <html> before the page
# renders (to prevent flash of wrong theme).
#
# After switching to darkMode: 'media', this script is
# no longer needed. You have two options:
#
# Option A (recommended) — Delete the script reference:
#   In src/layouts/Layout.astro, find and remove:
#     <script src="/js/theme.js"></script>
#   Then delete public/js/theme.js.
#
# Option B — Leave it in place:
#   The script will still run but will have no effect,
#   since Tailwind's media mode ignores the .dark class.
#   Harmless, but unnecessary weight.
#
# Option A is cleaner and removes a render-blocking
# script from your <head>.


## VERIFICATION
# ─────────────────────────────────────────────────────
# After making these changes:
#
# 1. Run `pnpm run dev` locally.
# 2. On your MacBook Pro, go to System Settings →
#    Appearance and switch between Light and Dark.
# 3. The site should switch instantly with no page
#    reload and no toggle interaction required.
# 4. Confirm on both Safari and Chrome, as each reads
#    prefers-color-scheme from the OS independently.
#
# Note: The Litos GitHub contributions heatmap component
# (GithubContributions) also respects dark mode visually.
# Verify it renders correctly in both modes after the
# tailwind.config.mjs change.


## WHY THIS APPROACH
# ─────────────────────────────────────────────────────
# Your buyer personas — CIOs, IT Directors, InfoSec
# Officers, and Owner/CEO/Operators — are professionals
# who have set their OS appearance deliberately.
# Respecting that setting without asking them to interact
# with a toggle is a small but meaningful UX signal that
# the site is built with intention.
#
# It also removes one interactive element from the
# critical rendering path, which marginally improves
# Lighthouse performance scores.
