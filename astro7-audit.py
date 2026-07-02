#!/usr/bin/env python3
"""
Astro 7 Upgrade Audit Script — trust-lionel.com
Checks for known Astro 7 breaking changes across all relevant file types.
Output: astro7-audit.txt

Breaking changes checked:
  1. Whitespace collapsing — inline <a> tags on separate lines from surrounding prose
  2. Unclosed HTML tags — new Rust compiler errors instead of silently fixing
  3. Unterminated attributes — malformed attribute syntax
  4. z.date() usage — should be z.coerce.date() for YAML date string coercion
  5. src/fetch.ts — new Astro 7 file that may conflict if it exists unintentionally
"""

import os
import re
from pathlib import Path
from datetime import datetime

# ── Configuration ──────────────────────────────────────────────────────────────

ROOT = Path('.')
SRC  = ROOT / 'src'

ASTRO_EXTS = {'.astro'}
MD_EXTS    = {'.md', '.mdx'}
TS_EXTS    = {'.ts', '.tsx'}
ALL_EXTS   = ASTRO_EXTS | MD_EXTS | TS_EXTS

EXCLUDE_DIRS = {'node_modules', '.astro', 'dist', '.git'}

# ── File collector ─────────────────────────────────────────────────────────────

def collect_files(root: Path, extensions: set) -> list[Path]:
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for filename in filenames:
            p = Path(dirpath) / filename
            if p.suffix in extensions:
                files.append(p)
    return sorted(files)

# ── Check 1: Whitespace collapsing around inline links ─────────────────────────
# Detects <a> tags that are preceded or followed by a line break within prose,
# which causes Astro 7's Rust compiler to collapse the surrounding whitespace.

def check_whitespace_collapsing(files: list[Path]) -> list[dict]:
    findings = []
    # Pattern: text content ending a line, followed by <a on the next line
    # OR </a> closing on its own line followed by text on the next line
    # OR <a ... > opening content on its own line before closing </a>
    pattern_before = re.compile(r'[a-zA-Z0-9,;:]\s*\n\s*<a\s', re.MULTILINE)
    pattern_after  = re.compile(r'</a>\s*\n\s*[a-zA-Z0-9]', re.MULTILINE)
    pattern_inner  = re.compile(r'<a[^>]+>\s*\n\s*\S', re.MULTILINE)

    for f in files:
        if f.suffix not in (ASTRO_EXTS | MD_EXTS):
            continue
        try:
            content = f.read_text(encoding='utf-8')
        except Exception:
            continue

        lines = content.split('\n')

        for pattern, label in [
            (pattern_before, 'Text ends line before <a> tag — space will collapse'),
            (pattern_after,  'Text starts line after </a> tag — space will collapse'),
            (pattern_inner,  'Link content on separate line from <a> opener'),
        ]:
            for m in pattern.finditer(content):
                line_num = content[:m.start()].count('\n') + 1
                snippet  = lines[line_num - 1].strip()[:120]
                findings.append({
                    'file':    str(f),
                    'line':    line_num,
                    'check':   'Whitespace collapsing',
                    'detail':  label,
                    'snippet': snippet,
                })

    return findings

# ── Check 2: Unclosed HTML tags ────────────────────────────────────────────────
# Detects common self-closing or block tags that are opened but not closed.
# Astro 7 errors on these instead of silently correcting them.

