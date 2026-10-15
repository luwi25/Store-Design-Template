"""Local Store Design Template database and image service."""
import argparse
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import secrets
import sqlite3
import threading
import zlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
PORT = 8766
LOCK = threading.Lock()
MAX_BODY = 200 * 1024 * 1024


def connect():
    db = sqlite3.connect(DATA / 'store-design.sqlite3', timeout=30)
    db.execute('PRAGMA journal_mode=WAL')
    db.execute('PRAGMA synchronous=FULL')
    return db


def initialize():
    DATA.mkdir(exist_ok=True)
    token_file = DATA / 'service-token.txt'
    if not token_file.exists():
        token_file.write_text(secrets.token_urlsafe(40), encoding='utf-8')
    token = token_file.read_text(encoding='utf-8').strip()
    with connect() as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, data BLOB NOT NULL);
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL,
                document TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS backups (
                id INTEGER PRIMARY KEY, document TEXT NOT NULL,
                revision INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS legacy_imports (
                digest TEXT PRIMARY KEY, document TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        ''')
    config = {'baseUrl': f'http://127.0.0.1:{PORT}', 'token': token}
    (ROOT / 'db-config.js').write_text('window.STORE_DB_CONFIG=' + json.dumps(config) + ';\n', encoding='utf-8')
    return token


def pack(value, db):
    if isinstance(value, str) and value.startswith('data:image/'):
        raw = value.encode('utf-8')
        key = hashlib.sha256(raw).hexdigest()
        db.execute('INSERT OR IGNORE INTO assets(id,data) VALUES (?,?)', (key, zlib.compress(raw)))
        return {'__store_image__': key}
    if isinstance(value, dict):
        return {key: pack(item, db) for key, item in value.items()}
    if isinstance(value, list):
        return [pack(item, db) for item in value]
    return value


def unpack(value, db, cache=None):
    if cache is None:
        cache = {}
    if isinstance(value, dict):
        if set(value) == {'__store_image__'}:
            key = value['__store_image__']
            if key not in cache:
                row = db.execute('SELECT data FROM assets WHERE id=?', (key,)).fetchone()
                if row is None:
                    raise ValueError('A saved image is missing from the database.')
                cache[key] = zlib.decompress(row[0]).decode('utf-8')
            return cache[key]
        return {key: unpack(item, db, cache) for key, item in value.items()}
    if isinstance(value, list):
        return [unpack(item, db, cache) for item in value]
    return value


def valid_state(value):
    return isinstance(value, dict) and isinstance(value.get('products'), list) and isinstance(value.get('templates'), list)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # pythonw has no stderr; the UI receives actionable request errors.
        pass

    def send_bytes(self, status, body, mime='application/json; charset=utf-8'):
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        origin = self.headers.get('Origin')
        if origin in ('null', f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}'):
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def reply(self, status, data):
        self.send_bytes(status, json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def allowed_host(self):
        return self.headers.get('Host') in (f'127.0.0.1:{PORT}', f'localhost:{PORT}')

    def authorized(self):
        origin = self.headers.get('Origin')
        return self.allowed_host() and origin in (None, 'null', f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}') and secrets.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + self.server.token)

    def do_OPTIONS(self):
        if not self.allowed_host() or self.headers.get('Origin') not in ('null', f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}'):
            return self.reply(403, {'error': 'This origin is not allowed.'})
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', self.headers['Origin'])
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()

    def do_GET(self):
        if not self.allowed_host():
            return self.reply(403, {'error': 'Local connections only.'})
        path = urlsplit(self.path).path
        if path == '/api/health':
            return self.reply(200, {'service': 'store-design-database', 'ready': True})
        if path.startswith('/api/'):
            if not self.authorized():
                return self.reply(403, {'error': 'Database access denied. Reopen the app using its launcher.'})
            if path != '/api/state':
                return self.reply(404, {'error': 'Not found.'})
            try:
                with connect() as db:
                    row = db.execute('SELECT revision,document FROM app_state WHERE id=1').fetchone()
                    result = {'revision': row[0], 'state': unpack(json.loads(row[1]), db)} if row else {'revision': 0, 'state': None}
                return self.reply(200, result)
            except Exception:
                return self.reply(500, {'error': 'Could not read the local database. Your stored data has not been changed.'})
        if self.headers.get('Sec-Fetch-Site') == 'cross-site':
            return self.reply(403, {'error': 'Open this app directly on this computer.'})
        relative = unquote(path).lstrip('/') or 'index.html'
        target = (ROOT / relative).resolve()
        public = {'index.html', 'db-config.js', 'local-db.js'}
        if not target.is_relative_to(ROOT) or (relative not in public and not relative.startswith('assets/')) or not target.is_file():
            return self.reply(404, {'error': 'Not found.'})
        self.send_bytes(200, target.read_bytes(), mimetypes.guess_type(target.name)[0] or 'application/octet-stream')

    def do_PUT(self):
        self.write_state()

    def do_POST(self):
        if urlsplit(self.path).path == '/api/remove-background':
            return self.remove_background()
        self.write_state()

    def remove_background(self):
        if not self.authorized():
            return self.reply(403, {'error': 'Image processing access denied. Reopen the app using its launcher.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 29 * 1024 * 1024:
                return self.reply(413, {'error': 'Choose a smaller product photo (up to 20 MB).'})
            payload = json.loads(self.rfile.read(length))
            from background_removal import remove_background
            self.reply(200, remove_background(payload.get('image')))
        except (ValueError, TypeError, AttributeError) as error:
            self.reply(400, {'error': str(error)})
        except ImportError:
            self.reply(503, {'error': 'Background removal is not installed. Run Setup Background Removal.cmd, then reopen the app.'})
        except Exception:
            self.reply(500, {'error': 'Could not remove this background. The original image is unchanged. Try another photo or restart the app.'})

    def write_state(self):
        if not self.authorized():
            return self.reply(403, {'error': 'Database access denied. Reopen the app using its launcher.'})
        path = urlsplit(self.path).path
        if path not in ('/api/state', '/api/legacy-backup'):
            return self.reply(404, {'error': 'Not found.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_BODY:
                return self.reply(413, {'error': 'This save is too large. Maximum request size is 200 MB.'})
            payload = json.loads(self.rfile.read(length))
            value = payload.get('state')
            if not valid_state(value):
                return self.reply(400, {'error': 'The saved file must contain products and templates.'})
            with LOCK, connect() as db:
                row = db.execute('SELECT revision,document FROM app_state WHERE id=1').fetchone()
                revision = row[0] if row else 0
                if path == '/api/state' and payload.get('revision') != revision:
                    return self.reply(409, {'error': 'Another app tab saved changes. Download a backup of your edits, then reload this tab.'})
                document = json.dumps(pack(value, db), ensure_ascii=False, separators=(',', ':'))
                if path == '/api/legacy-backup':
                    digest = hashlib.sha256(document.encode()).hexdigest()
                    db.execute('INSERT OR IGNORE INTO legacy_imports(digest,document) VALUES (?,?)', (digest, document))
                else:
                    if row:
                        db.execute('INSERT INTO backups(document,revision) VALUES (?,?)', (row[1], revision))
                        db.execute('DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT 30)')
                    revision += 1
                    db.execute('INSERT INTO app_state(id,revision,document) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,document=excluded.document,updated_at=CURRENT_TIMESTAMP', (revision, document))
            self.reply(200, {'revision': revision, 'saved': True})
        except (ValueError, TypeError, KeyError):
            self.reply(400, {'error': 'Invalid saved data. The previous database save is still available.'})
        except Exception:
            self.reply(500, {'error': 'Could not save to the local database. Check free disk space and download a backup of your edits.'})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--init', action='store_true')
    args = parser.parse_args()
    token = initialize()
    if not args.init:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
        server.token = token
        server.serve_forever()
