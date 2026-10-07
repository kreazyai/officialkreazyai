import re

# Precise, geometrically perfected vector paths for KREAZY AI
# Letters: K (stem + chevron), R, E, A, Z, Y,   A, I

def create_perfect_svgs():
    pad_x = 14
    pad_y = 5
    vb_w = 984 + pad_x * 2  # ~1012
    vb_h = 115 + pad_y * 2  # 125

    # Path 0: K Stem (Clean vertical rectangle)
    p_k_stem = "M 1.5 1.0 L 27.5 1.0 L 27.5 114.0 L 1.5 114.0 Z"

    # Path 1: K Chevron (<)
    p_k_chev = "M 85.5 1.0 L 34.5 54.0 L 87.5 114.0 L 118.5 114.0 L 64.0 54.0 L 117.5 1.0 Z"

    # Path 2: R (Spine + curved upper bowl + stencil cut + diagonal leg)
    # Using smooth cubic bezier for the outer and inner bowl curves!
    p_r = (
        "M 131.5 1.0 L 131.5 114.0 L 157.0 114.0 L 157.0 54.0 L 166.5 54.0 "
        "L 212.5 114.0 L 241.5 114.0 L 195.5 54.0 "
        "C 215.0 51.5 238.5 44.0 238.5 27.5 "
        "C 238.5 11.0 216.0 1.0 188.0 1.0 Z "
        "M 157.0 24.0 L 186.0 24.0 "
        "C 202.0 24.0 213.5 28.0 213.5 38.0 "
        "C 213.5 48.0 202.0 52.0 186.0 52.0 "
        "L 157.0 52.0 Z"
    )

    # Path 3: E (Vertical spine + 3 horizontal arms)
    p_e = (
        "M 251.0 1.0 L 350.0 1.0 L 350.0 24.0 L 277.0 24.0 L 277.0 45.5 "
        "L 343.0 45.5 L 343.0 68.5 L 277.0 68.5 L 277.0 91.0 L 350.0 91.0 "
        "L 350.0 114.0 L 251.0 114.0 Z"
    )

    # Path 4: A (Chevron Lambda Λ)
    p_a1 = (
        "M 427.0 1.0 L 490.0 114.0 L 463.0 114.0 L 427.0 32.0 L 386.5 114.0 "
        "L 360.0 114.0 Z"
    )

    # Path 5: Z (Top bar, diagonal slash, bottom bar)
    p_z = (
        "M 501.5 1.0 L 604.5 1.0 L 604.5 24.5 L 542.0 24.5 L 604.5 90.5 "
        "L 604.5 114.0 L 501.5 114.0 L 501.5 90.5 L 564.0 90.5 L 501.5 24.5 Z"
    )

    # Path 6: Y (Symmetrical V arms meeting into vertical stem)
    p_y = (
        "M 613.0 1.0 L 643.0 1.0 L 677.5 47.0 L 712.0 1.0 L 742.0 1.0 "
        "L 691.0 68.0 L 691.0 114.0 L 664.0 114.0 L 664.0 68.0 Z"
    )

    # Path 7: A in AI (Signature lime green Chevron Lambda Λ)
    p_a2 = (
        "M 848.0 1.0 L 915.0 114.0 L 886.5 114.0 L 848.0 32.0 L 808.0 114.0 "
        "L 780.0 114.0 Z"
    )

    # Path 8: I in AI (Clean vertical stem)
    p_i = "M 927.5 1.0 L 955.5 1.0 L 955.5 114.0 L 927.5 114.0 Z"

    kreazy_paths = [p_k_stem, p_k_chev, p_r, p_e, p_a1, p_z, p_y]
    ai_paths = [p_a2, p_i]

    def build_svg(k_color, ai_color):
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w} {vb_h}" width="{vb_w}" height="{vb_h}" fill="none">
  <g transform="translate({pad_x}, {pad_y})">
    <!-- KREAZY -->
    <path d="{' '.join(kreazy_paths)}" fill="{k_color}" fill-rule="evenodd" />
    <!-- AI -->
    <path d="{' '.join(ai_paths)}" fill="{ai_color}" fill-rule="evenodd" />
  </g>
</svg>'''

    svg_dark = build_svg("#092A20", "#A5F052")
    svg_white = build_svg("#FFFFFF", "#A5F052")

    with open('public/logo-dark.svg', 'w', encoding='utf-8') as f:
        f.write(svg_dark)
    with open('public/logo-white.svg', 'w', encoding='utf-8') as f:
        f.write(svg_white)
    with open('public/logo.svg', 'w', encoding='utf-8') as f:
        f.write(svg_dark)

    print(f"Master geometrically perfected vector SVGs generated! ViewBox: 0 0 {vb_w} {vb_h}")

if __name__ == '__main__':
    create_perfect_svgs()