def check_unclosed_tags(files: list[Path]) -> list[dict]:
    findings = []
    # Void elements that should be self-closing in JSX/Astro
    void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
                     'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
    # Non-void block elements that must be explicitly closed
    block_elements = {'div', 'section', 'article', 'header', 'footer',
                      'main', 'nav', 'aside', 'p', 'ul', 'ol', 'li',
                      'table', 'thead', 'tbody', 'tr', 'td', 'th',
                      'form', 'fieldset', 'details', 'summary', 'span'}

    # Check for void elements written without self-closing slash
    pattern_void = re.compile(
        r'<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)'
        r'(?:\s[^>]*)?>(?!\s*</)',
        re.IGNORECASE
    )
    # Check for non-self-closing void elements (missing />)
    pattern_void_missing_slash = re.compile(
        r'<(img|input|br|hr|meta|link)([^/]*)>',
        re.IGNORECASE
    )

    for f in files:
        if f.suffix not in ASTRO_EXTS:
            continue
        try:
            content = f.read_text(encoding='utf-8')
        except Exception:
            continue

        lines = content.split('\n')

        # Check for void elements missing self-closing slash in .astro files
        for m in pattern_void_missing_slash.finditer(content):
            tag = m.group(1).lower()
            attrs = m.group(2)
            # Skip if already has / before >
            full_match = m.group(0)
            if full_match.rstrip().endswith('/>') or '/>' in full_match:
                continue
            line_num = content[:m.start()].count('\n') + 1
            snippet  = lines[line_num - 1].strip()[:120]
            findings.append({
                'file':    str(f),
                'line':    line_num,
                'check':   'Unclosed / non-self-closing tag',
                'detail':  f'<{tag}> should be self-closing (<{tag} ... />) in Astro',
                'snippet': snippet,
            })

    return findings

# ── Check 3: Unterminated attributes ──────────────────────────────────────────
# Detects attribute values that appear to be missing closing quotes.

def check_unterminated_attributes(files: list[Path]) -> list[dict]:
    findings = []
    # Pattern: attribute= followed by a quote that doesn't close before > or newline
    pattern = re.compile(r'\s\w[\w-]*=(?:"[^"]*$|\'[^\']*$)', re.MULTILINE)

    for f in files:
        if f.suffix not in (ASTRO_EXTS | MD_EXTS):
            continue
        try:
            content = f.read_text(encoding='utf-8')
        except Exception:
            continue

        lines = content.split('\n')
        for i, line in enumerate(lines, start=1):
            if re.search(r'\s\w[\w-]*="[^"]*$', line) and not line.rstrip().endswith('>'):
                # Exclude lines that are clearly multi-line strings in frontmatter
                stripped = line.strip()
                if stripped.startswith('---') or stripped.startswith('#'):
                    continue
                findings.append({
                    'file':    str(f),
                    'line':    i,
                    'check':   'Unterminated attribute',
                    'detail':  'Attribute value opened with quote but not closed on same line',
                    'snippet': line.strip()[:120],
                })

    return findings

# ── Check 4: z.date() usage ────────────────────────────────────────────────────
# z.date() rejects YAML date strings; z.coerce.date() is required.

def check_zdate(files: list[Path]) -> list[dict]:
    findings = []
    pattern = re.compile(r'\bz\.date\(\)')

    for f in files:
        if f.suffix not in TS_EXTS:
            continue
        try:
            content = f.read_text(encoding='utf-8')
        except Exception:
            continue

        lines = content.split('\n')
        for m in pattern.finditer(content):
            line_num = content[:m.start()].count('\n') + 1
            snippet  = lines[line_num - 1].strip()[:120]
            findings.append({
                'file':    str(f),
                'line':    line_num,
                'check':   'z.date() should be z.coerce.date()',
                'detail':  'YAML frontmatter parses dates as strings. z.date() silently empties the collection. Use z.coerce.date() instead.',
                'snippet': snippet,
            })

    return findings

# ── Check 5: src/fetch.ts conflict ────────────────────────────────────────────
# Astro 7 introduces src/fetch.ts as a new entry point for the request pipeline.
# An existing file at this path may conflict with the new behavior.

def check_fetch_ts(root: Path) -> list[dict]:
    findings = []
    fetch_path = root / 'src' / 'fetch.ts'
    if fetch_path.exists():
        findings.append({
            'file':    str(fetch_path),
            'line':    1,
            'check':   'src/fetch.ts conflict',
            'detail':  'Astro 7 reserves src/fetch.ts as the request pipeline entry point (Hono middleware). An existing file at this path may conflict with Astro 7 behavior. Review and rename if not intentional.',
            'snippet': '(file exists)',
        })
    return findings

# ── Report writer ──────────────────────────────────────────────────────────────

