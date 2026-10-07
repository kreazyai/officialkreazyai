import cv2
import numpy as np
from PIL import Image
import os

def generate_svgs_and_pngs():
    # Load cropped text
    img = cv2.imread('temp_cropped_text.png', cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("temp_cropped_text.png not found")
        
    alpha = img[:, :, 3]
    h, w = alpha.shape
    
    # 8x super-sampling for subpixel precision
    SCALE = 8
    up_w, up_h = w * SCALE, h * SCALE
    alpha_up = cv2.resize(alpha, (up_w, up_h), interpolation=cv2.INTER_LANCZOS4)
    alpha_smooth = cv2.GaussianBlur(alpha_up, (9, 9), 1.5)
    _, thresh = cv2.threshold(alpha_smooth, 128, 255, cv2.THRESH_BINARY)
    
    # Extract contours
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
    print(f"Found {len(contours)} contours")
    
    paths_with_x = []
    for i, c in enumerate(contours):
        # approx with epsilon 0.35 to preserve crisp corners and smooth curves
        approx = cv2.approxPolyDP(c, 0.35 * SCALE, True)
        pts = approx[:, 0, :].astype(np.float64) / SCALE
        min_x = np.min(pts[:, 0])
        is_ai = min_x > 760
        
        # Build SVG path string
        d = f"M {pts[0, 0]:.2f} {pts[0, 1]:.2f}"
        for pt in pts[1:]:
            d += f" L {pt[0]:.2f} {pt[1]:.2f}"
        d += " Z"
        paths_with_x.append((min_x, d, is_ai))
        
    paths_with_x.sort(key=lambda p: p[0])
    
    # Add modest padding (12px horizontal, 4px vertical) so the text fills 90% of the viewBox height
    pad_x = 12
    pad_y = 4
    vb_w = int(w + pad_x * 2)
    vb_h = int(h + pad_y * 2)
    
    def make_svg(kreazy_color, ai_color):
        lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w} {vb_h}" width="{vb_w}" height="{vb_h}" fill="none">',
            f'  <g transform="translate({pad_x}, {pad_y})">'
        ]
        for _, d, is_ai in paths_with_x:
            color = ai_color if is_ai else kreazy_color
            lines.append(f'    <path d="{d}" fill="{color}" fill-rule="evenodd" />')
        lines.append('  </g>')
        lines.append('</svg>')
        return '\n'.join(lines)
        
    svg_dark = make_svg('#092A20', '#A5F052')
    svg_white = make_svg('#FFFFFF', '#A5F052')
    
    os.makedirs('public', exist_ok=True)
    with open('public/logo-dark.svg', 'w', encoding='utf-8') as f:
        f.write(svg_dark)
    with open('public/logo-white.svg', 'w', encoding='utf-8') as f:
        f.write(svg_white)
    with open('public/logo.svg', 'w', encoding='utf-8') as f:
        f.write(svg_dark)
        
    print(f"Vector SVGs generated successfully with viewBox 0 0 {vb_w} {vb_h}")

    # Now also generate crystal-clear cropped PNGs with 4x supersampling!
    # A tightly cropped 4x PNG with high-density anti-aliasing:
    # Size: (vb_w * 2, vb_h * 2) = ~1960 x 246 px!
    # When displayed at 36px height, downsampling is smooth and the letters are 32px tall!
    def make_png(is_dark):
        pil_crop = Image.open('temp_cropped_text.png').convert('RGBA')
        cw, ch = pil_crop.size
        # Create padded canvas
        out = Image.new('RGBA', (vb_w, vb_h), (0, 0, 0, 0))
        # Recolor
        cpix = pil_crop.load()
        DARK_R, DARK_G, DARK_B = 9, 42, 32
        AI_R, AI_G, AI_B = 165, 240, 82
        WHITE_R, WHITE_G, WHITE_B = 255, 255, 255
        
        recolored = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        rpix = recolored.load()
        for y in range(ch):
            for x in range(cw):
                r, g, b, a = cpix[x, y]
                if a == 0:
                    continue
                if x > 760:
                    # AI letters
                    rpix[x, y] = (AI_R, AI_G, AI_B, a)
                else:
                    if is_dark:
                        rpix[x, y] = (DARK_R, DARK_G, DARK_B, a)
                    else:
                        rpix[x, y] = (WHITE_R, WHITE_G, WHITE_B, a)
                        
        out.paste(recolored, (pad_x, pad_y), recolored)
        # 2x Retina PNG
        retina = out.resize((vb_w * 2, vb_h * 2), Image.Resampling.LANCZOS)
        return out, retina

    png_dark_1x, png_dark_2x = make_png(True)
    png_white_1x, png_white_2x = make_png(False)
    
    # Save high-res retina PNGs as the default PNGs
    png_dark_2x.save('public/logo-dark.png', 'PNG', optimize=True)
    png_white_2x.save('public/logo-white.png', 'PNG', optimize=True)
    png_dark_2x.save('public/logo.png', 'PNG', optimize=True)
    print("Retina cropped PNGs saved successfully (size:", png_dark_2x.size, ")")

if __name__ == '__main__':
    generate_svgs_and_pngs()
