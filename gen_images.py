#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TODAY'S SHOOT — 主题占位图生成器
为 6 套 Issue 各生成 hero.jpg (1080x1440) + shot-01/02/03.jpg (1080x810)。
每套图使用自己的色板做分层构图 + 胶片颗粒 + 主题光效，风格统一、可整体替换。

替换真实图片时：把同名 jpg 放进 public/assets/issues/{issue-id}/ 即可，代码零改动。
"""
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'public', 'assets', 'issues')

HERO = (1080, 1440)
SHOT = (1080, 810)


def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def vgrad(w, h, top, bottom):
    """纵向渐变（top→bottom）"""
    g = Image.linear_gradient('L').resize((w, h))
    return ImageOps.colorize(g, black=hx(top), white=hx(bottom)).convert('RGB')


def radial_mask(w, h):
    """中心黑 → 边缘白"""
    return Image.radial_gradient('L').resize((w, h))


def vignette(img, strength=0.25):
    m = ImageOps.invert(radial_mask(img.width, img.height))
    m = m.point(lambda v: int(255 - (255 - v) * strength))
    return ImageChops.multiply(img, Image.merge('RGB', (m, m, m)))


def grain(img, sigma=22, contrast=1.5):
    n = Image.effect_noise(img.size, sigma)
    n = ImageEnhance.Contrast(n).enhance(contrast)
    rgb = Image.merge('RGB', (n, n, n))
    return ImageChops.soft_light(img, rgb)


def glow(img, color, cx, cy, rx, ry=None, blur=60, intensity=1.0):
    """加色辉光（screen 混合）"""
    if ry is None:
        ry = rx
    layer = Image.new('RGB', img.size, (0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=hx(color) if isinstance(color, str) else color)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    out = ImageChops.screen(img, layer)
    if intensity < 1:
        out = Image.blend(img, out, intensity)
    return out


def overlay(img, draw_fn, blur=0):
    """在 RGBA 覆盖层上绘制形状后合成"""
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(ov))
    if blur:
        ov = ov.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')


def hblur(img, n=10):
    """水平运动模糊（湿地反光用）：横向降采样再放大，只模糊横轴"""
    f = 2 * n + 1
    w, h = img.size
    small = img.resize((max(1, round(w / f)), h), Image.BILINEAR)
    return small.resize((w, h), Image.BILINEAR)


def rain(img, seed, count=70, amax=38, slant=8):
    w, h = img.size
    rnd = random.Random(seed)

    def draw(d):
        for _ in range(count):
            x = rnd.randint(-40, w)
            y = rnd.randint(-h // 3, h)
            ln = rnd.randint(50, 170)
            a = rnd.randint(8, amax)
            d.line([(x, y), (x + int(ln * math.tan(math.radians(slant))), y + ln)],
                   fill=(218, 224, 213, a), width=1)

    return overlay(img, draw, blur=0.7)


def dapple(img, seed, count=24, color=(44, 56, 26), amax=90, ymax=0.8):
    """树影光斑（暗色椭圆群）"""
    w, h = img.size
    rnd = random.Random(seed)

    def draw(d):
        for _ in range(count):
            cx = rnd.uniform(0, w)
            cy = rnd.uniform(0, h * ymax)
            rx = rnd.uniform(36, 130)
            ry = rx * rnd.uniform(0.55, 1.0)
            a = int(amax * rnd.uniform(0.35, 1.0))
            d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color + (a,))

    return overlay(img, draw, blur=7)


def bokeh(img, seed, specs, rmin, rmax, amax, blur):
    """彩色光斑群"""
    w, h = img.size
    rnd = random.Random(seed)

    def draw(d):
        for _ in range(specs['n']):
            cx = rnd.uniform(0, w)
            cy = rnd.uniform(0, h)
            r = rnd.uniform(rmin, rmax)
            color = rnd.choice(specs['colors'])
            a = int(amax * rnd.uniform(0.4, 1.0))
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (a,))

    return overlay(img, draw, blur=blur)


def soft_band(base, band_img, y, ramp=50, alpha=255):
    """把 band_img 以顶部软边粘贴到 y 处"""
    w, h = base.size
    bh = band_img.height
    mask = Image.new('L', (w, bh), alpha)
    md = ImageDraw.Draw(mask)
    for i in range(ramp):
        v = int(alpha * i / ramp)
        md.line([(0, i), (w, i)], fill=v)
    base.paste(band_img, (0, y), mask)
    return base


def save(img, issue_id, name):
    d = os.path.join(OUT, issue_id)
    os.makedirs(d, exist_ok=True)
    img.save(os.path.join(d, name + '.jpg'), quality=87, optimize=True, progressive=True)
    print('  ✓', issue_id, name)


# ============================== SUNLIT SUNDAY ==============================

def sunlit_hero():
    w, h = HERO
    img = vgrad(w, h, '#FDF6DE', '#EFDFAF')
    img = glow(img, '#FFF2C8', w * 0.72, h * 0.2, 340, 300, 90, 0.9)
    img = glow(img, '#FFFCEB', w * 0.72, h * 0.2, 120, 105, 36, 0.8)
    img = dapple(img, 11, 30, (52, 62, 30), 85, 0.75)
    # 草地
    gh = int(h * 0.26)
    grass = vgrad(w, gh, '#8AA14E', '#566A2C')
    img = soft_band(img, grass, h - gh, ramp=70)
    rnd = random.Random(12)

    def blades(d):
        for _ in range(46):
            x = rnd.uniform(0, w)
            y = h - rnd.uniform(0, gh)
            ln = rnd.uniform(10, 34)
            d.line([(x, y), (x + rnd.uniform(-9, 9), y - ln)], fill=(50, 66, 26, 130), width=2)

    img = overlay(img, blades, blur=0.5)
    img = vignette(img, 0.16)
    img = grain(img, 22)
    return img


def sunlit_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 草地野餐半景：奶油野餐布 + 格纹 + 白瓷盘
        img = vgrad(w, h, '#FBF2D8', '#F0E3BC')

        def gingham(d):
            for x in range(0, w, 86):
                d.line([(x, 0), (x, h)], fill=(181, 130, 76, 34), width=3)
            for y in range(0, h, 86):
                d.line([(0, y), (w, y)], fill=(181, 130, 76, 34), width=3)

        img = overlay(img, gingham)
        cx, cy = w * 0.6, h * 0.56

        def plate(d):
            d.ellipse([cx - 34, cy + 106, cx + 160, cy + 148], fill=(70, 58, 30, 40))
            d.ellipse([cx - 40, cy - 40, cx + 154, cy + 154], fill=(252, 250, 243, 245))
            d.ellipse([cx - 12, cy - 12, cx + 126, cy + 126], fill=(240, 235, 220, 255))

        img = overlay(img, plate, blur=1)
        img = dapple(img, 13, 9, (60, 72, 34), 46, 0.6)
        img = vignette(img, 0.14)
        img = grain(img, 20)
    elif idx == 2:
        # 树影下的背影：全幅草地 + 树干柱影
        img = vgrad(w, h, '#8AA14E', '#4E6028')
        rnd = random.Random(14)

        def trunks(d):
            for x in [0.12, 0.38, 0.83, 1.02]:
                xw = rnd.uniform(60, 110)
                d.rectangle([x * w - xw, 0, x * w + xw, h * 0.62], fill=(34, 44, 20, 150))

        img = overlay(img, trunks, blur=3)
        img = dapple(img, 15, 26, (40, 52, 22), 110, 0.75)
        img = glow(img, '#FFF4CE', w * 0.1, h * 0.12, 130, 110, 40, 0.5)
        img = vignette(img, 0.2)
        img = grain(img, 24)
    else:
        # 手里的特写：大光圈绿背景 + 黄花主体
        back = vgrad(w, h, '#7C934A', '#455626').filter(ImageFilter.GaussianBlur(34))
        img = back
        fx, fy = w * 0.42, h * 0.52

        def flower(d):
            d.arc([fx - 26, fy + 60, fx + 60, fy + 250], 200, 320, fill=(58, 74, 30, 230), width=7)
            d.ellipse([fx - 110, fy + 130, fx - 20, fy + 190], fill=(78, 96, 42, 210))
            for ang in range(0, 360, 45):
                a = math.radians(ang)
                px, py = fx + 78 * math.cos(a), fy + 62 * math.sin(a)
                d.ellipse([px - 42, py - 42, px + 42, py + 42], fill=(232, 184, 75, 235))
            d.ellipse([fx - 34, fy - 34, fx + 34, fy + 34], fill=(181, 130, 76, 255))

        img = overlay(img, flower, blur=0.6)
        img = bokeh(img, 16, {'n': 8, 'colors': [(232, 184, 75), (181, 130, 76), (240, 224, 168)]}, 22, 66, 110, 9)
        img = vignette(img, 0.26)
        img = grain(img, 20)
    return img


# ============================== CITY SHADOWS ==============================

def city_hero():
    w, h = HERO
    img = vgrad(w, h, '#D3CFC8', '#B2ACA3')
    horizon = int(h * 0.62)
    rnd = random.Random(21)

    def skyline(d):
        x = -30
        while x < w:
            bw = rnd.uniform(90, 210)
            bh = rnd.uniform(240, 640)
            tone = rnd.choice([(26, 26, 26, 255), (44, 43, 40, 255)])
            # 连续天际线：楼与楼之间只留极窄缝，读作整体剪影
            d.rectangle([x, horizon - bh, x + bw + 14, horizon], fill=tone)
            if rnd.random() < 0.4:
                d.rectangle([x + bw * 0.4, horizon - bh - 60, x + bw * 0.4 + 7, horizon - bh], fill=tone)
            x += bw + 14

    img = overlay(img, skyline)

    def hard_shadow(d):
        d.polygon([(0, h * 0.56), (w * 0.6, h), (0, h)], fill=(16, 16, 16, 235))
        d.polygon([(w * 0.52, h * 0.66), (w, h * 0.98), (w * 0.4, h)], fill=(20, 20, 20, 150))

    img = overlay(img, hard_shadow)
    # 地面
    ground = vgrad(w, h - horizon, '#8F8A82', '#77736C')
    img.paste(ground, (0, horizon))

    def ground_lines(d):
        for i in range(5):
            x = w * (0.1 + 0.18 * i)
            d.line([(x, horizon), (x + 130, h)], fill=(40, 40, 38, 60), width=3)

    img = overlay(img, ground_lines, blur=1)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = vignette(img, 0.2)
    img = grain(img, 34)
    return img


def city_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 斑马线低角度：透视白条 + 行人剪影
        img = vgrad(w, h, '#C9C5BE', '#A19B92')

        def stripes(d):
            for i in range(5):
                y = h * (0.34 + 0.13 * i)
                x0 = w * (0.5 - 0.22 - 0.05 * i)
                x1 = w * (0.5 + 0.22 + 0.05 * i)
                y2 = h * (0.42 + 0.14 * i)
                d.polygon([(x0, y), (x1, y), (x1 + 40, y2), (x0 - 40, y2)], fill=(242, 240, 236, 225))

        img = overlay(img, stripes, blur=0.8)

        def figure(d):
            d.rounded_rectangle([w * 0.56, h * 0.18, w * 0.56 + 26, h * 0.52], radius=12, fill=(18, 18, 18, 235))
            d.ellipse([w * 0.56 + 1, h * 0.1, w * 0.56 + 25, h * 0.134], fill=(18, 18, 18, 235))

        img = overlay(img, figure, blur=1)

        def edges(d):
            d.rectangle([0, 0, w * 0.12, h], fill=(26, 26, 26, 90))
            d.rectangle([w * 0.88, 0, w, h], fill=(26, 26, 26, 90))

        img = overlay(img, edges, blur=6)
        img = vignette(img, 0.22)
        img = grain(img, 32)
    elif idx == 2:
        # 立面几何：窗格网格 + 斜切阴影
        img = Image.new('RGB', (w, h), hx('#C4C0B9'))

        def facade(d):
            for gx in range(6):
                for gy in range(5):
                    x = 60 + gx * 168
                    y = 50 + gy * 148
                    dark = (26, 26, 26, 200) if (gx + gy) % 3 else (26, 26, 26, 70)
                    d.rectangle([x, y, x + 92, y + 70], fill=dark)
            d.rectangle([60 + 3 * 168, 50 + 1 * 148, 60 + 3 * 168 + 92, 50 + 1 * 148 + 70], fill=(240, 237, 230, 235))

        img = overlay(img, facade)

        def slash(d):
            d.polygon([(0, 0), (w * 0.42, 0), (w * 0.12, h), (0, h)], fill=(16, 16, 16, 130))

        img = overlay(img, slash)
        img = vignette(img, 0.18)
        img = grain(img, 34)
    else:
        # 影子墙：半黑半灰 + 交界线上的人
        img = Image.new('RGB', (w, h), hx('#CBC7C0'))

        def split(d):
            d.polygon([(0, 0), (w * 0.52, 0), (w * 0.4, h), (0, h)], fill=(16, 16, 16, 245))

        img = overlay(img, split)

        def walker(d):
            x = w * 0.55
            d.ellipse([x, h * 0.3, x + 20, h * 0.3 + 20], fill=(18, 18, 18, 240))
            d.rounded_rectangle([x - 3, h * 0.33, x + 23, h * 0.62], radius=9, fill=(18, 18, 18, 240))
            d.polygon([(x - 40, h * 0.64), (x + 60, h * 0.64), (x + 130, h * 0.7), (x - 10, h * 0.7)], fill=(18, 18, 18, 90))

        img = overlay(img, walker, blur=1)
        img = vignette(img, 0.2)
        img = grain(img, 32)
    return img


# ============================== SOFT GREY ==============================

def soft_hero():
    w, h = HERO
    img = vgrad(w, h, '#F3F0EA', '#E4E2DC')
    img = glow(img, '#F8F6F0', w * 0.3, h * 0.25, 380, 420, 110, 0.75)
    img = glow(img, '#FBF9F4', w * 0.28, h * 0.3, 170, 210, 50, 0.5)
    # 桌面
    th = int(h * 0.2)
    table = vgrad(w, th, '#4A3B2E', '#382C21')
    img = soft_band(img, table, h - th, ramp=44)

    def cup(d):
        x, y = w * 0.56, h * 0.745
        d.rounded_rectangle([x, y, x + 118, y + 150], radius=26, fill=(94, 75, 58, 255))
        d.ellipse([x + 6, y - 8, x + 112, y + 30], fill=(112, 90, 70, 255))
        d.ellipse([x + 16, y + 2, x + 102, y + 24], fill=(206, 196, 182, 60))
        for i in range(2):
            sx = x + 34 + i * 40
            pts = [(sx, y - 14), (sx + 10, y - 60), (sx - 6, y - 110), (sx + 8, y - 160)]
            d.line(pts, fill=(240, 238, 230, 52), width=3)

    img = overlay(img, cup, blur=0.8)
    img = vignette(img, 0.08)
    img = grain(img, 14)
    return img


def soft_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 窗边杯特写
        img = vgrad(w, h, '#F0EEE8', '#E7E5E0')
        img = glow(img, '#FAF8F2', w * 0.18, h * 0.4, 260, 300, 80, 0.8)
        cx, cy = w * 0.62, h * 0.55

        def cup(d):
            d.ellipse([cx - 158, cy - 158, cx + 158, cy + 158], fill=(214, 210, 202, 200))
            d.ellipse([cx - 132, cy - 132, cx + 132, cy + 132], fill=(74, 59, 46, 255))
            d.ellipse([cx - 118, cy - 118, cx + 118, cy + 118], fill=(60, 47, 36, 255))
            d.arc([cx + 90, cy - 60, cx + 210, cy + 60], 250, 90, fill=(74, 59, 46, 255), width=22)
            for i in range(2):
                sx = cx - 30 + i * 46
                d.line([(sx, cy - 150), (sx + 14, cy - 260), (sx - 8, cy - 380)], fill=(240, 238, 230, 46), width=3)

        img = overlay(img, cup, blur=0.8)
        img = vignette(img, 0.1)
        img = grain(img, 13)
    elif idx == 2:
        # 桌面平拍：杂志 / 杯 / 银器 不等边三角
        img = vgrad(w, h, '#E9E7E2', '#DDDAD3')

        def still(d):
            # 杂志（轻微旋转的矩形）
            d.polygon([(w * 0.16, h * 0.3), (w * 0.5, h * 0.24), (w * 0.53, h * 0.66), (w * 0.19, h * 0.72)],
                      fill=(245, 242, 236, 250))
            d.polygon([(w * 0.16, h * 0.3), (w * 0.5, h * 0.24), (w * 0.5, h * 0.33), (w * 0.17, h * 0.39)],
                      fill=(210, 206, 198, 255))
            # 杯（顶视圆）
            d.ellipse([w * 0.62 - 84, h * 0.34 - 84, w * 0.62 + 84, h * 0.34 + 84], fill=(74, 59, 46, 255))
            d.ellipse([w * 0.62 - 66, h * 0.34 - 66, w * 0.62 + 66, h * 0.34 + 66], fill=(58, 45, 34, 255))
            # 银色小物
            d.ellipse([w * 0.4 - 40, h * 0.72 - 26, w * 0.4 + 40, h * 0.72 + 26], fill=(198, 198, 200, 255))
            d.ellipse([w * 0.4 - 26, h * 0.72 - 16, w * 0.4 + 26, h * 0.72 + 16], fill=(232, 232, 234, 255))

        img = overlay(img, still, blur=0.6)

        def shadows(d):
            d.ellipse([w * 0.2, h * 0.73, w * 0.54, h * 0.79], fill=(60, 50, 40, 26))
            d.ellipse([w * 0.62 - 96, h * 0.34 + 90, w * 0.62 + 96, h * 0.34 + 116], fill=(60, 50, 40, 26))

        img = overlay(img, shadows, blur=8)
        img = vignette(img, 0.1)
        img = grain(img, 13)
    else:
        # 玻璃窗侧影
        img = Image.new('RGB', (w, h), hx('#E8E6E1'))

        def glass(d):
            d.polygon([(w * 0.06, 0), (w * 0.3, 0), (w * 0.18, h), (0, h)], fill=(250, 248, 242, 46))
            d.line([(w * 0.44, 0), (w * 0.38, h)], fill=(70, 64, 56, 40), width=2)
            for y in range(0, h, 130):
                d.line([(w * 0.05, y), (w * 0.42, y)], fill=(70, 64, 56, 26), width=1)

        img = overlay(img, glass, blur=0.8)

        def profile(d):
            d.ellipse([w * 0.62, h * 0.3, w * 0.62 + 150, h * 0.3 + 170], fill=(58, 52, 46, 165))
            d.polygon([(w * 0.6, h * 0.48), (w * 0.92, h * 0.5), (w * 0.95, h), (w * 0.56, h)],
                      fill=(58, 52, 46, 140))

        img = overlay(img, profile, blur=6)
        img = glow(img, '#F6F4EE', w * 0.15, h * 0.2, 220, 260, 70, 0.6)
        img = vignette(img, 0.1)
        img = grain(img, 13)
    return img


# ============================== SLOW MUSEUM ==============================

def museum_hero():
    w, h = HERO
    img = Image.new('RGB', (w, h), hx('#FAFAF8'))
    horizon = int(h * 0.62)
    floor = vgrad(w, h - horizon, '#F0F0ED', '#E4E4DF')
    img.paste(floor, (0, horizon))

    def lines(d):
        d.line([(0, horizon), (w, horizon)], fill=(43, 43, 43, 70), width=2)

    img = overlay(img, lines)

    def artwork(d):
        x, y = w * 0.5 - 115, int(h * 0.26)
        d.rectangle([x + 10, y + 14, x + 220, y + 22], fill=(43, 43, 43, 20))
        d.rectangle([x, y, x + 210, y + 280], fill=(252, 252, 250, 255), outline=(43, 43, 43, 210), width=2)
        d.rectangle([x + 34, y + 60, x + 150, y + 176], fill=(196, 196, 196, 255))
        d.rectangle([x + 58, y + 96, x + 126, y + 140], fill=(120, 120, 120, 255))

    img = overlay(img, artwork)

    def figure(d):
        x = w * 0.68
        d.ellipse([x, horizon - 62, x + 13, horizon - 48], fill=(43, 43, 43, 235))
        d.rounded_rectangle([x - 1, horizon - 48, x + 14, horizon - 4], radius=5, fill=(43, 43, 43, 235))

    img = overlay(img, figure, blur=0.6)

    def bench(d):
        d.rounded_rectangle([w * 0.16, h * 0.74, w * 0.16 + 170, h * 0.74 + 16], radius=7, fill=(54, 54, 52, 235))

    img = overlay(img, bench, blur=0.8)
    img = vignette(img, 0.05)
    img = grain(img, 8)
    return img


def museum_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 展品前大留白
        img = Image.new('RGB', (w, h), hx('#FAFAF8'))

        def art(d):
            x, y = w * 0.28, h * 0.26
            d.rectangle([x, y, x + 120, y + 160], fill=(252, 252, 250, 255), outline=(43, 43, 43, 200), width=2)
            d.rectangle([x + 24, y + 34, x + 88, y + 98], fill=(178, 178, 178, 255))
            d.rectangle([w * 0.7, h * 0.2, w * 0.7 + 46, h * 0.2 + 46], fill=(196, 196, 196, 255))

        img = overlay(img, art)

        def floorline(d):
            d.line([(0, h * 0.78), (w, h * 0.78)], fill=(43, 43, 43, 60), width=2)
            d.ellipse([w * 0.28 - 20, h * 0.78 + 6, w * 0.28 + 140, h * 0.78 + 22], fill=(43, 43, 43, 22))

        img = overlay(img, floorline, blur=3)
        img = grain(img, 7)
    elif idx == 2:
        # 走廊纵深（对称透视）
        img = vgrad(w, h, '#FAFAF8', '#EDEDEA')
        vx, vy = w * 0.5, h * 0.5

        def corridor(d):
            d.rectangle([vx - 130, vy - 110, vx + 130, vy + 40], fill=(240, 240, 238, 255))
            for sx, sy in [(0, 0), (w, 0), (0, h), (w, h), (0, h * 0.5), (w, h * 0.5)]:
                d.line([(sx, sy), (vx, vy)], fill=(150, 150, 148, 60), width=2)
            d.rectangle([vx - 130, vy - 110, vx + 130, vy + 40], outline=(120, 120, 118, 120), width=2)

        img = overlay(img, corridor, blur=0.5)

        def reflect(d):
            d.polygon([(vx - 130, vy + 40), (vx + 130, vy + 40), (vx + 90, h), (vx - 90, h)], fill=(250, 250, 248, 150))

        img = overlay(img, reflect, blur=4)
        img = grain(img, 7)
    else:
        # 标签细节
        img = Image.new('RGB', (w, h), hx('#F9F9F7'))

        def corner(d):
            d.line([(w * 0.2, h * 0.5), (w * 0.2, h * 0.96)], fill=(43, 43, 43, 90), width=2)
            d.line([(w * 0.2, h * 0.96), (w * 0.96, h * 0.96)], fill=(43, 43, 43, 90), width=2)

        img = overlay(img, corner)

        def label(d):
            x, y = w * 0.26, h * 0.7
            d.rectangle([x, y, x + 130, y + 92], fill=(255, 255, 255, 255), outline=(120, 120, 120, 190), width=1)
            for i in range(3):
                d.line([(x + 14, y + 22 + i * 24), (x + 74 + (12 if i == 0 else 44), y + 22 + i * 24)],
                       fill=(110, 110, 110, 200), width=3)

        img = overlay(img, label)

        def artfrag(d):
            d.rectangle([w * 0.24, h * 0.42, w * 0.24 + 66, h * 0.42 + 66], fill=(196, 196, 196, 255))

        img = overlay(img, artfrag)
        img = grain(img, 7)
    return img


# ============================== WET FILM ==============================

def wet_base(w, h):
    return vgrad(w, h, '#20241E', '#3A402F')


def wet_hero():
    w, h = HERO
    img = vgrad(w, h, '#2A2F26', '#48523B')
    # 街头结构：橱窗 + 霓虹招牌 + 远处灯点
    wx, wy, ww, wh = int(w * 0.1), int(h * 0.34), 330, 300

    def shopwindow(d):
        d.rectangle([wx, wy, wx + ww, wy + wh], fill=(214, 218, 204, 235))
        for i in range(1, 3):
            d.line([(wx + ww * i / 3, wy), (wx + ww * i / 3, wy + wh)], fill=(26, 30, 24, 220), width=4)
        d.line([(wx, wy + wh / 2), (wx + ww, wy + wh / 2)], fill=(26, 30, 24, 220), width=4)
        for i in range(2):
            bx = wx + 56 + i * 130
            d.rectangle([bx, wy + wh - 130, bx + 46, wy + wh - 36], fill=(30, 34, 26, 210))

    img = overlay(img, shopwindow, blur=0.7)
    img = glow(img, '#E8EADC', wx + ww / 2, wy + wh / 2, 210, 170, 55, 0.6)

    def sign(d):
        d.rectangle([w * 0.68, h * 0.14, w * 0.68 + 26, h * 0.42], fill=(176, 58, 52, 235))
        for i in range(3):
            d.rectangle([w * 0.68 + 3, h * (0.19 + 0.07 * i), w * 0.68 + 23, h * (0.2 + 0.07 * i)],
                        fill=(255, 176, 170, 130))

    img = overlay(img, sign, blur=0.6)
    img = glow(img, '#B03A34', w * 0.68 + 13, h * 0.28, 150, 220, 60, 0.95)
    img = glow(img, '#FF8A80', w * 0.68 + 13, h * 0.28, 60, 90, 24, 0.7)
    img = bokeh(img, 51, {'n': 8, 'colors': [(215, 220, 205), (176, 58, 52), (242, 200, 121)]}, 6, 18, 110, 5)
    img = rain(img, 52, 80, 40)

    # 湿地反光：上半部分翻转 + 水平模糊 + 压暗
    zone = int(h * 0.66)
    src = img.crop((0, zone - 520, w, zone)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    refl = hblur(src, 12)
    refl = ImageEnhance.Brightness(refl).enhance(0.66)
    mask = Image.new('L', (w, 520), 160)
    md = ImageDraw.Draw(mask)
    for i in range(44):
        md.line([(0, i), (w, i)], fill=int(200 * i / 44))
    img.paste(refl, (0, zone), mask)

    def smear(d):
        rnd = random.Random(53)
        for _ in range(9):
            x = rnd.uniform(0, w)
            y = rnd.uniform(zone + 30, h - 20)
            ww2 = rnd.uniform(120, 360)
            d.ellipse([x - ww2, y - 3, x + ww2, y + 3], fill=(232, 234, 220, 40))

    img = overlay(img, smear, blur=3)
    img = ImageEnhance.Brightness(img).enhance(1.22)
    img = ImageEnhance.Contrast(img).enhance(1.02)
    img = vignette(img, 0.18)
    img = grain(img, 34)
    return img


def wet_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 透明伞背影
        img = vgrad(w, h, '#262B22', '#313828')
        ax, ay = w * 0.52, h * 0.34

        def umbrella(d):
            pts = []
            for ang in range(-190, 10, 20):
                a = math.radians(ang)
                pts.append((ax + 240 * math.cos(a), ay + 170 * math.sin(a)))
            for px, py in pts:
                d.line([(ax, ay), (px, py)], fill=(218, 224, 213, 62), width=2)
            d.arc([ax - 250, ay - 180, ax + 250, ay + 180], 190, 350, fill=(218, 224, 213, 80), width=4)
            d.line([(ax, ay), (ax, ay - 90)], fill=(218, 224, 213, 90), width=3)

        img = overlay(img, umbrella, blur=0.8)

        def person(d):
            x = w * 0.5 - 13
            d.rounded_rectangle([x, h * 0.52, x + 26, h * 0.86], radius=11, fill=(14, 16, 13, 240))
            d.ellipse([x + 1, h * 0.42, x + 25, h * 0.466], fill=(14, 16, 13, 240))
            d.rectangle([x + 1, h * 0.86, x + 9, h * 0.99], fill=(14, 16, 13, 235))
            d.rectangle([x + 16, h * 0.86, x + 25, h * 0.99], fill=(14, 16, 13, 235))

        img = overlay(img, person, blur=0.8)
        img = rain(img, 54, 60, 34)
        img = glow(img, '#B4B8A8', w * 0.85, h * 0.16, 150, 100, 50, 0.4)
        img = vignette(img, 0.28)
        img = grain(img, 40)
    elif idx == 2:
        # 橱窗双重画面
        img = Image.new('RGB', (w, h), hx('#22261F'))
        wx, wy, ww, wh = int(w * 0.3), int(h * 0.22), 470, 420

        def window(d):
            d.rectangle([wx, wy, wx + ww, wy + wh], fill=(224, 226, 212, 235))
            for i in range(1, 3):
                d.line([(wx + ww * i / 3, wy), (wx + ww * i / 3, wy + wh)], fill=(28, 30, 24, 220), width=5)
            d.line([(wx, wy + wh / 2), (wx + ww, wy + wh / 2)], fill=(28, 30, 24, 220), width=5)
            for i in range(3):
                bx = wx + 60 + i * 140
                d.rectangle([bx, wy + wh - 150, bx + 54, wy + wh - 40], fill=(30, 34, 26, 200))

        img = overlay(img, window, blur=0.8)
        img = glow(img, '#ECEADC', wx + ww / 2, wy + wh / 2, 260, 210, 60, 0.55)
        img = glow(img, '#B03A34', w * 0.9, h * 0.12, 110, 70, 40, 0.6)

        def reflection(d):
            d.polygon([(w * 0.05, 0), (w * 0.3, 0), (w * 0.62, h), (w * 0.4, h)], fill=(226, 228, 214, 26))

        img = overlay(img, reflection, blur=3)
        img = rain(img, 55, 40, 30)
        img = vignette(img, 0.26)
        img = grain(img, 38)
    else:
        # 湿地低机位：上实景 + 下倒影
        img = vgrad(w, h, '#20241E', '#333A29')
        img = glow(img, '#B03A34', w * 0.7, h * 0.16, 160, 100, 60, 0.85)
        img = glow(img, '#F2C879', w * 0.28, h * 0.22, 90, 60, 34, 0.6)
        img = rain(img, 56, 50, 34)
        # 倒影
        mid = int(h * 0.52)
        src = img.crop((0, 0, w, mid)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).resize((w, h - mid))
        refl = hblur(src, 10)
        refl = ImageEnhance.Brightness(refl).enhance(0.6)
        img.paste(refl, (0, mid))

        def ripples(d):
            for i in range(3):
                ry = h * (0.72 + 0.08 * i)
                rx = 60 + 40 * i
                d.ellipse([w * 0.5 - rx, ry - 10, w * 0.5 + rx, ry + 10], outline=(226, 228, 214, 46), width=2)

        img = overlay(img, ripples, blur=1)

        def foot(d):
            d.rounded_rectangle([w * 0.86, h * 0.88, w * 1.02, h * 1.02], radius=14, fill=(12, 13, 10, 225))

        img = overlay(img, foot, blur=1)
        img = vignette(img, 0.24)
        img = grain(img, 42)
    return img


# ============================== NEON AFTER DARK ==============================

def neon_base(w, h):
    return vgrad(w, h, '#131A2E', '#28304F')


def neon_hero():
    w, h = HERO
    img = neon_base(w, h)

    def string_lights(d):
        for i in range(16):
            x = w * (0.06 + 0.88 * i / 15)
            y = h * 0.15 + 26 * math.sin(math.pi * i / 15)
            d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(242, 200, 121, 255))
            if i < 15:
                x2 = w * (0.06 + 0.88 * (i + 1) / 15)
                y2 = h * 0.15 + 26 * math.sin(math.pi * (i + 1) / 15)
                d.line([(x, y), (x2, y2)], fill=(120, 130, 160, 90), width=2)

    img = overlay(img, string_lights, blur=0.6)

    def signs(d):
        d.rectangle([w * 0.16, h * 0.34, w * 0.16 + 220, h * 0.34 + 140], outline=(232, 106, 51, 255), width=9)
        d.rectangle([w * 0.62, h * 0.28, w * 0.62 + 180, h * 0.28 + 110], outline=(242, 200, 121, 255), width=7)
        for i in range(3):
            d.rectangle([w * 0.66, h * 0.28 + 34 + i * 22, w * 0.66 + 96, h * 0.28 + 42 + i * 22], fill=(232, 106, 51, 200))

    img = overlay(img, signs, blur=0.6)
    img = glow(img, '#E86A33', w * 0.16 + 110, h * 0.34 + 70, 190, 140, 34, 0.85)
    img = glow(img, '#F2C879', w * 0.62 + 90, h * 0.28 + 55, 160, 110, 30, 0.8)
    img = bokeh(img, 61, {'n': 9, 'colors': [(232, 106, 51), (242, 200, 121)]}, 24, 74, 110, 12)
    img = glow(img, '#E86A33', w * 0.5, h * 1.04, 420, 170, 90, 0.5)
    img = vignette(img, 0.28)
    img = grain(img, 36)
    return img


def neon_shot(idx):
    w, h = SHOT
    if idx == 1:
        # 招牌光下的半身像
        img = neon_base(w, h)
        img = glow(img, '#E87840', w * 0.68, h * 0.44, 300, 330, 80, 0.85)
        img = glow(img, '#FABE78', w * 0.68, h * 0.44, 120, 140, 40, 0.6)

        def figure(d):
            x = w * 0.4
            d.ellipse([x, h * 0.4, x + 76, h * 0.4 + 76], fill=(13, 16, 25, 244))
            d.polygon([(x - 34, h * 0.56), (x + 110, h * 0.56), (x + 150, h), (x - 70, h)], fill=(13, 16, 25, 244))

        img = overlay(img, figure, blur=1)
        img = bokeh(img, 62, {'n': 6, 'colors': [(242, 200, 121), (232, 106, 51)]}, 12, 40, 90, 9)
        img = vignette(img, 0.3)
        img = grain(img, 32)
    elif idx == 2:
        # 夜市食物摊
        img = vgrad(w, h, '#151B30', '#1C2340')
        img = glow(img, '#F2C879', w * 0.5, h * 0.42, 270, 220, 60, 0.85)

        def bulbs(d):
            for i in range(3):
                x = w * (0.3 + 0.2 * i)
                d.line([(x, 0), (x, h * 0.12)], fill=(110, 118, 148, 120), width=2)
                d.ellipse([x - 9, h * 0.12, x + 9, h * 0.12 + 18], fill=(242, 200, 121, 255))

        img = overlay(img, bulbs, blur=0.6)

        def counter(d):
            d.rectangle([0, h * 0.72, w, h], fill=(18, 20, 30, 255))
            d.line([(0, h * 0.72), (w, h * 0.72)], fill=(242, 200, 121, 120), width=3)

        img = overlay(img, counter)
        img = glow(img, '#E86A33', w * 0.16, h * 0.3, 120, 90, 44, 0.7)

        def steam(d):
            for i in range(2):
                sx = w * (0.44 + 0.1 * i)
                d.line([(sx, h * 0.4), (sx + 18, h * 0.3), (sx - 8, h * 0.2), (sx + 10, h * 0.1)],
                       fill=(242, 232, 214, 58), width=4)

        img = overlay(img, steam, blur=2)
        img = vignette(img, 0.28)
        img = grain(img, 34)
    else:
        # 巷口纵深
        img = vgrad(w, h, '#10152A', '#1E2540')
        vx, vy = w * 0.5, h * 0.52

        def guides(d):
            for sx, sy in [(0, 0), (w, 0), (0, h * 0.6), (w, h * 0.6)]:
                d.line([(sx, sy), (vx, vy)], fill=(120, 130, 170, 46), width=2)

        img = overlay(img, guides, blur=0.5)

        def sign_rows(d):
            rnd = random.Random(63)
            for depth in range(5):
                f = depth / 4
                lx = w * (0.1 + 0.32 * f)
                rx = w * (0.9 - 0.32 * f)
                y = h * (0.16 + 0.42 * f)
                sz = int(54 * (1 - 0.55 * f))
                for x in (lx, rx):
                    color = rnd.choice([(232, 106, 51, 200), (242, 200, 121, 200)])
                    d.rectangle([x, y, x + sz, y + int(sz * 0.66)], fill=color)

        img = overlay(img, sign_rows, blur=0.8)
        img = glow(img, '#F4D696', vx, vy, 120, 90, 44, 0.9)
        img = bokeh(img, 64, {'n': 7, 'colors': [(232, 106, 51), (242, 200, 121)]}, 14, 44, 90, 10)
        img = vignette(img, 0.3)
        img = grain(img, 30)
    return img


# ============================== 生成入口 ==============================

GEN = {
    'sunlit-sunday': (sunlit_hero, sunlit_shot),
    'city-shadows': (city_hero, city_shot),
    'soft-grey': (soft_hero, soft_shot),
    'slow-museum': (museum_hero, museum_shot),
    'wet-film': (wet_hero, wet_shot),
    'neon-after-dark': (neon_hero, neon_shot),
}

if __name__ == '__main__':
    print('生成主题占位图 →', OUT)
    for issue_id, (hero_fn, shot_fn) in GEN.items():
        save(hero_fn(), issue_id, 'hero')
        for i in (1, 2, 3):
            save(shot_fn(i), issue_id, f'shot-0{i}')
    print('完成：6 issues × 4 images = 24 jpg')