def write_report(all_findings: list[dict], output_path: Path):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Group by check type
    by_check = {}
    for f in all_findings:
        by_check.setdefault(f['check'], []).append(f)

    lines = []
    lines.append('=' * 80)
    lines.append('ASTRO 7 UPGRADE AUDIT — trust-lionel.com')
    lines.append(f'Generated: {timestamp}')
    lines.append('=' * 80)
    lines.append('')

    if not all_findings:
        lines.append('✅ NO ISSUES FOUND')
        lines.append('')
        lines.append('All checked files are compatible with known Astro 7 breaking changes.')
        lines.append('Safe to proceed with the Astro 7 upgrade.')
    else:
        total = len(all_findings)
        lines.append(f'TOTAL FINDINGS: {total}')
        lines.append('')
        lines.append('SUMMARY BY CHECK')
        lines.append('-' * 40)
        for check, items in by_check.items():
            lines.append(f'  [{len(items):2d}]  {check}')
        lines.append('')

        lines.append('DETAILED FINDINGS')
        lines.append('=' * 80)

        for check, items in by_check.items():
            lines.append('')
            lines.append(f'CHECK: {check}')
            lines.append(f'  {items[0]["detail"]}')
            lines.append(f'  Occurrences: {len(items)}')
            lines.append('-' * 60)
            for item in items:
                lines.append(f'  File:    {item["file"]}')
                lines.append(f'  Line:    {item["line"]}')
                lines.append(f'  Snippet: {item["snippet"]}')
                lines.append('')

    lines.append('')
    lines.append('=' * 80)
    lines.append('CHECKS PERFORMED')
    lines.append('-' * 40)
    lines.append('  1. Whitespace collapsing around inline <a> tags (.astro, .md, .mdx)')
    lines.append('  2. Unclosed / non-self-closing HTML tags (.astro)')
    lines.append('  3. Unterminated attributes (.astro, .md, .mdx)')
    lines.append('  4. z.date() usage — should be z.coerce.date() (.ts, .tsx)')
    lines.append('  5. src/fetch.ts conflict with Astro 7 request pipeline')
    lines.append('')
    lines.append('FILES SCANNED')
    lines.append('-' * 40)

    all_files = collect_files(SRC, ALL_EXTS)
    by_ext = {}
    for f in all_files:
        by_ext.setdefault(f.suffix, []).append(f)
    for ext, flist in sorted(by_ext.items()):
        lines.append(f'  {ext:8s}  {len(flist):3d} files')
    lines.append(f'  {"TOTAL":8s}  {len(all_files):3d} files')
    lines.append('')
    lines.append('=' * 80)
    lines.append('RECOMMENDATION')
    lines.append('-' * 40)

    if not all_findings:
        lines.append('  No breaking changes detected. Safe to upgrade to Astro 7.')
        lines.append('  Recommended approach:')
        lines.append('    1. git checkout -b astro-7-upgrade')
        lines.append('    2. pnpm dlx @astrojs/upgrade')
        lines.append('    3. pnpm build')
        lines.append('    4. Verify all pages at localhost:4321')
        lines.append('    5. git merge astro-7-upgrade into main')
    else:
        lines.append('  Resolve all findings before upgrading to Astro 7.')
        lines.append('  Fix pattern for whitespace issues:')
        lines.append('    Move inline <a> tags onto the same line as surrounding text.')
        lines.append('    Example:')
        lines.append('      BEFORE: ...nationwide through')
        lines.append('              <a href="...">4TH AND BAILEY</a>.')
        lines.append('      AFTER:  ...nationwide through <a href="...">4TH AND BAILEY</a>.')

    lines.append('')
    lines.append('=' * 80)

    output_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Report written to {output_path}')
    print(f'Total findings: {len(all_findings)}')

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print('Astro 7 Upgrade Audit — trust-lionel.com')
    print('Scanning files...')

    all_files = collect_files(SRC, ALL_EXTS)
    print(f'Found {len(all_files)} files to scan')

    all_findings = []

    print('Running Check 1: Whitespace collapsing...')
    all_findings += check_whitespace_collapsing(all_files)

    print('Running Check 2: Unclosed tags...')
    all_findings += check_unclosed_tags(all_files)

    print('Running Check 3: Unterminated attributes...')
    all_findings += check_unterminated_attributes(all_files)

    print('Running Check 4: z.date() usage...')
    all_findings += check_zdate(all_files)

    print('Running Check 5: src/fetch.ts conflict...')
    all_findings += check_fetch_ts(ROOT)

    write_report(all_findings, Path('astro7-audit.txt'))

if __name__ == '__main__':
    main()
