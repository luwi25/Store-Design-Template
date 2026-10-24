"""Offline regression checks for both stores' Template #2 sales filling."""
import copy
import json
import unittest
from unittest.mock import patch

import weekly_sync as sync


class CollectionSyncReview(unittest.TestCase):
    def scenario(self, store):
        cfg = sync.STORES[store]
        project = json.loads((sync.REPO / 'defaults/project.json').read_text(encoding='utf-8'))
        state = project['state']
        rows = [dict(stockno=f'SKU{i}', name=f'Raw supplier name {i}', units=100-i,
                     department=f'Department {i//6}', category=f'Category {i//3}',
                     retail_price=50+i, image_url='https://example.invalid/photo.png')
                for i in range(30)]
        prefix = cfg['prefix']
        state['products'] = [p for p in state['products'] if p.get('code') not in {r['stockno'] for r in rows}]
        for i, row in enumerate(rows):
            state['products'].append(dict(id=f'{prefix}-sku{i}', code=row['stockno'],
                templateId=cfg['collection_front_template_id'], name=f'Approved catalog name {i}',
                price=1, image={'__defaultImage': f'images/catalog-{i}.png', 'mime': 'image/png'},
                photoSource='approved'))
        back = state[cfg['collection_back_key']]
        back['groupNames'][0] = 'Custom Christmas heading'
        back['slots'][0].update(details={'name': 'Custom bundle', 'price': 321},
                                image='saved-bundle-photo', textSizes={'name': 125}, discountPercent=15)
        return cfg, state, rows

    def apply(self, cfg, state, rows):
        with patch.object(sync, 'placeholder_image_marker', return_value={}), \
             patch.object(sync, 'download_and_enhance_image', side_effect=AssertionError('No photo download expected')), \
             patch.object(sync, 'find_and_enhance_product_image', side_effect=AssertionError('No image search expected')):
            return sync.apply_collection(sync.REPO, state, {p['id']: p for p in state['products']},
                cfg['prefix'], rows, cfg['collection_front_key'], cfg['collection_back_key'],
                cfg['collection_front_template_id'], cfg['collection_back_template_id'])

    def test_both_stores_rank_and_preserve_catalog_and_bundles(self):
        for store in sync.STORES:
            with self.subTest(store=store):
                cfg, state, rows = self.scenario(store)
                before = copy.deepcopy(state)
                # Repeated API stock numbers must not occupy two front positions.
                rows.append({**rows[0], 'units': 120})
                self.apply(cfg, state, rows)
                front = state[cfg['collection_front_key']]['slots']
                self.assertEqual([s['productId'] for s in front], [f"{cfg['prefix']}-sku{i}" for i in range(8)])
                back = state[cfg['collection_back_key']]
                self.assertEqual(back['slots'][:5], before[cfg['collection_back_key']]['slots'][:5])
                self.assertEqual(back['groupNames'][0], 'Custom Christmas heading')
                self.assertEqual(back['groupNames'][1:], [f'Department {i}' for i in range(4)])
                for group in range(1, 5):
                    self.assertEqual([s['productId'] for s in back['slots'] if s['group'] == group],
                        [f"{cfg['prefix']}-sku{i}" for i in range((group-1)*6, (group-1)*6+5)])
                products = {p['id']: p for p in state['products']}
                first = products[front[0]['productId']]
                self.assertEqual(first['name'], 'Approved catalog name 0')
                self.assertEqual(first['image']['__defaultImage'], 'images/catalog-0.png')
                self.assertEqual(first['price'], 50)  # API price remains authoritative.
                self.assertIn(first['templateId'], [cfg['collection_front_template_id'], cfg['collection_back_template_id']])
                for key in ('everyday', 'homeBack', 'peso', 'pesoBack'):
                    self.assertEqual(state[key], before[key], f'{key} is not changed by Template #2 filling')
                other = sync.STORES['home-express-basak' if store == 'pesoplus-mambaling' else 'pesoplus-mambaling']
                for key in ('collection_front_key', 'collection_back_key'):
                    self.assertEqual(state[other[key]], before[other[key]])

    def test_short_rankings_clear_unfilled_slots_without_touching_bundles(self):
        cfg, state, rows = self.scenario('pesoplus-mambaling')
        bundles = copy.deepcopy(state['pesoCollectionBack']['slots'][:5])
        self.apply(cfg, state, rows[:3])
        self.assertTrue(all(s['productId'] is None for s in state['pesoCollectionFront']['slots'][3:]))
        self.assertEqual(state['pesoCollectionBack']['slots'][:5], bundles)
        self.assertTrue(all(s['productId'] is None for s in state['pesoCollectionBack']['slots'][10:]))

    def test_missing_template_aborts(self):
        cfg, state, rows = self.scenario('pesoplus-mambaling')
        del state['pesoCollectionBack']
        with self.assertRaisesRegex(RuntimeError, 'missing'):
            self.apply(cfg, state, rows)


if __name__ == '__main__':
    unittest.main()
