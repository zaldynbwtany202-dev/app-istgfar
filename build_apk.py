# وسن 4.7 · يبني APK كاملاً دون Gradle:
# aapt2 (resources) → kotlinc (kotlin) → d8 (dex) → aapt2 package → zipalign → apksigner
import os, re, subprocess, sys, zipfile, shutil, glob

# ────────────────── المسارات ──────────────────
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.environ.get('WASAN_PROJ', HERE)          # مجلد المشروع = مجلد هذا السكربت
APP = os.path.join(PROJ, 'app')
MAIN = os.path.join(APP, 'src', 'main')
BUILD = os.path.join(PROJ, 'build')
SDK = os.environ.get('WASAN_SDK', r'D:\app modif\tools\sdkroot')
BT = os.path.join(SDK, 'build-tools', '34.0.0')
PLATFORM = os.path.join(SDK, 'platforms', 'android-34', 'android.jar')
DEPS = os.path.join(PROJ, '.deps')                   # يملؤه: python fetch_deps.py
KOTLIN_LIB = os.environ.get('WASAN_KOTLIN_LIB', r'D:\app modif\tools\kotlinc\lib')
JAVA = os.environ.get('WASAN_JAVA', r'C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot\bin\java.exe')

# الإصدار
VERSION_CODE, VERSION_NAME = '13', '5.0'

# التوقيع: افتراضياً مفتاح «وسن» المرفق في signing/ (نفس مفتاح النسخ الجاهزة 2.0 و3.0 و4.0 و4.1 و4.2،
# فيُثبَّت التحديث فوقهما مباشرة). لاستعمال مفتاحك الأصلي بدلاً منه:
#   set WASAN_KEYSTORE=D:\app modif\tools\noor.jks
#   set WASAN_KS_PASS=noor123
KEYSTORE = os.environ.get('WASAN_KEYSTORE', os.path.join(PROJ, 'signing', 'noor2-release.jks'))
KS_ALIAS = os.environ.get('WASAN_KS_ALIAS', 'noor')
KS_PASS = os.environ.get('WASAN_KS_PASS', 'Noor2026!sign')
OUT_APK = os.path.join(PROJ, 'wasan-5.0-release.apk')

# أدوات build-tools: aapt2/zipalign تنفيذيان؛ d8 وapksigner نستدعيهما عبر java مباشرة
# (أوثق من ملفات .bat، ولا مشكلة مع الرموز الخاصة في كلمة المرور).
EXE = '.exe' if os.name == 'nt' else ''
AAPT2 = os.path.join(BT, 'aapt2' + EXE)
ZIPALIGN = os.path.join(BT, 'zipalign' + EXE)
D8_JAR = os.path.join(BT, 'lib', 'd8.jar')
APKSIGNER_JAR = os.path.join(BT, 'lib', 'apksigner.jar')

for d in ('obj', 'bin', 'bin/res', 'bin/dex'):
    os.makedirs(os.path.join(BUILD, d), exist_ok=True)


def _raw_zip_read(zin, item):
    """يقرأ بيانات عنصر zip بالتجاوز عن تطابق اسم الدليل/الترويسة
    (aapt2 يكتب أسماء أصول بنمط ويندوز مثل 'assets\\db\\Ayah.json')."""
    zin.fp.seek(item.header_offset)
    import struct
    hdr = zin.fp.read(30)
    nlen, elen = struct.unpack('<HH', hdr[26:30])
    zin.fp.read(nlen + elen)
    raw = zin.fp.read(item.compress_size)
    if item.compress_type == zipfile.ZIP_STORED:
        return raw
    import zlib
    return zlib.decompress(raw, -15)


def run(cmd, label, env=None, cwd=None):
    print(f'\n════ {label} ════')
    print(' '.join(cmd)[:200])
    r = subprocess.run(cmd, capture_output=True, text=True, env=env, cwd=cwd)
    if r.stdout.strip():
        print(r.stdout[-3000:])
    if r.returncode != 0:
        print('✗ STDERR:', r.stderr[-5000:])
        return False
    return True


