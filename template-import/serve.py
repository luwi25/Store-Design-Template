from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import re
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        path=urlsplit(self.path).path
        if path=='/catalog/project.json' or re.fullmatch(r'/catalog/images/[a-f0-9]{64}\.(png|jpg|webp|svg)',path):
            target=REPO/'defaults'/path.removeprefix('/catalog/')
            if not target.is_file():return self.send_error(404)
            data=target.read_bytes();self.send_response(200);self.send_header('Content-Type',self.guess_type(str(target)));self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store' if path.endswith('.json') else 'public, max-age=31536000, immutable');self.end_headers();self.wfile.write(data);return
        if path.startswith('/catalog/'):return self.send_error(404)
        return super().do_GET()
if __name__=='__main__':
    print('Template Import: http://127.0.0.1:8767/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8767),Handler).serve_forever()
