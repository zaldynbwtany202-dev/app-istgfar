#!/usr/bin/env python3
"""dex_patch.py — surgical Dalvik bytecode patcher (pure stdlib).

Patches a boolean method to always return a constant:
    const/4 v0, <0|1>
    return v0
    nop... (padding to keep the original code size)

After patching, fixes the dex header SHA-1 and Adler32 checksum.
Usage (as module): patch_method(dex_bytes, class_desc, method_name, ret_const) -> bytes
"""
import hashlib
import struct
import zlib


def _uleb(buf, off):
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


def _mutf8(buf, off):
    n, off = _uleb(buf, off)
    end = buf.index(b"\x00", off)
    return buf[off:end].decode("utf-8", "replace"), end + 1


def patch_method(dex, class_desc, method_name, ret_const):
    buf = bytearray(dex)
    (str_n, str_off) = struct.unpack_from("<II", buf, 56)
    (typ_n, typ_off) = struct.unpack_from("<II", buf, 64)
    (mth_n, mth_off) = struct.unpack_from("<II", buf, 88)
    (cls_n, cls_off) = struct.unpack_from("<II", buf, 96)

    def str_at(i):
        (sd_off,) = struct.unpack_from("<I", buf, str_off + i * 4)
        s, _ = _mutf8(buf, sd_off)
        return s

    # find type idx of the class
    class_type_idx = None
    for t in range(typ_n):
        (desc_idx,) = struct.unpack_from("<I", buf, typ_off + t * 4)
        if str_at(desc_idx) == class_desc:
            class_type_idx = t
            break
    if class_type_idx is None:
        raise SystemExit("class not found: " + class_desc)

    # method ids whose name matches (belonging to that class)
    cand_method_ids = set()
    for m in range(mth_n):
        c_i, p_i, n_i = struct.unpack_from("<HHI", buf, mth_off + m * 8)
        if c_i == class_type_idx and str_at(n_i) == method_name:
            cand_method_ids.add(m)
    if not cand_method_ids:
        raise SystemExit("method not found: " + method_name)

    # find class_def
    class_data_off = None
    for c in range(cls_n):
        (c_i,) = struct.unpack_from("<I", buf, cls_off + c * 32)
        if c_i == class_type_idx:
            class_data_off = struct.unpack_from("<I", buf, cls_off + c * 32 + 24)[0]
            break
    if not class_data_off:
        raise SystemExit("class_data not found")

    off = class_data_off
    sf, off = _uleb(buf, off)
    iff, off = _uleb(buf, off)
    dm, off = _uleb(buf, off)
    vm, off = _uleb(buf, off)
    for _ in range(sf):
        _, off = _uleb(buf, off)
        _, off = _uleb(buf, off)
    for _ in range(iff):
        _, off = _uleb(buf, off)
        _, off = _uleb(buf, off)
    patched = []
    midx = 0
    for i in range(dm + vm):
        d, off = _uleb(buf, off)
        midx += d if i else 0
        if i == 0:
            midx = d
        af, off = _uleb(buf, off)
        code_off, off = _uleb(buf, off)
        if midx in cand_method_ids and code_off:
            patched.append(code_off)
    if not patched:
        raise SystemExit("no code_off for target method")

    for code_off in patched:
        (insns_size,) = struct.unpack_from("<I", buf, code_off + 12)
        if insns_size < 2:
            raise SystemExit("method too small to patch")
        base = code_off + 16
        # const/4 v0, <ret_const>  (format 11n): opcode 0x12, A=0, B=const
        unit0 = 0x0012 | (0 << 8) | ((ret_const & 0xF) << 12)
        # return v0 (format 11x): opcode 0x0f, A=0  (0x0e would be return-void!)
        unit1 = 0x000F
        struct.pack_into("<H", buf, base, unit0)
        struct.pack_into("<H", buf, base + 2, unit1)
        for u in range(2, insns_size):
            struct.pack_into("<H", buf, base + u * 2, 0x0000)  # nop
    # fix sha1 then adler (adler covers file[12:], i.e. everything after checksum field)
    sha = hashlib.sha1(bytes(buf[32:])).digest()
    buf[12:32] = sha
    struct.pack_into("<I", buf, 8, zlib.adler32(bytes(buf[12:])) & 0xFFFFFFFF)
    return bytes(buf)


if __name__ == "__main__":
    import sys
    src, dst, cls_d, mname, retc = sys.argv[1:6]
    out = patch_method(open(src, "rb").read(), cls_d, mname, int(retc))
    open(dst, "wb").write(out)
    print("patched", dst)
