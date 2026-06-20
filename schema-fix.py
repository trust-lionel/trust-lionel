with open('src/layouts/Layout.astro', 'r') as f:
    c = f.read()

# Replace all three JSON.stringify script blocks with set:html equivalents
# The pattern: <script is:inline type="application/ld+json">{JSON.stringify({...})}</script>
# Becomes:     <script type="application/ld+json" set:html={JSON.stringify({...})} />

import re

# Fix is:inline ld+json scripts to use set:html instead
c = c.replace(
    '<script is:inline type="application/ld+json">{JSON.stringify({',
    '<script type="application/ld+json" set:html={JSON.stringify({'
)

# Fix the closing tag pattern - })}</script> becomes })} />
# We need to be careful to only fix ld+json closings
# The pattern after our replacement will be: })} and then </script>
# But since set:html is self-closing we change to />

# Find and replace the closing pattern for set:html scripts
c = c.replace('    })}</script>\n    <script is:inline type="application/ld+json">', 
              '    })} />\n    <script type="application/ld+json" set:html={JSON.stringify({')

# Now fix remaining })}</script> that belong to our ld+json blocks
# Person schema ends before WebSite
lines = c.split('\n')
result = []
in_ldjson = False
for i, line in enumerate(lines):
    if 'set:html={JSON.stringify({' in line and 'application/ld+json' in line:
        in_ldjson = True
        result.append(line)
    elif in_ldjson and line.strip() == '})}</script>':
        result.append('    })} />')
        in_ldjson = False
    elif in_ldjson and line.strip() == '})} />':
        result.append(line)
        in_ldjson = False
    else:
        result.append(line)

c = '\n'.join(result)

with open('src/layouts/Layout.astro', 'w') as f:
    f.write(c)

print("Done")

# Verify
with open('src/layouts/Layout.astro', 'r') as f:
    content = f.read()

import re
matches = re.findall(r'<script[^>]*ld\+json[^>]*>', content)
for m in matches:
    print(m)
