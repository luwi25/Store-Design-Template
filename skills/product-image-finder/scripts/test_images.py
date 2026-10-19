"""Offline contract checks using temporary projects; no production writes/network."""
import ast
import contextlib
import copy
import importlib.util
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
from types import SimpleNamespace
from PIL import Image

CLI = Path(__file__).with_name('images.py')


class ImageWorkflow(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        (self.repo / 'defaults').mkdir()
        self.project = {'sourceRevision': 10, 'state': {
            'products': [{'id': 'p1', 'code': 'SKU-1', 'name': 'Blue cup', 'price': 99,
                          'image': {'__defaultImage': 'images/old.png', 'mime': 'image/png'}}],
            'everyday': {'slots': [{'productId': 'p1', 'group': 0, 'discountPercent': 20,
                                    'textSizes': {'sale': 110}}]},
            'homeBack': {'slots': []}, 'peso': {'slots': []}, 'pesoBack': {'slots': []}}}
        self.path = self.repo / 'defaults/project.json'
        self.path.write_text(json.dumps(self.project), encoding='utf8')
        self.photo = self.repo / 'input.png'
        Image.new('RGBA', (80, 60), (40, 100, 230, 150)).save(self.photo)

    def cli(self, *args, fail=False):
        result = subprocess.run([sys.executable, str(CLI), '--repo', str(self.repo), *args],
                                capture_output=True, text=True, timeout=30)
        if fail:
            self.assertNotEqual(result.returncode, 0, result.stdout)
            return result.stderr
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def new_candidate(self):
        return self.cli('add', '--store', 'home-express-basak', '--product', 'p1',
                        '--file', str(self.photo), '--source-type', 'user-photo',
                        '--evidence', 'Owner confirms SKU-1')['candidate']

    def approve(self, cid):
        self.cli('enhance', '--candidate', cid)
        self.cli('approve', '--candidate', cid, '--reviewer', 'Fixture user', '--reason', 'Exact model checked')

    def test_end_to_end_preserves_product_settings_and_original(self):
        original_bytes = self.photo.read_bytes()
        cid = self.new_candidate()
        self.cli('approve', '--candidate', cid, '--reviewer', 'User', '--reason', 'x', fail=True)
        self.assertEqual(self.cli('publish')['changed'], [])
        self.approve(cid)
        result = self.cli('publish')
        self.assertEqual(result['changed'], ['p1'])
        self.assertEqual(result['revision'], 11)
        updated = json.loads(self.path.read_text())
        self.assertEqual(updated['state']['everyday'], self.project['state']['everyday'])
        p = updated['state']['products'][0]
        for key in ('name', 'price', 'code', 'id'):
            self.assertEqual(p[key], self.project['state']['products'][0][key])
        self.assertEqual(p['photoSource'], 'approved')
        self.assertEqual(json.loads(Path(result['backup']).read_text()), self.project)
        self.assertEqual(self.cli('publish')['changed'], [])
        self.assertEqual(self.photo.read_bytes(), original_bytes)
        self.cli('enhance', '--candidate', cid, fail=True)
        report = self.cli('report')
        self.assertTrue(Path(report['report']).is_file())
        self.assertEqual(self.cli('inventory')[0]['status'], 'approved')

    def test_rejected_replacement_keeps_approval(self):
        first = self.new_candidate()
        self.approve(first)
        second = self.new_candidate()
        self.cli('reject', '--candidate', second, '--reason', 'Wrong variant')
        self.assertEqual(self.cli('inventory')[0]['approved_candidate'], first)
        self.cli('publish')
        self.assertEqual(json.loads(self.path.read_text())['state']['products'][0]['photoApproval']['candidate'], first)

    def test_identity_change_and_hash_tampering_block_publication(self):
        cid = self.new_candidate()
        self.approve(cid)
        modified = copy.deepcopy(self.project)
        modified['state']['products'][0]['name'] = 'Different product'
        self.path.write_text(json.dumps(modified))
        self.assertIn('identity changed', self.cli('publish', fail=True))
        self.path.write_text(json.dumps(self.project))
        with contextlib.closing(sqlite3.connect(self.repo / 'data/product_images/library.sqlite3')) as db:
            relative = db.execute('SELECT enhanced FROM candidates WHERE id=?', (cid,)).fetchone()[0]
        (self.repo / 'data/product_images' / relative).write_bytes(b'changed')
        self.assertIn('hash mismatch', self.cli('publish', fail=True))
        self.assertEqual(json.loads(self.path.read_text()), self.project)

    def test_wrong_store_and_bad_image_do_not_register(self):
        self.cli('add', '--store', 'pesoplus-mambaling', '--product', 'p1', '--file', str(self.photo),
                 '--source-type', 'user-photo', '--evidence', 'test', fail=True)
        self.photo.write_bytes(b'not an image')
        self.cli('add', '--store', 'home-express-basak', '--product', 'p1', '--file', str(self.photo),
                 '--source-type', 'user-photo', '--evidence', 'test', fail=True)
        self.assertEqual(self.cli('inventory')[0]['status'], 'missing')

    def test_worker_timeout_keeps_previous_approval(self):
        first = self.new_candidate()
        self.approve(first)
        second = self.new_candidate()
        spec = importlib.util.spec_from_file_location('image_helper', CLI)
        helper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(helper)
        root = self.repo / 'data/product_images'
        with contextlib.closing(helper.db_open(root)) as db:
            with mock.patch.object(helper.subprocess, 'run', side_effect=subprocess.TimeoutExpired('worker', 1)):
                with self.assertRaises(subprocess.TimeoutExpired):
                    helper.enhance(SimpleNamespace(candidate=second, remove_background=False, timeout=1), self.repo, root, db)
            self.assertEqual(helper.candidate(db, second)['status'], 'failed')
        self.assertEqual(self.cli('inventory')[0]['approved_candidate'], first)
        self.cli('publish')
        self.assertEqual(json.loads(self.path.read_text())['state']['products'][0]['photoApproval']['candidate'], first)

    def test_shared_product_cannot_change_another_stores_photo(self):
        cid = self.new_candidate()
        self.approve(cid)
        project = copy.deepcopy(self.project)
        project['state']['peso']['slots'] = [{'productId': 'p1', 'group': 0}]
        self.path.write_text(json.dumps(project))
        self.assertIn('shared by stores', self.cli('publish', fail=True))
        self.assertEqual(json.loads(self.path.read_text()), project)


class WeeklyImageFallback(unittest.TestCase):
    def setUp(self):
        # Extract one pure orchestration function; never run the sync/API entrypoint.
        source = Path(__file__).resolve().parents[3] / 'scripts/weekly_sync.py'
        if not source.is_file():
            self.skipTest('Weekly integration checks run from the repository skill copy.')
        tree = ast.parse(source.read_text(encoding='utf8'))
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'upsert_product')
        self.ns = {'re': re, 'title_case': lambda name: name,
                   'placeholder_image_marker': lambda repo: {'placeholder': True},
                   'find_and_enhance_product_image': lambda *args: (None, None)}
        exec(compile(ast.Module(body=[node], type_ignores=[]), str(source), 'exec'), self.ns)

    def test_search_failure_keeps_existing_image(self):
        old = {'id': 'sales-heb-abc', 'image': 'existing-photo', 'photoSource': 'ddgs'}
        self.ns['upsert_product'](None, {'products': [old]}, {old['id']: old},
                                 'sales-heb', 'ABC', 'Cup', 50, None, 'home-back')
        self.assertEqual(old['image'], 'existing-photo')

    def test_approved_image_skips_external_replacement(self):
        def unexpected(*args, **kwargs):
            self.fail('Approved photo must not trigger network image replacement')
        self.ns['download_and_enhance_image'] = unexpected
        self.ns['find_and_enhance_product_image'] = unexpected
        old = {'id': 'sales-heb-abc', 'image': 'approved-photo', 'photoSource': 'approved'}
        self.ns['upsert_product'](None, {'products': [old]}, {old['id']: old},
                                 'sales-heb', 'ABC', 'Cup', 50, 'https://example.test/photo', 'home-back')
        self.assertEqual(old['image'], 'approved-photo')
        self.assertEqual(old['price'], 50)


if __name__ == '__main__':
    unittest.main()
