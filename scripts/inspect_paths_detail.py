import re

with open('public/logo-dark.svg') as f:
    svg = f.read()

paths = re.findall(r'd="([^"]+)"', svg)
for i, p in enumerate(paths):
    pts = [s for s in p.split() if s not in ['M', 'L', 'Z']]
    coords = [(float(pts[j]), float(pts[j+1])) for j in range(0, len(pts), 2)]
    print(f"\n--- Path {i} ({len(coords)} pts) ---")
    print(", ".join(f"({x:.1f}, {y:.1f})" for x, y in coords))
