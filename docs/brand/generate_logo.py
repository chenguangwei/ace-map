#!/usr/bin/env python3
"""MapQuiz.pro — Meridian Precision — v3 balanced composition."""

import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_DIR = "/Users/chenguangwei/.claude/skills/canvas-design/canvas-fonts"
OUT = "/Users/chenguangwei/Documents/workspaceself/ace-map/docs/brand/mapquiz-logo.png"

W, H = 2400, 1400

INK   = (10,  13,  22)
OCEAN = (18,  32,  70)
GRID  = (40,  56,  96)
PALE  = (232, 235, 248)
GOLD  = (218, 172,  58)
MIST  = (36,  56, 106)
GHOST = (20,  26,  45)

img = Image.new("RGB", (W, H), INK)
d   = ImageDraw.Draw(img)

# ── Background hairline grid ────────────────────────────────────────────────────
step = 80
for x in range(0, W, step):
    d.line([(x, 0), (x, H)], fill=GHOST, width=1)
for y in range(0, H, step):
    d.line([(0, y), (W, y)], fill=GHOST, width=1)

# ── Globe ──────────────────────────────────────────────────────────────────────
GX, GY = 520, H // 2
R = 340

# Atmosphere glow
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd   = ImageDraw.Draw(glow)
for i in range(30):
    r_ring = R + 8 + i * 7
    alpha  = max(0, int(52 - i * 1.8))
    gd.ellipse(
        [GX - r_ring, GY - r_ring, GX + r_ring, GY + r_ring],
        outline=(*MIST, alpha), width=4
    )
glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=24))
img_rgba = img.convert("RGBA")
img_rgba.alpha_composite(glow_blur)
img = img_rgba.convert("RGB")
d   = ImageDraw.Draw(img)

# Ocean fill
d.ellipse([GX - R, GY - R, GX + R, GY + R], fill=OCEAN)

# Graticule — meridians (proper orthographic)
for lon_deg in range(-90, 91, 15):
    lon = math.radians(lon_deg)
    pts = []
    for i in range(181):
        lat = math.radians(-90 + i)
        ox  = R * math.cos(lat) * math.sin(lon)
        oy  = -R * math.sin(lat)
        if ox**2 + oy**2 < (R - 0.5)**2:
            pts.append((int(GX + ox), int(GY + oy)))
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=GRID, width=1)

# Parallels — horizontal lines clipped to globe
for lat_deg in range(-75, 91, 15):
    lat    = math.radians(lat_deg)
    r_lat  = R * math.cos(lat)
    cy     = int(GY - R * math.sin(lat))
    if r_lat < 4:
        continue
    x0 = int(GX - r_lat)
    x1 = int(GX + r_lat)
    # Verify y is within globe disc
    if abs(cy - GY) <= R:
        d.line([(x0, cy), (x1, cy)], fill=GRID, width=1)

# Equator — gold
d.line([(GX - R + 1, GY), (GX + R - 1, GY)], fill=GOLD, width=2)

# Globe rim — gold
d.ellipse([GX - R, GY - R, GX + R, GY + R], outline=GOLD, width=2)

# Crosshair at origin (0°N, 0°E)
CH = 16
for seg in [((GX - CH, GY), (GX - 7, GY)),
            ((GX + 7,  GY), (GX + CH, GY)),
            ((GX, GY - CH), (GX, GY - 7)),
            ((GX, GY + 7),  (GX, GY + CH))]:
    d.line(seg, fill=GOLD, width=1)
d.ellipse([GX - 4, GY - 4, GX + 4, GY + 4], fill=GOLD)

# ── Fonts ──────────────────────────────────────────────────────────────────────
f_map  = ImageFont.truetype(f"{FONT_DIR}/BigShoulders-Bold.ttf", 200)
f_pro  = ImageFont.truetype(f"{FONT_DIR}/WorkSans-Regular.ttf",   36)
f_tag  = ImageFont.truetype(f"{FONT_DIR}/Outfit-Regular.ttf",     25)
f_mono = ImageFont.truetype(f"{FONT_DIR}/DMMono-Regular.ttf",     15)

