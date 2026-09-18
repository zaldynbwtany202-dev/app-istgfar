#!/usr/bin/env python3
"""Simple file-upload server used to receive files (e.g. an APK) into the sandbox."""
import html
import os
import re
import urllib.parse
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "0.0.0.0"
PORT = int(os.environ.get("UPLOAD_PORT", "8080"))
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads"))
MAX_SIZE = 500 * 1024 * 1024  # 500 MB

RECEIVED_LOG = os.path.join(UPLOAD_DIR, "RECEIVED.log")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def human(n):
    if n > 1048576:
        return "%.1f MB" % (n / 1048576.0)
    if n > 1024:
        return "%.1f KB" % (n / 1024.0)
    return "%d B" % n


def secure_name(name):
    name = name.replace("\\", "/")
    if "''" in name:  # RFC 5987 filename*= style
        name = urllib.parse.unquote(name.split("'")[-1])
    name = os.path.basename(name)
    name = re.sub(r"[^\w.\- ]", "_", name).strip(" ._")
    if not name or name in (".", ".."):
        name = "upload.bin"
    return name[:120]


def unique_path(name):
    dest = os.path.join(UPLOAD_DIR, name)
    if not os.path.exists(dest):
        return dest
    base, ext = os.path.splitext(name)
    i = 1
    while True:
        cand = os.path.join(UPLOAD_DIR, "%s_%d%s" % (base, i, ext))
        if not os.path.exists(cand):
            return cand
        i += 1


def parse_multipart(body, ctype):
    m = re.search(r'boundary="?([^";]+)"?', ctype or "")
    if not m:
        return []
    boundary = m.group(1).encode()
    parts = []
    for chunk in body.split(b"--" + boundary):
        chunk = chunk.lstrip(b"\r\n")
        if not chunk or chunk.startswith(b"--"):
            continue
        if b"\r\n\r\n" not in chunk:
            continue
        head, content = chunk.split(b"\r\n\r\n", 1)
        content = content.rstrip(b"\r\n")
        headers = head.decode("utf-8", "replace")
        name_m = re.search(r'name="([^"]*)"', headers)
        fn_m = re.search(r'filename="([^"]*)"', headers)
        parts.append(
            (
                name_m.group(1) if name_m else None,
                fn_m.group(1) if fn_m else None,
                content,
            )
        )
    return parts


