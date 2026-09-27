# نور · يبني أيقونة الـ launcher بكل الكثافات
# قبة مسجد بهوية زمردي-ذهبية كلاسيكية
from PIL import Image, ImageDraw, ImageFilter
import os

RES = r'D:\app modif\newapp\noor-app\app\src\main\res'

EMERALD_TOP = (11, 93, 75, 255)      # #0B5D4B
EMERALD_BOT = (4, 36, 28, 255)       # #04241C
GOLD = (200, 162, 75, 255)           # #C8A24B
GOLD_LIGHT = (227, 200, 131, 255)    # #E3C883
CREAM = (250, 246, 239, 255)


def vgrad(size, top, bottom):
    img = Image.new('RGB', (1, size[1]))
    px = img.load()
    for i in range(size[1]):
        t = i / max(1, size[1] - 1)
        px[0, i] = tuple(int(a + (b - a) * t) for a, b in zip(top, bottom))
    return img.resize(size).convert('RGBA')


def draw_mosque(d, size):
    """قبة مسجد بمآذنين — متماثلة ومتوقرة."""
    w = h = size
    cx = w / 2

    # ── الإطار الذهبي الخارجي ──
    m = w * 0.06
    d.rounded_rectangle([m, m, w - m, h - m], radius=w * 0.10,
                        outline=GOLD, width=max(2, int(w * 0.008)))

    # ── المآذنتان الجانبيتان ──
    for sx in (-1, 1):
        mx = cx + sx * w * 0.30
        bw = w * 0.062
        top_y = h * 0.22
        d.rounded_rectangle([mx - bw / 2, h * 0.60, mx + bw / 2, h * 0.86],
                            radius=bw * 0.18, fill=GOLD_LIGHT)
        d.rectangle([mx - bw * 0.32, top_y + h * 0.06, mx + bw * 0.32, h * 0.62],
                    fill=GOLD_LIGHT)
        d.rectangle([mx - bw * 0.52, top_y + h * 0.02, mx + bw * 0.52, top_y + h * 0.075],
                    fill=GOLD)
        d.polygon([(mx - bw * 0.42, top_y + h * 0.025),
                   (mx + bw * 0.42, top_y + h * 0.025),
                   (mx, h * 0.125)], fill=GOLD)
        d.ellipse([mx - w * 0.012, h * 0.115, mx + w * 0.012, h * 0.139], fill=GOLD)

    # ── القبة الرئيسية ──
    dome_r = w * 0.235
    dome_cy = h * 0.47
    d.rectangle([cx - dome_r * 0.92, dome_cy + dome_r * 0.02,
                 cx + dome_r * 0.92, dome_cy + dome_r * 0.34], fill=GOLD)
    d.pieslice([cx - dome_r, dome_cy - dome_r, cx + dome_r, dome_cy + dome_r],
               start=180, end=360, fill=GOLD_LIGHT)
    d.arc([cx - dome_r * 0.7, dome_cy - dome_r * 0.7, cx + dome_r * 0.7, dome_cy + dome_r * 0.7],
          start=180, end=360, fill=GOLD, width=max(2, int(w * 0.006)))

    # قمة القبة: مخروط + هلال
    peak_y = dome_cy - dome_r - h * 0.045
    d.polygon([(cx - w * 0.05, dome_cy - dome_r * 0.98),
               (cx + w * 0.05, dome_cy - dome_r * 0.98),
               (cx, peak_y)], fill=GOLD)
    cy0 = peak_y - h * 0.028
    d.ellipse([cx - w * 0.026, cy0 - h * 0.034, cx + w * 0.026, cy0 + h * 0.018],
              fill=GOLD)

    # ── واجهة المسجد (المدخل) ──
    fw = w * 0.44
    fh = h * 0.26
    fx0, fy0 = cx - fw / 2, h * 0.60
    d.rounded_rectangle([fx0, fy0, fx0 + fw, fy0 + fh],
                        radius=w * 0.02, fill=CREAM)
    # بوابة مدببة
    arch_r = w * 0.075
    d.rectangle([cx - arch_r, fy0 + fh * 0.30, cx + arch_r, fy0 + fh], fill=GOLD)
    d.pieslice([cx - arch_r, fy0 + fh * 0.30 - arch_r * 2,
                cx + arch_r, fy0 + fh * 0.30 + arch_r * 2],
               start=180, end=360, fill=GOLD)
    # نوافذ جانبية
    for sx in (-1, 1):
        wx = cx + sx * w * 0.115
        ww = w * 0.032
        d.rounded_rectangle([wx - ww / 2, fy0 + fh * 0.22, wx + ww / 2, fy0 + fh * 0.60],
                            radius=ww * 0.5, fill=GOLD)

    # ── خط أرضي ذهبي ──
    d.rectangle([w * 0.10, h * 0.855, w * 0.90, h * 0.865], fill=GOLD)


def make_master(size=1024):
    bg = vgrad((size, size), EMERALD_TOP, EMERALD_BOT)
    halo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([size * 0.18, size * 0.10, size * 0.82, size * 0.74],
               fill=(255, 255, 255, 22))
    halo = halo.filter(ImageFilter.GaussianBlur(size * 0.035))
    bg = Image.alpha_composite(bg, halo)

    art = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(art)
    draw_mosque(d, size)
    out = Image.alpha_composite(bg, art)
    return out


def make_foreground(size=1024):
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(fg)
    draw_mosque(d, size)
    return fg


def main():
    master = make_master(1024)
    fg = make_foreground(1024)
    for bucket, size in (('mipmap-mdpi', 48), ('mipmap-hdpi', 72),
                         ('mipmap-xhdpi', 96), ('mipmap-xxhdpi', 192),
                         ('mipmap-xxxhdpi', 512)):
        d = os.path.join(RES, bucket)
        os.makedirs(d, exist_ok=True)
        master.resize((size, size), Image.LANCZOS).save(os.path.join(d, 'ic_launcher.png'))
        master.resize((size, size), Image.LANCZOS).save(os.path.join(d, 'ic_launcher_round.png'))
        print('OK', bucket, size)
    fg.save(os.path.join(RES, 'drawable', 'ic_launcher_foreground.png'))
    print('OK foreground')


if __name__ == '__main__':
    main()
