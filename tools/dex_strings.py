#!/usr/bin/env python3
"""Extract all strings from .dex files (fast, pure stdlib).

Reads the dex string table directly — gives class descriptors, API URLs,
text content and config keys without full bytecode parsing.
Usage: python3 tools/dex_strings.py <file.dex> [more.dex ...]
Writes unique strings to stdout; use shell redirects to save.
"""
import struct
import sys


def read_uleb128(buf, off):
    result = 0
    shift = 0
    while True:
        b = buf[off]
        off += 1
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return result, off


def dex_strings(data):
    if data[:4] != b"dex\n":
        return []
    (string_ids_size, string_ids_off) = struct.unpack_from("<II", data, 56)
    out = []
    for i in range(string_ids_size):
        (sdata_off,) = struct.unpack_from("<I", data, string_ids_off + i * 4)
        _utf16_len, p = read_uleb128(data, sdata_off)
        end = data.index(b"\x00", p)
        s = data[p:end].decode("utf-8", "replace")
        out.append(s)
    return out


def main():
    seen = set()
    for path in sys.argv[1:]:
        with open(path, "rb") as f:
            data = f.read()
        got = dex_strings(data)
        print("# %s -> %d strings" % (path, len(got)), file=sys.stderr)
        seen.update(got)
    for s in sorted(seen):
        print(s)


if __name__ == "__main__":
    main()
