import os
import re

ROOT_DIR = r"c:\Users\kingm\Downloads\Projects\Investor Forum"
TARGET_DIRS = [os.path.join(ROOT_DIR, "components"), os.path.join(ROOT_DIR, "app")]

matches = []

currency_patterns = [
    r'>\s*\$',
    r'"\s*\$\s*\{',
    r'\'\s*\$\s*\{',
    r'>\s*\$\s*\{',
    r'\(\s*\$\s*USD\s*\)',
    r'\bUSD\b',
    r'\$\s*\d',
    r'\$\s*\{Number\(',
    r'\$\s*\{team\.',
    r'\$\s*\{champ\.',
    r'\$\s*\{stock\.',
    r'\$\s*\{active',
    r'\$\s*\{top',
    r'\$\s*\{selected',
    r'\$\s*\{current',
    r'\$\s*\{item\.',
    r'\$\s*\{val',
    r'\$\s*\{pointPrice',
    r'\$\s*\{h\.',
    r'\$\s*\{tx\.',
]

combined = re.compile('|'.join(currency_patterns))

for t_dir in TARGET_DIRS:
    for root, dirs, files in os.walk(t_dir):
        for file in files:
            if file.endswith((".jsx", ".js", ".tsx", ".ts")):
                fpath = os.path.join(root, file)
                with open(fpath, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                for i, line in enumerate(lines):
                    if combined.search(line):
                        matches.append((fpath, i + 1, line.rstrip()))

print(f"Total verified currency occurrences: {len(matches)}")
by_file = {}
for m in matches:
    rel = os.path.relpath(m[0], ROOT_DIR)
    by_file.setdefault(rel, []).append((m[1], m[2]))

for rel, items in sorted(by_file.items()):
    print(f"\n--- {rel} ({len(items)} matches) ---")
    for line_num, text in items[:10]:
        print(f"  L{line_num}: {text}")
    if len(items) > 10:
        print(f"  ... and {len(items)-10} more")