# ── Measure wordmark ───────────────────────────────────────────────────────────
bb_m  = d.textbbox((0, 0), "MAP",  font=f_map)
bb_q  = d.textbbox((0, 0), "QUIZ", font=f_map)
map_w = bb_m[2] - bb_m[0]
map_h = bb_m[3] - bb_m[1]
quiz_w = bb_q[2] - bb_q[0]
total_w = map_w + quiz_w

# ── Divider ────────────────────────────────────────────────────────────────────
DIV_X = GX + R + 80
SPAN  = 220
d.line([(DIV_X, GY - SPAN), (DIV_X, GY + SPAN)], fill=GOLD, width=1)
d.line([(DIV_X - 5, GY - SPAN), (DIV_X + 5, GY - SPAN)], fill=GOLD, width=1)
d.line([(DIV_X - 5, GY + SPAN), (DIV_X + 5, GY + SPAN)], fill=GOLD, width=1)

# ── Wordmark — centre-left of right zone ───────────────────────────────────────
TX     = DIV_X + 70
RIGHT  = W - 100
# Centre text block vertically on globe centre (shift up to leave room for tagline)
text_top = GY - map_h // 2 - 28

# "MAP" pale
d.text((TX, text_top), "MAP", font=f_map, fill=PALE)

# "QUIZ" gold, immediately after
d.text((TX + map_w, text_top), "QUIZ", font=f_map, fill=GOLD)

WORDMARK_R = TX + total_w

# ── ".pro" — right-aligned to QUIZ, with clear vertical gap ────────────────────
bb_pro = d.textbbox((0, 0), ".pro", font=f_pro)
pro_w  = bb_pro[2] - bb_pro[0]
pro_h  = bb_pro[3] - bb_pro[1]
PRO_Y  = text_top + 18                   # vertically near top of wordmark

# Draw .pro via RGBA overlay for opacity
pro_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(pro_layer)
pd.text((WORDMARK_R + 14, PRO_Y), ".pro", font=f_pro,
        fill=(*GOLD, 160))
img_rgba = img.convert("RGBA")
img_rgba.alpha_composite(pro_layer)
img = img_rgba.convert("RGB")
d   = ImageDraw.Draw(img)

# ── Tagline rule + text ─────────────────────────────────────────────────────────
RULE_Y = text_top + map_h + 32
d.line([(TX, RULE_Y), (TX + 500, RULE_Y)], fill=GRID, width=1)

TAG_Y = RULE_Y + 14
d.text((TX, TAG_Y),
       "WORLD GEOGRAPHY  ·  DAILY CHALLENGE  ·  RANK",
       font=f_tag, fill=(105, 122, 172))

# ── Coordinate annotation (bottom of globe) ─────────────────────────────────────
ANNO_Y = GY + R + 30
d.text((GX - R, ANNO_Y),
       "0°N  0°E    PRIME MERIDIAN    MAPQUIZ.PRO",
       font=f_mono, fill=GRID)

# ── Frame ──────────────────────────────────────────────────────────────────────
M, TK = 56, 22
for cx, cy in [(M, M), (W - M, M), (M, H - M), (W - M, H - M)]:
    sx = 1 if cx == M else -1
    sy = 1 if cy == M else -1
    d.line([(cx, cy), (cx + sx * TK, cy)], fill=GOLD, width=1)
    d.line([(cx, cy), (cx, cy + sy * TK)], fill=GOLD, width=1)

# Horizontal rules
d.line([(M + TK + 18, M),     (W - M - TK - 18, M)],     fill=GHOST, width=1)
d.line([(M + TK + 18, H - M), (W - M - TK - 18, H - M)], fill=GHOST, width=1)

img.save(OUT, "PNG", dpi=(144, 144))
print(f"Saved → {OUT}")
