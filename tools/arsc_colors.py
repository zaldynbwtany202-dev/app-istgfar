#!/usr/bin/env python3
"""Extract color resources (names + values + byte offsets) from resources.arsc.

Pure-stdlib parser for the Android resource table. Used to plan in-place
recolor patches of an APK's resources.arsc.
Usage: python3 tools/arsc_colors.py <resources.arsc> [--json out.json]
"""
import json
import struct
import sys


class Pool:
    def __init__(self, buf, off):
        (t, hs, size, self.n, self.styles, self.flags,
         self.str_start, _styles_start) = struct.unpack_from("<HHIIIIII", buf, off)
        assert t == 0x0001, "string pool expected"
        self.utf8 = bool(self.flags & (1 << 8))
        offs = struct.unpack_from("<%dI" % self.n, buf, off + hs)
        self.s = []
        for o in offs:
            p = off + self.str_start + o
            self.s.append(self._read(buf, p))

    def _read(self, buf, p):
        if self.utf8:
            n = buf[p]; p += 1
            if n & 0x80:
                n = ((n & 0x7F) << 8) | buf[p]; p += 1
            bl = buf[p]; p += 1
            if bl & 0x80:
                bl = ((bl & 0x7F) << 8) | buf[p]; p += 1
            return buf[p:p + bl].decode("utf-8", "replace")
        n = struct.unpack_from("<H", buf, p)[0]; p += 2
        if n & 0x8000:
            n = ((n & 0x7FFF) << 16) | struct.unpack_from("<H", buf, p)[0]; p += 2
        return buf[p:p + n * 2].decode("utf-16-le", "replace")

    def get(self, i):
        return self.s[i] if 0 <= i < len(self.s) else None


def parse(path):
    buf = open(path, "rb").read()
    t, hs, size, pkg_count = struct.unpack_from("<HHII", buf, 0)
    assert t == 0x0002, "not a resource table"
    off = hs
    pool = Pool(buf, off)          # global value pool
    off += struct.unpack_from("<I", buf, off + 4)[0]
    colors = []
    type_names = {}
    for _ in range(pkg_count):
        pt, phs, psize = struct.unpack_from("<HHI", buf, off)
        assert pt == 0x0200, "package chunk expected"
        pkg_id = struct.unpack_from("<I", buf, off + 8)[0]
        type_off, key_off = struct.unpack_from("<II", buf, off + 268 - 8)[:2]
        # header is 288 bytes: id(4) name(256) typeStrings(4) lastPublicType(4) keyStrings(4) lastPublicKey(4) typeIdOffset(4)
        type_strings_off = struct.unpack_from("<I", buf, off + 8 + 4 + 256)[0]
        key_strings_off = struct.unpack_from("<I", buf, off + 8 + 4 + 256 + 8)[0]
        tpool = Pool(buf, off + type_strings_off)
        kpool = Pool(buf, off + key_strings_off)
        pos = off + phs
        end = off + psize
        while pos < end:
            ct, chs, csize = struct.unpack_from("<HHI", buf, pos)
            if ct == 0x0201:  # RES_TABLE_TYPE
                tid = buf[pos + 8]
                entry_count, entries_start = struct.unpack_from("<II", buf, pos + 12)
                tname = tpool.get(tid - 1) or ("type%d" % tid)
                offs = struct.unpack_from("<%dI" % entry_count, buf, pos + chs)
                base = pos + entries_start
                for k, eo in enumerate(offs):
                    if eo == 0xFFFFFFFF:
                        continue
                    ep = base + eo
                    _esize, flags, key_i = struct.unpack_from("<HHI", buf, ep)
                    if flags & 0x0001:  # complex (bag) — skip
                        continue
                    vp = ep + 8
                    vsize, res0, dtype = struct.unpack_from("<HBB", buf, vp)
                    data_off = vp + 4
                    (data,) = struct.unpack_from("<I", buf, data_off)
                    if 0x1C <= dtype <= 0x1F:
                        colors.append({
                            "type": tname,
                            "name": kpool.get(key_i) or "?",
                            "resid": (pkg_id << 24) | (tid << 16) | k,
                            "value": data,
                            "hex": "#%08X" % data,
                            "offset": data_off,
                        })
            pos += csize or 8
        off += psize
    return colors


if __name__ == "__main__":
    colors = parse(sys.argv[1])
    print("color entries:", len(colors))
    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json") + 1]
        json.dump(colors, open(out, "w"), indent=1)
        print("saved:", out)
    from collections import Counter
    c = Counter(x["hex"] for x in colors)
    print("--- most common values ---")
    for v, n in c.most_common(30):
        sample = next(x["name"] for x in colors if x["hex"] == v)
        print("%4d  %-10s  e.g. %s" % (n, v, sample))
