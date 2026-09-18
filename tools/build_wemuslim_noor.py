#!/usr/bin/env python3
"""Build the full WeMuslim-Noor mod:
  1. reskin resources.arsc (green -> violet)
  2. neutralize the startup gate in classes.dex (force-return-true)
  3. rebuild zip (aligned, strip old v1 sig)
Signing is run afterwards via sign-apk.
"""
import sys
import time
import zipfile

sys.path.insert(0, "tools")
from apk_reskin import patch_arsc, build_zip  # noqa: E402
from arsc_colors import parse as parse_arsc  # noqa: E402
from dex_patch import patch_method  # noqa: E402

SRC = sys.argv[1]
DST = sys.argv[2]

t0 = time.time()
z = zipfile.ZipFile(SRC)
arsc = z.read("resources.arsc")
open("/tmp/_b.arsc", "wb").write(arsc)
colors = parse_arsc("/tmp/_b.arsc")
arsc_new, changed = patch_arsc(arsc, colors)
print("colors patched:", changed)

dex = z.read("classes.dex")
dex_new = patch_method(dex, "Lo0Oooo/OooO0O0;", "OooO0Oo", 1)
print("startup gate neutralized in classes.dex (%d -> %d bytes)" % (len(dex), len(dex_new)))

skipped = build_zip(SRC, DST, {"resources.arsc": arsc_new, "classes.dex": dex_new})
print("v1 sig entries stripped:", len(skipped))
print("done in %.1fs -> %s" % (time.time() - t0, DST))