PAGE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>رفع الملفات إلى بيئة التطوير</title>
<style>
  body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; margin:0; min-height:100vh;
         display:flex; align-items:center; justify-content:center;
         background:linear-gradient(135deg,#0f4c3a,#14532d); padding:24px; box-sizing:border-box; }
  .card { background:#fff; color:#1f2937; border-radius:20px; padding:36px 32px;
          width:100%; max-width:560px; box-shadow:0 25px 60px rgba(0,0,0,.35); }
  h1 { font-size:1.4rem; margin:0 0 6px; color:#065f46; }
  p.sub { margin:0 0 22px; color:#6b7280; font-size:.95rem; }
  .drop { border:2px dashed #10b981; border-radius:16px; padding:34px 16px; text-align:center;
          cursor:pointer; background:#ecfdf5; }
  .drop.hover { background:#d1fae5; }
  input[type=file]{ display:none; }
  button { margin-top:18px; width:100%; padding:14px; font-size:1.05rem; font-weight:700;
           border:none; border-radius:12px; background:#059669; color:#fff; cursor:pointer; }
  button:disabled { background:#9ca3af; cursor:not-allowed; }
  .bar { margin-top:16px; height:12px; border-radius:999px; background:#e5e7eb; overflow:hidden; display:none; }
  .bar > div { height:100%; width:0%; background:#10b981; }
  .status { margin-top:12px; font-size:.95rem; min-height:1.4em; }
  .ok { color:#047857; font-weight:700; } .err { color:#b91c1c; font-weight:700; }
  ul.files { margin:8px 0 0; padding:14px 18px 14px 34px; background:#f9fafb; border-radius:12px; }
  ul.files li { margin:4px 0; direction:ltr; text-align:left; font-family:monospace; word-break:break-all; }
  .hint { margin-top:18px; font-size:.8rem; color:#9ca3af; text-align:center; }
</style>
</head>
<body>
<div class="card">
  <h1>📤 رفع ملف التطبيق إلى بيئة التطوير</h1>
  <p class="sub">اختر ملف الـ APK أو اسحبه إلى الصندوق ثم اضغط زر الرفع.</p>
  <div class="drop" id="drop">
    <p style="margin:0"><strong>اسحب الملف هنا</strong><br>أو اضغط لاختيار ملف من جهازك</p>
  </div>
  <input type="file" id="file">
  <button id="btn" disabled>رفع الملف</button>
  <div class="bar" id="bar"><div id="fill"></div></div>
  <div class="status" id="status"></div>
  __FILES__
  <div class="hint">سيصل الملف مباشرةً إلى بيئة العمل (الساندبوكس) ليتم تطويره.</div>
</div>
<script>
const drop=document.getElementById('drop'),file=document.getElementById('file'),
      btn=document.getElementById('btn'),bar=document.getElementById('bar'),
      fill=document.getElementById('fill'),status=document.getElementById('status');
let chosen=null;
drop.addEventListener('click',()=>file.click());
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('hover');});
drop.addEventListener('dragleave',()=>drop.classList.remove('hover'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('hover');
  if(e.dataTransfer.files.length){file.files=e.dataTransfer.files;onPick();}});
file.addEventListener('change',onPick);
function human(n){ if(n>1048576)return (n/1048576).toFixed(1)+' MB'; if(n>1024)return (n/1024).toFixed(1)+' KB'; return n+' B'; }
function onPick(){ if(!file.files.length)return; chosen=file.files[0];
  btn.disabled=false;
  drop.innerHTML='<p style="margin:0">✅ تم اختيار:<br><b style="direction:ltr;display:inline-block">'+chosen.name+'</b><br>('+human(chosen.size)+')</p>'; }
btn.addEventListener('click',()=>{
  if(!chosen)return;
  const fd=new FormData(); fd.append('file',chosen);
  const xhr=new XMLHttpRequest();
  xhr.open('POST','/upload');
  btn.disabled=true; bar.style.display='block'; status.textContent='جارٍ الرفع…';
  status.className='status';
  xhr.upload.onprogress=e=>{ if(e.lengthComputable){ const p=Math.round(e.loaded/e.total*100);
    fill.style.width=p+'%'; status.textContent='جارٍ الرفع… '+p+'%'; } };
  xhr.onload=()=>{ if(xhr.status===200){ status.className='status ok';
      status.textContent='🎉 تم رفع الملف بنجاح! ارجع الآن إلى المحادثة وأخبر المطوّر بذلك.';
      setTimeout(()=>location.reload(),1800);
    } else { status.className='status err'; status.textContent='حدث خطأ: '+xhr.responseText; btn.disabled=false; } };
  xhr.onerror=()=>{ status.className='status err'; status.textContent='تعذّر الاتصال بالخادم، أعد المحاولة.'; btn.disabled=false; };
  xhr.send(fd);
});
</script>
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "UploadServer/1.0"

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args), flush=True)

    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _page(self):
        files = []
        for name in sorted(os.listdir(UPLOAD_DIR)):
            path = os.path.join(UPLOAD_DIR, name)
            if os.path.isfile(path):
                files.append(
                    "<li>%s — %s</li>" % (html.escape(name), human(os.path.getsize(path)))
                )
        if files:
            block = (
                "<h3 style='margin:24px 0 0;color:#065f46'>📦 الملفات المستلمة:</h3>"
                "<ul class='files'>%s</ul>" % "".join(files)
            )
        else:
            block = ""
        return PAGE.replace("__FILES__", block)

    def do_GET(self):
        if self.path.split("?")[0] in ("/", "/index.html"):
            self._send(200, self._page())
        else:
            self._send(404, "Not found")

    def do_POST(self):
        if self.path != "/upload":
            self._send(404, "Not found")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0:
            self._send(400, "طلب فارغ")
            return
        if length > MAX_SIZE:
            self._send(413, "الملف أكبر من الحد المسموح (500 ميجابايت)")
            return
        ctype = self.headers.get("Content-Type", "")
        body = self.rfile.read(length)
        saved = []
        for _field, filename, content in parse_multipart(body, ctype):
            if not filename:
                continue
            dest = unique_path(secure_name(filename))
            with open(dest, "wb") as f:
                f.write(content)
            saved.append("%s (%s)" % (os.path.basename(dest), human(len(content))))
            print("Saved upload: %s (%d bytes)" % (dest, len(content)), flush=True)
            try:
                with open(RECEIVED_LOG, "a", encoding="utf-8") as lf:
                    lf.write(
                        "%s | %s | %d bytes\n"
                        % (
                            datetime.now().isoformat(timespec="seconds"),
                            os.path.basename(dest),
                            len(content),
                        )
                    )
            except OSError as e:
                print("WARN: could not write receipt log: %s" % e, flush=True)
        if saved:
            self._send(200, "تم الرفع بنجاح: " + "، ".join(saved))
        else:
            self._send(400, "لم يتم العثور على ملف في الطلب")


if __name__ == "__main__":
    print("Upload server listening on http://%s:%d" % (HOST, PORT), flush=True)
    print("Files will be stored in: %s" % UPLOAD_DIR, flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
