import json
import os
import subprocess

file_path = "/Users/hakobjaghatspanyan/Projects/react-shop/components/dashboard/DashboardInspector.tsx"

# Restore file from git first
subprocess.run(["git", "checkout", file_path], check=True)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

with open("/Users/hakobjaghatspanyan/.gemini/antigravity/scratch/inspector_edits.json", "r") as f:
    edits = json.load(f)

# Sort edits by step_index ascending
edits.sort(key=lambda x: x["step_index"])

# Replay edits starting from Step 1450 (index 23 onwards)
edits = [e for e in edits if e["step_index"] >= 1450 and e["step_index"] < 3000]

print(f"Replaying {len(edits)} edits...")

def manual_unescape(s):
    if not isinstance(s, str):
        return s
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    elif s.startswith('"'):
        s = s[1:]
    elif s.endswith('"'):
        s = s[:-1]
    
    # Replace escapes
    s = s.replace('\\"', '"')
    s = s.replace('\\n', '\n')
    s = s.replace('\\t', '\t')
    s = s.replace('\\\\', '\\')
    return s

success_count = 0
for idx, edit in enumerate(edits):
    args = edit["args"]
    target = manual_unescape(args["TargetContent"])
    replacement = manual_unescape(args["ReplacementContent"])
    
    # If the target has a truncation suffix like '...', strip it
    if target.endswith('...'):
        target = target[:-3]
    if replacement.endswith('...'):
        replacement = replacement[:-3]
        
    if target in content:
        content = content.replace(target, replacement)
        success_count += 1
        print(f"[{idx}] Step {edit['step_index']}: Replaced exactly")
    else:
        # Try line-by-line normalization (ignoring blank lines and whitespace)
        lines = content.splitlines()
        source_non_blank = [(line_idx, l.strip()) for line_idx, l in enumerate(lines) if l.strip()]
        target_lines = [l.strip() for l in target.splitlines() if l.strip()]
        
        found_idx = -1
        for i in range(len(source_non_blank) - len(target_lines) + 1):
            match = True
            for j in range(len(target_lines)):
                if source_non_blank[i+j][1] != target_lines[j]:
                    match = False
                    break
            if match:
                found_idx = source_non_blank[i][0]
                end_line_idx = source_non_blank[i + len(target_lines) - 1][0]
                break
                
        if found_idx != -1:
            indent = lines[found_idx][:len(lines[found_idx]) - len(lines[found_idx].lstrip())]
            replacement_lines = []
            for rl in replacement.splitlines():
                if rl.strip() == "":
                    replacement_lines.append("")
                else:
                    replacement_lines.append(indent + rl.strip())
            
            new_lines = lines[:found_idx] + replacement.splitlines() + lines[end_line_idx + 1:]
            content = "\n".join(new_lines)
            success_count += 1
            print(f"[{idx}] Step {edit['step_index']}: Replaced normalized line-by-line")
        else:
            print(f"[{idx}] Step {edit['step_index']}: FAILURE - Target not found")
            print("Target content sample:")
            print(repr(target[:200]))
            print("=" * 40)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Replay completed: {success_count}/{len(edits)} succeeded.")
