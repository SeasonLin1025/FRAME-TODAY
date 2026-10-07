#!/usr/bin/env python3
"""构建产物体积优化：字体子集化 + 删 woff + 清 CSS 死引用。
在 dist/ 上运行（deploy.sh 自动调用）。字符集从源码全量扫描生成，宁多勿漏。"""
import glob
import os
import re
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

DIST = sys.argv[1] if len(sys.argv) > 1 else 'dist'
SRC_CHARS = ['src/**/*.*', 'index.html']


def build_charset():
    chars = set()
    for pattern in SRC_CHARS:
        for p in glob.glob(pattern, recursive=True):
            try:
                with open(p, encoding='utf-8') as f:
                    chars.update(f.read())
            except Exception:
                pass
    chars.update(chr(c) for c in range(0x20, 0x7F))  # ASCII 全集
    chars.update('，。、·：；？！…—（）「」『』《》【】～℃％＋－×÷＝／｜＃＠＆＊￥“”‘’©®°')
    chars.update('０１２３４５６７８９')
    return ''.join(sorted(c for c in chars if c.strip() or c == ' '))


def main():
    text = build_charset()
    fonts = sorted(glob.glob(f'{DIST}/assets/*.woff2'))
    total_b = total_a = 0
    for p in fonts:
        b = os.path.getsize(p)
        try:
            font = TTFont(p)
            opts = Options()
            opts.name_IDs = ['*']
            opts.layout_features = ['*']
            opts.notdef_outline = True
            opts.recommended_glyphs = True
            opts.drop_tables = []
            ss = Subsetter(options=opts)
            ss.populate(text=text)
            ss.subset(font)
            tmp = p + '.tmp'
            font.flavor = 'woff2'
            font.save(tmp)
            a = os.path.getsize(tmp)
            if a < b:
                os.replace(tmp, p)
            else:
                os.remove(tmp)
                a = b
            total_b += b
            total_a += a
        except Exception as e:
            print(f'WARN subset {os.path.basename(p)}: {e}', file=sys.stderr)
    print(f'fonts: {total_b/1e6:.1f}MB -> {total_a/1e6:.2f}MB ({len(fonts)} files)')

    # 删旧格式 woff（现代浏览器只用 woff2）
    n = 0
    for p in glob.glob(f'{DIST}/assets/*.woff'):
        os.remove(p)
        n += 1
    if n:
        print(f'woff removed: {n}')

    # 清 CSS 里的 woff 死引用
    for p in glob.glob(f'{DIST}/assets/*.css'):
        css = open(p, encoding='utf-8').read()
        css, n = re.subn(r',url\(\./[A-Za-z0-9_.-]+\.woff\) format\("woff"\)', '', css)
        if n:
            open(p, 'w', encoding='utf-8').write(css)
            print(f'{os.path.basename(p)}: woff refs removed {n}')


if __name__ == '__main__':
    main()
