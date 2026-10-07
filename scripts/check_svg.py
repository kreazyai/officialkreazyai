import re

with open('public/logo-dark.svg') as f:
    svg = f.read()

paths = re.findall(r'd="([^"]+)"', svg)
print('Total paths:', len(paths))
for i, p in enumerate(paths):
    pts = [s for s in p.split() if s not in ['M', 'L', 'Z']]
    coords = [(float(pts[j]), float(pts[j+1])) for j in range(0, len(pts), 2)]
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    print(f"Path {i}: {len(coords)} vertices, x=[{min(xs):.1f}, {max(xs):.1f}], y=[{min(ys):.1f}, {max(ys):.1f}]")
    for pt in coords[:8]:
        print(f"   ({pt[0]:.2f}, {pt[1]:.2f})")
    if len(coords) > 8:
        print("   ...")
