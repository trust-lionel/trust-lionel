f = open('src/components/base/GithubContributions.tsx', 'r')
c = f.read()
f.close()

# Find and replace the entire color logic block
old = """                      count === 0
                        ? 'bg-[#ebedf0] dark:bg-[#161b22]'
                        : count < 5
                          ? 'bg-zinc-400/70 dark:bg-zinc-700'
                          : count < 10
                            ? 'bg-zinc-500'
                            : level === 1 ? 'bg-[#9be9a8] dark:bg-[#0e4429]' : level === 2 ? 'bg-[#40c463] dark:bg-[#006d32]' : level === 3 ? 'bg-[#30a14e] dark:bg-[#26a641]' : 'bg-[#216e39] dark:bg-[#39d353]'"""

new = """                      count === 0
                        ? 'bg-[#ebedf0] dark:bg-[#161b22]'
                        : count < 5
                          ? 'bg-[#9be9a8] dark:bg-[#0e4429]'
                          : count < 10
                            ? 'bg-[#40c463] dark:bg-[#006d32]'
                            : count < 20
                              ? 'bg-[#30a14e] dark:bg-[#26a641]'
                              : 'bg-[#216e39] dark:bg-[#39d353]'"""

if old in c:
    c = c.replace(old, new)
    print("Match found and replaced")
else:
    print("No match found — printing lines 160-170 for inspection:")
    lines = c.split('\n')
    for i, line in enumerate(lines[159:170], start=160):
        print(f"{i}: {repr(line)}")

f = open('src/components/base/GithubContributions.tsx', 'w')
f.write(c)
f.close()
