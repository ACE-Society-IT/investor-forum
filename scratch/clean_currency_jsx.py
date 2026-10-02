import os
import re

ROOT_DIR = r"c:\Users\kingm\Downloads\Projects\Investor Forum"
TARGET_DIRS = [os.path.join(ROOT_DIR, "components"), os.path.join(ROOT_DIR, "app")]

for t_dir in TARGET_DIRS:
    for root, dirs, files in os.walk(t_dir):
        for file in files:
            if file.endswith((".jsx", ".js")):
                fpath = os.path.join(root, file)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Fix cases where `PKR ${` was put in JSX outside template literals
                # Replace `PKR ${` with `PKR {` when not preceded by backtick `
                # Also fix `➜ ${` with `➜ PKR {`
                new_content = content
                # If we have lines with `PKR ${...}` that are not inside backticks:
                lines = new_content.split('\n')
                for idx, line in enumerate(lines):
                    if '`' not in line:
                        # Fix `PKR ${` -> `PKR {`
                        lines[idx] = line.replace('PKR ${', 'PKR {').replace('➜ ${', '➜ PKR {').replace('➜ $', '➜ PKR ')
                        # Fix `+PKR ${` -> `+PKR {`
                        lines[idx] = lines[idx].replace('+PKR ${', '+PKR {').replace('-PKR ${', '-PKR {')
                    else:
                        # Inside template literal: e.g. `PKR ${val}` is correct.
                        pass
                new_content = '\n'.join(lines)
                
                if new_content != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Cleaned JSX currency in: {os.path.relpath(fpath, ROOT_DIR)}")

print("JSX Currency cleanup complete.")
