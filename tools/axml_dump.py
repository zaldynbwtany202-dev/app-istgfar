#!/usr/bin/env python3
"""Minimal Android binary XML (AXML) dumper — pure stdlib.

Decodes compiled Android XML files (e.g. AndroidManifest.xml) back to readable XML.
Usage: python3 tools/axml_dump.py <binary.xml> [output.xml]
"""
import struct
import sys

RES_STRING_POOL_TYPE = 0x0001
RES_XML_TYPE = 0x0003
RES_XML_RESOURCE_MAP_TYPE = 0x0180
RES_XML_START_NAMESPACE_TYPE = 0x0100
RES_XML_END_NAMESPACE_TYPE = 0x0101
RES_XML_START_ELEMENT_TYPE = 0x0102
RES_XML_END_ELEMENT_TYPE = 0x0103
RES_XML_CDATA_TYPE = 0x0104

UTF8_FLAG = 1 << 8


class StringPool:
    def __init__(self, buf, off):
        (t, hs, size, self.string_count, self.style_count, self.flags,
         self.strings_start, self.styles_start) = struct.unpack_from("<HHIIIIII", buf, off)
        assert t == RES_STRING_POOL_TYPE, "expected string pool"
        self.utf8 = bool(self.flags & UTF8_FLAG)
        base = off
        offsets = struct.unpack_from("<%dI" % self.string_count, buf, base + hs)
        self.strings = []
        for o in offsets:
            p = base + self.strings_start + o
            self.strings.append(self._read(buf, p))

    def _read(self, buf, p):
        if self.utf8:
            # char count (1 or 2 bytes)
            n = buf[p]
            p += 1
            if n & 0x80:
                n = ((n & 0x7F) << 8) | buf[p]
                p += 1
            # byte count (1 or 2 bytes)
            blen = buf[p]
            p += 1
            if blen & 0x80:
                blen = ((blen & 0x7F) << 8) | buf[p]
                p += 1
            return buf[p:p + blen].decode("utf-8", "replace")
        n = struct.unpack_from("<H", buf, p)[0]
        p += 2
        if n & 0x8000:
            n = ((n & 0x7FFF) << 16) | struct.unpack_from("<H", buf, p)[0]
            p += 2
        return buf[p:p + n * 2].decode("utf-16-le", "replace")

    def get(self, i):
        if i is None or i < 0 or i >= len(self.strings):
            return None
        return self.strings[i]


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))


def fmt_value(pool, dtype, data):
    if dtype == 0x03:  # string
        s = pool.get(data)
        return '"%s"' % esc(s if s is not None else ""), s
    if dtype == 0x01:  # resource reference
        return "@0x%08x" % data, None
    if dtype == 0x02:  # attribute reference
        return "?0x%08x" % data, None
    if dtype == 0x10:  # decimal int
        return "%d" % data, None
    if dtype == 0x11:  # hex int
        return "0x%08x" % data, None
    if dtype == 0x12:  # boolean
        return "true" if data != 0 else "false", None
    if 0x1C <= dtype <= 0x1F:  # color
        return "#%08x" % data, None
    return "0x%08x" % data, None


def dump(data):
    t, hs, total = struct.unpack_from("<HHI", data, 0)
    assert t == RES_XML_TYPE, "not an AXML file"
    pool = None
    out = ['<?xml version="1.0" encoding="utf-8"?>']
    ns_stack = []          # active (prefix, uri) pairs
    indent = 0

    def ns_prefix(uri):
        for pre, u in ns_stack:
            if u == uri:
                return pre
        return None

    off = hs
    while off < total:
        ct, chs, csize = struct.unpack_from("<HHI", data, off)
        if ct == RES_STRING_POOL_TYPE:
            pool = StringPool(data, off)
        elif ct == RES_XML_START_NAMESPACE_TYPE:
            pre_i, uri_i = struct.unpack_from("<ii", data, off + 16)
            ns_stack.append((pool.get(pre_i) or "android", pool.get(uri_i) or ""))
        elif ct == RES_XML_END_NAMESPACE_TYPE:
            if ns_stack:
                ns_stack.pop()
        elif ct == RES_XML_START_ELEMENT_TYPE:
            tag_i = struct.unpack_from("<i", data, off + 20)[0]
            (attr_start, attr_size, attr_count) = struct.unpack_from("<HHH", data, off + 24)
            tag = pool.get(tag_i) or "tag"
            pad = "  " * indent
            attrs = []
            for a in range(attr_count):
                ap = off + 16 + 8 + 12 + a * (attr_size or 20)
                a_ns_i, a_name_i, a_raw = struct.unpack_from("<iii", data, ap)
                _size, _res0, dtype, dval = struct.unpack_from("<HBBi", data, ap + 12)
                a_name = pool.get(a_name_i) or "attr"
                uri = pool.get(a_ns_i)
                if uri:
                    pre = ns_prefix(uri)
                    a_name = ("%s:%s" % (pre, a_name)) if pre else a_name
                if a_raw >= 0 and pool.get(a_raw) is not None:
                    v = '"%s"' % esc(pool.get(a_raw))
                else:
                    v, _ = fmt_value(pool, dtype, dval)
                    v = '"%s"' % v
                attrs.append('%s=%s' % (a_name, v))
            line = "%s<%s" % (pad, tag)
            if attrs:
                line += " " + " ".join(attrs)
            line += ">"
            out.append(line)
            indent += 1
        elif ct == RES_XML_END_ELEMENT_TYPE:
            ns_i, name_i = struct.unpack_from("<ii", data, off + 16)
            indent = max(0, indent - 1)
            out.append("%s</%s>" % ("  " * indent, pool.get(name_i) or "tag"))
        off += csize or chs or 8
    return "\n".join(out)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("usage: axml_dump.py <binary.xml> [output.xml]")
    data = open(sys.argv[1], "rb").read()
    xml = dump(data)
    if len(sys.argv) > 2:
        open(sys.argv[2], "w", encoding="utf-8").write(xml + "\n")
        print("written:", sys.argv[2])
    else:
        print(xml)
