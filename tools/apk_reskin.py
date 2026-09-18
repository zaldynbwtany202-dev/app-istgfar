#!/usr/bin/env python3
"""APK reskin pipeline (pure Python, no Java):

1. Patch brand colors in resources.arsc (hue-shift of the green family).
2. Rebuild the APK zip with a controlled writer: patched resources.arsc,
   stripped old v1 signature files, STORED entries 4-byte aligned.
3. Signing is a separate step via `sign-apk` (v2+v3).

Usage:
  python3 tools/apk_reskin.py <input.apk> <output_unsigned.apk> [--shift 130]
"""
import colorsys
import struct
import sys
import time
import zipfile
import zlib

sys.path.insert(0, "tools")
from arsc_colors import parse as parse_arsc  # noqa: E402

HUE_SHIFT = 130.0 / 360.0
BRAND_PREFIX = "green_"


def shift_color(value):
    a = (value >> 24) & 0xFF
    r = (value >> 16) & 0xFF
    g = (value >> 8) & 0xFF
    b = value & 0xFF
    if a == 0:
        return value
    h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
    if s < 0.12:
        return value
    h2 = (h + HUE_SHIFT) % 1.0
    r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
    return (a << 24) | (int(round(r2 * 255)) << 16) | (int(round(g2 * 255)) << 8) | int(round(b2 * 255))


def patch_arsc(arsc_bytes, colors):
    buf = bytearray(arsc_bytes)
    changed = 0
    for c in colors:
        if not c["name"].lower().startswith(BRAND_PREFIX):
            continue
        new = shift_color(c["value"])
        if new != c["value"]:
            struct.pack_into("<I", buf, c["offset"], new)
            changed += 1
    return bytes(buf), changed


def dos_datetime(dt):
    y, mo, d, h, mi, s = dt
    return ((h << 11) | (mi << 5) | (s // 2)), (((y - 1980) << 9) | (mo << 5) | d)


def raw_deflate(data):
    c = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
    return c.compress(data) + c.flush()


def build_zip(src_path, dst_path, replacements):
    src = zipfile.ZipFile(src_path, "r")
    out = open(dst_path, "wb")
    central = []
    offset = 0
    skipped = []
    for info in src.infolist():
        name = info.filename
        if name == "META-INF/MANIFEST.MF" or (
            name.startswith("META-INF/")
            and any(name.endswith(x) for x in (".SF", ".RSA", ".DSA", ".EC"))
        ):
            skipped.append(name)
            continue
        uname = info.filename if isinstance(info.filename, str) else info.filename.decode()
        try:
            name_b = uname.encode("ascii")
            flags = 0
        except UnicodeEncodeError:
            name_b = uname.encode("utf-8")
            flags = 0x0800
        uncomp = replacements[name] if name in replacements else src.read(name)
        crc = zlib.crc32(uncomp) & 0xFFFFFFFF
        if info.compress_type == zipfile.ZIP_DEFLATED:
            comp = raw_deflate(uncomp)
            method = 8
        else:
            comp = uncomp
            method = 0
        # alignment for STORED entries
        extra = b""
        if method == 0:
            header = 30 + len(name_b)
            pad = (4 - ((offset + header) % 4)) % 4
            extra = b"0" * pad
        t, d = dos_datetime(info.date_time)
        local = struct.pack(
            "<IHHHHHIIIHH", 0x04034B50, 20, flags, method, t, d,
            crc, len(comp), len(uncomp), len(name_b), len(extra),
        )
        local_off = offset
        out.write(local + name_b + extra + comp)
        offset += len(local) + len(name_b) + len(extra) + len(comp)
        central.append((name_b, flags, method, t, d, crc, len(comp), len(uncomp), local_off, extra))
    cd_start = offset
    for name_b, flags, method, t, d, crc, csize, usize, loff, extra in central:
        out.write(struct.pack(
            "<IHHHHHHIIIHHHHHII", 0x02014B50, 20, 20, flags, method, t, d,
            crc, csize, usize, len(name_b), len(extra), 0, 0, 0, 0x20, loff,
        ))
        out.write(name_b + extra)
        offset += 46 + len(name_b) + len(extra)
    n = len(central)
    out.write(struct.pack("<IHHHHIIH", 0x06054B50, 0, 0, n, n, offset - cd_start, cd_start, 0))
    out.close()
    src.close()
    return skipped


def check_zip(path):
    z = zipfile.ZipFile(path)
    bad_crc = z.testzip()
    n = len(z.namelist())
    z.close()
    data = open(path, "rb").read()
    pos = 0
    mis = 0
    while pos < len(data) - 4:
        if struct.unpack_from("<I", data, pos)[0] != 0x04034B50:
            break
        method, = struct.unpack_from("<H", data, pos + 8)
        nlen, elen = struct.unpack_from("<HH", data, pos + 26)
        csize, = struct.unpack_from("<I", data, pos + 18)
        data_start = pos + 30 + nlen + elen
        if method == 0 and data_start % 4 != 0:
            mis += 1
        pos = data_start + csize
    return n, bad_crc, mis


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    if "--shift" in sys.argv:
        HUE_SHIFT = float(sys.argv[sys.argv.index("--shift") + 1]) / 360.0
    t0 = time.time()
    with zipfile.ZipFile(src) as z:
        arsc = z.read("resources.arsc")
    open("/tmp/_reskin.arsc", "wb").write(arsc)
    colors = parse_arsc("/tmp/_reskin.arsc")
    brand = [c for c in colors if c["name"].lower().startswith(BRAND_PREFIX)]
    print("brand color entries:", len(brand))
    buf, changed = patch_arsc(arsc, colors)
    print("colors patched:", changed)
    skipped = build_zip(src, dst, {"resources.arsc": buf})
    print("v1 sig entries stripped:", len(skipped))
    n, bad_crc, mis = check_zip(dst)
    print("entries: %d | crc errors: %s | misaligned: %d" % (n, bad_crc, mis))
    print("done in %.1fs -> %s" % (time.time() - t0, dst))
