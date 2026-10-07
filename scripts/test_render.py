from playwright.sync_api import sync_playwright
import os

svg_abs = os.path.abspath('public/logo-dark.svg').replace('\\', '/')
svg_white_abs = os.path.abspath('public/logo-white.svg').replace('\\', '/')

html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {{
      margin: 0;
      padding: 30px;
      font-family: sans-serif;
      background: #F4FBF7;
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    }}
    .box-light {{
      background: #ffffff;
      padding: 16px 28px;
      border-radius: 12px;
      border: 1px solid #DDF3E4;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(9, 42, 32, 0.05);
    }}
    .box-dark {{
      background: #092A20;
      padding: 16px 28px;
      border-radius: 12px;
      border: 1px solid #144636;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }}
  </style>
</head>
<body>
  <div class="box-light">
    <img src="file:///{svg_abs}" style="height: 38px; width: auto; display: block;" alt="Logo Dark" />
  </div>
  <div class="box-dark">
    <img src="file:///{svg_white_abs}" style="height: 38px; width: auto; display: block;" alt="Logo White" />
  </div>
</body>
</html>
"""

with open('test_render.html', 'w', encoding='utf-8') as f:
    f.write(html)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 500, 'height': 240}, device_scale_factor=2)
    page.goto('file:///' + os.path.abspath('test_render.html').replace('\\', '/'))
    page.screenshot(path='test_svg_rendered.png')
    browser.close()

print('Rendered test screenshot saved: test_svg_rendered.png')