def main():
    step = sys.argv[1] if len(sys.argv) > 1 else 'all'

    # ────────────────── 1) aapt2: compile resources ──────────────────
    if step in ('all', 'res'):
        res_files = []
        for root, _, files in os.walk(os.path.join(MAIN, 'res')):
            for f in files:
                if f.endswith(('.xml', '.png', '.webp', '.otf', '.ttf', '.ogg', '.mp3', '.wav')):
                    res_files.append(os.path.join(root, f))
        # نفرّغ مخرجات الترجمة السابقة: ملفات flat قديمة لموارد حُذفت أو أُعيدت تسميتها
        # (مثل أيقونات 2.0) كانت ستُربط مع الجديدة.
        shutil.rmtree(os.path.join(BUILD, 'bin', 'res'), ignore_errors=True)
        os.makedirs(os.path.join(BUILD, 'bin', 'res'), exist_ok=True)
        cmd = [AAPT2, 'compile',
               '-o', os.path.join(BUILD, 'bin', 'res')] + res_files
        if not run(cmd, 'aapt2 compile resources'):
            return 1

    # ────────────────── 2) aapt2: link → R.java + base.apk ──────────────────
    if step in ('all', 'link'):
        # نترجم res كل مكتبة AAR على حدة (فضاءات أسماء خاصة، ولا تصطدم
        # ملفات values المتكررة)، ثم نربط كل الـ flats معاً.
        libroot = os.path.join(BUILD, 'bin', 'libres')
        shutil.rmtree(libroot, ignore_errors=True)
        os.makedirs(libroot, exist_ok=True)
        n_lib = 0
        for f in sorted(os.listdir(DEPS)):
            if not f.endswith('.aar'):
                continue
            aar = os.path.join(DEPS, f)
            try:
                with zipfile.ZipFile(aar) as z:
                    res_names = [n for n in z.namelist()
                                 if n.startswith('res/') and not n.endswith('/')]
                    if not res_names:
                        continue
                    xdir = os.path.join(libroot, 'src', f.replace('.aar', ''))
                    shutil.rmtree(xdir, ignore_errors=True)
                    os.makedirs(xdir, exist_ok=True)
                    for n in res_names:
                        tgt = os.path.join(xdir, n)
                        os.makedirs(os.path.dirname(tgt), exist_ok=True)
                        # material تعيد تعريف styleable/Carousel (موجود في
                        # constraintlayout) وstyleable/SearchView (موجود في
                        # appcompat) → خطأ قاتل عند الدمج. نحذف الكتلتين
                        # كاملتين من material فقط (تعريفاتهما الأخرى تكفي).
                        if f.startswith('material') and n.startswith('res/values') and n.endswith('.xml'):
                            txt = z.read(n).decode('utf-8')
                            for sname in ('Carousel', 'SearchView'):
                                txt2 = re.sub(
                                    r'<declare-styleable\s+name="%s">.*?</declare-styleable>'
                                    % sname, '', txt, flags=re.S)
                                if txt2 != txt:
                                    txt = txt2
                            with open(tgt, 'w', encoding='utf-8') as fo:
                                fo.write(txt)
                            continue
                        with open(tgt, 'wb') as fo:
                            fo.write(z.read(n))
            except Exception as e:
                print('skip', f, e)
                continue
            # --legacy: يحوّل أخطاء "conflicting styleable" (المعتادة بين
            # appcompat وmaterial اللتين تعيدان تعريف نفس styleable) إلى تحذيرات
            outzip = os.path.join(libroot, 'flat', f.replace('.aar', '') + '.zip')
            os.makedirs(os.path.dirname(outzip), exist_ok=True)
            cmd = [AAPT2, 'compile', '--legacy',
                   '--dir', os.path.join(xdir, 'res'), '-o', outzip]
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                print('⚠ compile failed for', f, r.stderr[-300:])
            else:
                n_lib += 1
        print(f'✓ تُرجمت موارد {n_lib} مكتبة')

        flats = glob.glob(os.path.join(BUILD, 'bin', 'res', '*.flat'))
        # كل مكتبة أُنتجت كـ zip وحيد من الـ flats (aapt2 link يقبل الـ zip)
        libzips = sorted(glob.glob(os.path.join(BUILD, 'bin', 'libres', 'flat', '*.zip')))
        # أسماء الـ flats تتكرر بين المكتبات (values_values.arsc.flat)، لذا
        # نضع كل مكتبة في مجلد فرعي خاص بها داخل الـ zip.
        flatzip = os.path.join(BUILD, 'bin', 'allflats.zip')
        seen = set()
        with zipfile.ZipFile(flatzip, 'w', zipfile.ZIP_STORED) as z:
            for zp in libzips:
                libname = os.path.basename(zp).replace('.zip', '')
                with zipfile.ZipFile(zp) as src:
                    for n in src.namelist():
                        ent = libname + '/' + n
                        if ent in seen:
                            continue
                        seen.add(ent)
                        z.writestr(ent, src.read(n))
            for p in flats:
                nm = os.path.basename(p)
                if nm in seen:
                    continue
                seen.add(nm)
                z.write(p, nm)
        cmd = [AAPT2, 'link',
               '-o', os.path.join(BUILD, 'bin', 'base.apk'),
               '--manifest', os.path.join(MAIN, 'AndroidManifest.xml'),
               '-I', PLATFORM,
               '--java', os.path.join(BUILD, 'obj'),
               '--auto-add-overlay',
               '-A', os.path.join(MAIN, 'assets'),
               '--min-sdk-version', '23',
               '--target-sdk-version', '34',
               '--version-code', VERSION_CODE,
               '--version-name', VERSION_NAME,
               '--no-version-vectors',
               flatzip]
        if not run(cmd, 'aapt2 link'):
            return 1

    # ────────────────── 3) kotlinc: compile Kotlin → .class ──────────────────
    if step in ('all', 'kotlin'):
        # أولاً: توليد فئات R للمكتبات بقيم الموارد الحقيقية.
        # مكتبات مثل appcompat تصل إلى R$drawable.abc_textfield_…
        # كحقول static int، فالحشوات الفارغة تسبب NoSuchFieldError.
        # نأخذ القيم من جدول موارد base.apk (الكل مُدمج هناك).
        baseapk = os.path.join(BUILD, 'bin', 'base.apk')
        librpkg = {}
        for f in sorted(os.listdir(DEPS)):
            if not f.endswith('.aar'):
                continue
            try:
                with zipfile.ZipFile(os.path.join(DEPS, f)) as z:
                    if 'AndroidManifest.xml' not in z.namelist():
                        continue
                    man = z.read('AndroidManifest.xml').decode('utf-8', errors='replace')
                    m = re.search(r'package="([^"]+)"', man)
                    if m:
                        librpkg[m.group(1)] = True
            except Exception:
                pass
        libr = os.path.join(BUILD, 'obj', 'libr')
        shutil.rmtree(libr, ignore_errors=True)
        os.makedirs(libr, exist_ok=True)
        if os.path.exists(baseapk):
            dump = subprocess.run([AAPT2, 'dump',
                                   'resources', baseapk],
                                  capture_output=True, text=True).stdout
            resmap = {}
            for line in dump.splitlines():
                m = re.match(r'\s+resource (0x[0-9a-fA-F]+) (\w+)/(\S+)', line)
                if m:
                    resmap.setdefault(m.group(2), {})[m.group(3)] = m.group(1)
            for pkg in sorted(librpkg):
                parts = pkg.split('.')
                if not all(s.isidentifier() for s in parts):
                    continue
                p = os.path.join(libr, pkg.replace('.', '/'), 'R.java')
                os.makedirs(os.path.dirname(p), exist_ok=True)
                with open(p, 'w', encoding='utf-8') as fo:
                    fo.write('package %s;\n\npublic final class R {\n' % pkg)
                    for rtype in ('drawable', 'id', 'layout', 'string', 'style',
                                  'attr', 'color', 'dimen', 'integer', 'bool',
                                  'animator', 'anim', 'mipmap', 'font', 'raw'):
                        ents = resmap.get(rtype)
                        if not ents:
                            continue
                        fo.write('    public static final class %s {\n' % rtype)
                        for name in sorted(ents):
                            # أسماء الموارد قد تحوي نقاطاً (Theme.AppCompat.Empty)
                            # ولا تصح كأسماء حقول جافا؛ يحوّلها أندرويد إلى شرطة سفلية.
                            fname = name.replace('.', '_')
                            if not fname.isidentifier():
                                continue
                            fo.write('        public static final int %s = %s;\n'
                                     % (fname, ents[name]))
                        fo.write('    }\n')
                    fo.write('}\n')
            print(f'✓ وُلّدت فئات R لـ {len(librpkg)} حزمة مكتبة')
        # ── إضافة R$styleable داخل فئات R الموجودة ──
        # appcompat يصل إلى R$styleable.AppCompatTheme_viewInflaterClass كحقل ثابت،
        # ويقرأ R$styleable.AppCompatTheme[] لاستخراج attr IDs — فارغة تُسقط
        # ArrayIndexOutOfBoundsException. المصدر المثالي هو R.txt داخل كل AAR
        # (محتوى R كما وُلّد زمن ترجمة المكتبة) + attr IDs الحقيقية من base.apk.
        # نأخذ attr ids من جدول الموارد المدمج أولاً
        attr_ids = {}
        if os.path.exists(baseapk):
            dump = subprocess.run([AAPT2, 'dump',
                                   'resources', baseapk],
                                  capture_output=True, text=True).stdout
            for line in dump.splitlines():
                m = re.match(r'\s+resource (0x[0-9a-fA-F]+) attr/(\S+)', line)
                if m:
                    attr_ids[m.group(2)] = m.group(1)
        n_sty = 0
        for f in sorted(os.listdir(DEPS)):
            if not f.endswith('.aar'):
                continue
            try:
                with zipfile.ZipFile(os.path.join(DEPS, f)) as z:
                    if 'R.txt' not in z.namelist():
                        continue
                    rtxt = z.read('R.txt').decode('utf-8', errors='replace')
                    # R.txt يحوي الترتيب الرسمي والـ indices الحقيقية:
                    #   int[] styleable NAME { v0, v1, ... }    ← ترتيب المصفوفة
                    #   int  styleable NAME_attr index         ← index الحقيقي
                    # القيم 0x01xxxxxx هي attrs إطارية ثابتة (غير موجودة في
                    # الجدول المدمج)؛ و0x0 تعني attr من المكتبة نأخذ معرّفها
                    # من جدول الموارد المدمج بالاسم.
                    # ⚠ الكود السابق كان يفرز الحقول أبجدياً ويضع كل index = 0،
                    # فكان appcompat يقرأ windowNoTitle من الموضع 0 → false
                    # → IllegalArgumentException "does not support theme features".
                    arr_raw = {}      # styleable -> [قيم R.txt بالترتيب الأصلي]
                    arr_fields = {}   # styleable -> [(fieldName, index)]
                    cur_arr = None
                    for line in rtxt.split('\n'):
                        m = re.match(r'int\[\]\s+styleable\s+(\S+)\s*\{([^}]*)\}', line)
                        if m:
                            cur_arr = m.group(1)
                            arr_raw[cur_arr] = [v.strip()
                                                for v in m.group(2).split(',') if v.strip()]
                            arr_fields[cur_arr] = []
                            continue
                        m = re.match(r'int\s+styleable\s+(\S+)\s+(\d+)', line)
                        if m and cur_arr is not None:
                            arr_fields[cur_arr].append((m.group(1), int(m.group(2))))
                    if not arr_raw:
                        continue
                    man = z.read('AndroidManifest.xml').decode('utf-8', errors='replace')
                    mp = re.search(r'package="([^"]+)"', man)
                    if not mp:
                        continue
                    pkg = mp.group(1)
                    parts = pkg.split('.')
                    if not all(s.isidentifier() for s in parts):
                        continue
                    # الحقن داخل R.java الموجود في libr
                    rj = os.path.join(libr, pkg.replace('.', '/'), 'R.java')
                    if not os.path.exists(rj):
                        continue
                    src = open(rj, encoding='utf-8').read()
                    block = ['    public static final class styleable {']
                    seen_arr = set()
                    for sname in sorted(arr_raw):
                        sname_clean = sname.replace('.', '_')
                        if not sname_clean.isidentifier() or sname_clean in seen_arr:
                            continue
                        seen_arr.add(sname_clean)
                        fields = arr_fields.get(sname, [])
                        by_index = {idx: fname for fname, idx in fields}
                        prefix = sname + '_'
                        vals = []
                        for i, raw in enumerate(arr_raw[sname]):
                            try:
                                iv = int(raw, 16)
                            except ValueError:
                                iv = 0
                            if 0x01000000 <= iv < 0x7f000000:
                                # attr إطارية: معرّفها ثابت ولا يُجدول محليًا
                                vals.append(raw)
                                continue
                            fname = by_index.get(i)
                            an = fname[len(prefix):] if fname and fname.startswith(prefix) else None
                            aid = attr_ids.get(an) if an else None
                            # أسماء attrs قد تحوي نقاطاً تُكتَب شرطة سفلية في الحقل
                            if not aid and an:
                                aid = attr_ids.get(an.replace('_', '.'))
                            vals.append(aid if aid else ('0' if not iv else raw))
                        if not vals:
                            vals = ['0']
                        block.append('        public static final int[] %s = { %s };'
                                     % (sname_clean, ', '.join(vals)))
                        # indices الحقيقية من R.txt — كانت 0 فأَسقطت قراءات خاطئة
                        for fname, idx in sorted(fields, key=lambda p: p[1]):
                            if fname.isidentifier():
                                block.append('        public static final int %s = %d;'
                                             % (fname, idx))
                    block.append('    }')
                    sty_block = '\n'.join(block) + '\n'
                    src = re.sub(r'\n    public static final class styleable \{.*?\n    \}\n',
                                 '', src, flags=re.S)
                    src = src.rstrip()
                    if src.endswith('}'):
                        src = src[:-1] + sty_block + '}\n'
                    open(rj, 'w', encoding='utf-8').write(src)
                    n_sty += 1
            except Exception:
                pass
        print(f'✓ حُقنت styleable من R.txt في {n_sty} حزمة')
        libr_srcs = []
        for root, _, files in os.walk(libr):
            for f in files:
                if f.endswith('.java'):
                    libr_srcs.append(os.path.join(root, f))
        if libr_srcs:
            javac = [os.path.join(os.path.dirname(JAVA), 'javac' + EXE),
                     '-cp', PLATFORM, '-d', os.path.join(BUILD, 'bin', 'librcls'),
                     '-source', '17', '-target', '17'] + libr_srcs
            os.makedirs(os.path.join(BUILD, 'bin', 'librcls'), exist_ok=True)
            r = subprocess.run(javac, capture_output=True, text=True)
            if r.returncode != 0:
                print('⚠ javac R-lib:', r.stderr[-300:])

        classpath = [PLATFORM]
        for f in os.listdir(DEPS):
            if f.endswith(('.jar', '.aar')):
                pass
        # استخراج classes.jar من كل AAR
        classjars = []
        extracted = os.path.join(BUILD, 'bin', 'libs')
        os.makedirs(extracted, exist_ok=True)
        for f in sorted(os.listdir(DEPS)):
            if not f.endswith('.aar'):
                continue
            aar = os.path.join(DEPS, f)
            with zipfile.ZipFile(aar) as z:
                if 'classes.jar' in z.namelist():
                    out = os.path.join(extracted, f.replace('.aar', '-classes.jar'))
                    with open(out, 'wb') as fo:
                        fo.write(z.read('classes.jar'))
                    classjars.append(out)
        jars = [os.path.join(DEPS, f) for f in os.listdir(DEPS) if f.endswith('.jar')]
        classpath = [PLATFORM] + classjars + jars

        srcs = []
        for root, _, files in os.walk(os.path.join(MAIN, 'java')):
            for f in files:
                if f.endswith('.kt'):
                    srcs.append(os.path.join(root, f))
        # R.java المولّد
        rjava = glob.glob(os.path.join(BUILD, 'obj', '**', 'R.java'), recursive=True)

        cmd = [JAVA, '-cp', os.path.join(KOTLIN_LIB, 'kotlin-preloader.jar'),
               'org.jetbrains.kotlin.preloading.Preloader',
               '-cp', os.path.join(KOTLIN_LIB, 'kotlin-compiler.jar'),
               'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler',
               '-cp', os.pathsep.join(classpath),
               '-d', os.path.join(BUILD, 'bin', 'classes'),
               '-jvm-target', '17',
               '-no-stdlib',
               ] + srcs + rjava
        env = dict(os.environ, JAVA_HOME=os.path.dirname(os.path.dirname(JAVA)))
        if not run(cmd, 'kotlinc', env=env):
            return 1

    # ────────────────── 4) d8: .class → dex ──────────────────
    if step in ('all', 'dex'):
        # فئات التطبيق + فئات R الخاصة بالمكتبات (androidx.appcompat.R …)
        # نحزمها في jar واحد لتفادي طول سطر أمر d8 على ويندوز (WinError 206).
        appjar = os.path.join(BUILD, 'bin', 'app.jar')
        n_app = 0
        with zipfile.ZipFile(appjar, 'w', zipfile.ZIP_STORED) as out:
            for base in ('classes', 'librcls'):
                srcroot = os.path.join(BUILD, 'bin', base)
                for root, _, files in os.walk(srcroot):
                    for f in files:
                        if not f.endswith('.class'):
                            continue
                        p = os.path.join(root, f)
                        rel = os.path.relpath(p, srcroot).replace('\\', '/')
                        out.write(p, rel)
                        n_app += 1
        print(f'✓ حُزم {n_app} صنف تطبيق')
        # كل أوعية المكتبات: التطبيق يستدعي أصنافاً منها عند الإقلاع
        # (FileProvider من core، ArchTaskExecutor من arch.core…).
        # بدونها تظهر ClassNotFoundException في وقت التشغيل.
        merged = os.path.join(BUILD, 'bin', 'merged.jar')
        dep_files = [os.path.join(DEPS, f) for f in os.listdir(DEPS) if f.endswith(('.jar', '.aar'))]
        if os.path.exists(merged) and dep_files and \
           max(os.path.getmtime(p) for p in dep_files) > os.path.getmtime(merged):
            os.remove(merged)          # تغيّرت المكتبات ← نعيد الدمج

        def _keep(n):
            # أصناف فقط، دون META-INF/versions (Java 9+) وmodule-info
            return n.endswith('.class') and not n.startswith('META-INF/') \
                and not n.endswith('module-info.class')
        if not os.path.exists(merged):
            seen = set()
            with zipfile.ZipFile(merged, 'w', zipfile.ZIP_DEFLATED) as out:
                # (1) classes.jar المُستخرجة من كل AAR
                for f in sorted(os.listdir(os.path.join(BUILD, 'bin', 'libs'))):
                    if not f.endswith('.jar'):
                        continue
                    with zipfile.ZipFile(os.path.join(BUILD, 'bin', 'libs', f)) as z:
                        for n in z.namelist():
                            if _keep(n) and n not in seen:
                                seen.add(n)
                                out.writestr(n, z.read(n))
                # (2) jars المستقلة + classes.jar وlibs/*.jar من كل AAR
                #     (emoji2 مثلاً يحمل أصناف flatbuffer في libs/repackaged.jar)
                import io
                for f in sorted(os.listdir(DEPS)):
                    if not f.endswith(('.jar', '.aar')) or f.startswith('kotlin-reflect'):
                        continue   # kotlin-reflect غير مستعمل (يوفّر ~3MB)
                    p = os.path.join(DEPS, f)
                    srcs_ = []
                    if f.endswith('.aar'):
                        try:
                            with zipfile.ZipFile(p) as az:
                                for inner in az.namelist():
                                    if inner == 'classes.jar' or (inner.startswith('libs/') and inner.endswith('.jar')):
                                        srcs_.append(zipfile.ZipFile(io.BytesIO(az.read(inner))))
                        except Exception:
                            continue
                    else:
                        srcs_.append(zipfile.ZipFile(p))
                    for src in srcs_:
                        with src:
                            for n in src.namelist():
                                if _keep(n) and n not in seen:
                                    seen.add(n)
                                    out.writestr(n, src.read(n))
            print(f'✓ دُمج {len(seen)} صنف مكتبة')
        cmd = [JAVA, '-Xmx1536m', '-cp', D8_JAR, 'com.android.tools.r8.D8',
               '--release',
               '--lib', PLATFORM,
               '--min-api', '23',
               '--output', os.path.join(BUILD, 'bin', 'dex'),
               appjar, merged]
        env = dict(os.environ, JAVA_HOME=os.path.dirname(os.path.dirname(JAVA)))
        if not run(cmd, 'd8', env=env):
            return 1

    # ────────────────── 5) تجميع APK النهائي ──────────────────
    if step in ('all', 'package'):
        final = os.path.join(BUILD, 'bin', 'noor-unsigned.apk')
        # نأخذ base.apk ونضيف classes.dex
        shutil.copy(os.path.join(BUILD, 'bin', 'base.apk'), final)
        dexes = glob.glob(os.path.join(BUILD, 'bin', 'dex', '*.dex'))
        with zipfile.ZipFile(final, 'a', zipfile.ZIP_DEFLATED) as z:
            for d in dexes:
                z.write(d, os.path.basename(d))
        # إزالة التوقيع القديم إن وُجد
        # (aapt2 يكتب أسماء مسارات الأصول بفاصل '\' على ويندوز أحياناً
        #  فنوحّد كل الأسماء على '/' لكي يقرأها zipfile وandoird معاً)
        clean = os.path.join(BUILD, 'bin', 'noor-clean.apk')
        with zipfile.ZipFile(final) as zin, zipfile.ZipFile(clean, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename.startswith('META-INF/') and \
                   item.filename.rsplit('.', 1)[-1] in ('SF', 'RSA', 'DSA', 'EC'):
                    continue
                fixed = item.filename.replace('\\', '/')
                data = _raw_zip_read(zin, item)
                if fixed == item.filename:
                    zout.writestr(item, data)
                else:
                    zi = zipfile.ZipInfo(fixed, date_time=item.date_time)
                    zi.compress_type = zipfile.ZIP_DEFLATED
                    zi.external_attr = item.external_attr
                    zout.writestr(zi, data)
        # محاذاة
        aligned = os.path.join(BUILD, 'bin', 'noor-aligned.apk')
        cmd = [ZIPALIGN, '-f', '-p', '4', clean, aligned]
        if not run(cmd, 'zipalign'):
            return 1
        # توقيع
        if not os.path.exists(KEYSTORE):
            print('✗ مفتاح التوقيع غير موجود:', KEYSTORE)
            return 1
        cmd = [JAVA, '-jar', APKSIGNER_JAR, 'sign',
               '--ks', KEYSTORE, '--ks-key-alias', KS_ALIAS,
               '--ks-pass', 'pass:' + KS_PASS, '--key-pass', 'pass:' + KS_PASS,
               '--v1-signing-enabled', 'true', '--v2-signing-enabled', 'true', '--v3-signing-enabled', 'true',
               '--out', OUT_APK, aligned]
        env = dict(os.environ, JAVA_HOME=os.path.dirname(os.path.dirname(JAVA)))
        if not run(cmd, 'apksigner', env=env):
            return 1
        print(f'\n✓ APK جاهز: {OUT_APK} ({os.path.getsize(OUT_APK) / 1e6:.2f} MB)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
