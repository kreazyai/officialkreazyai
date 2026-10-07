import cv2
import numpy as np
import re
from PIL import Image

def rasterize_svg_to_png(svg_path, out_png_path, target_height=240):
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()

    vb_match = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg_content)
    vb_w, vb_h = int(vb_match.group(1)), int(vb_match.group(2))

    SCALE = 4
    canvas_w = vb_w * SCALE
    canvas_h = vb_h * SCALE

    paths = re.findall(r'<path d="([^"]+)" fill="([^"]+)"', svg_content)
    img = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)

    tr_match = re.search(r'transform="translate\((\d+),\s*(\d+)\)"', svg_content)
    tx, ty = (int(tr_match.group(1)), int(tr_match.group(2))) if tr_match else (0, 0)

    for d, fill in paths:
        fill = fill.strip()
        if fill.startswith('#'):
            r = int(fill[1:3], 16)
            g = int(fill[3:5], 16)
            b = int(fill[5:7], 16)
        else:
            r, g, b = 255, 255, 255

        subpaths = [p.strip() for p in ('M ' + d).split('M') if p.strip()]
        for sp in subpaths:
            tokens = sp.split()
            pts = []
            i = 0
            curr_pt = None
            while i < len(tokens):
                cmd = tokens[i]
                if cmd in ['L', 'M']:
                    x = (float(tokens[i+1]) + tx) * SCALE
                    y = (float(tokens[i+2]) + ty) * SCALE
                    pts.append([x, y])
                    curr_pt = (x, y)
                    i += 3
                elif cmd == 'C':
                    p0 = curr_pt if curr_pt else (0, 0)
                    p1 = ((float(tokens[i+1]) + tx) * SCALE, (float(tokens[i+2]) + ty) * SCALE)
                    p2 = ((float(tokens[i+3]) + tx) * SCALE, (float(tokens[i+4]) + ty) * SCALE)
                    p3 = ((float(tokens[i+5]) + tx) * SCALE, (float(tokens[i+6]) + ty) * SCALE)
                    for t in np.linspace(0.05, 1.0, 25):
                        bx = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
                        by = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
                        pts.append([bx, by])
                    curr_pt = p3
                    i += 7
                elif cmd == 'Z':
                    i += 1
                else:
                    try:
                        x = (float(tokens[i]) + tx) * SCALE
                        y = (float(tokens[i+1]) + ty) * SCALE
                        pts.append([x, y])
                        curr_pt = (x, y)
                        i += 2
                    except ValueError:
                        i += 1

            if len(pts) > 2:
                poly = np.array(pts, dtype=np.int32)
                layer = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)
                cv2.fillPoly(layer, [poly], (b, g, r, 255), lineType=cv2.LINE_AA)
                mask = layer[:, :, 3] > 0
                img[mask] = layer[mask]

    target_width = int(canvas_w * (target_height / canvas_h))
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGRA2RGBA))
    resized = pil_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    resized.save(out_png_path, 'PNG', optimize=True)
    print(f"Rendered {out_png_path}: {resized.size}")

if __name__ == '__main__':
    rasterize_svg_to_png('public/logo-dark.svg', 'public/logo-dark.png', 240)
    rasterize_svg_to_png('public/logo-white.svg', 'public/logo-white.png', 240)
    rasterize_svg_to_png('public/logo-dark.svg', 'public/logo.png', 240)
