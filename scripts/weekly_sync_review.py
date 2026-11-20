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

    def test_both_stores_rank_and_preserve_catalog_and_home_bundles(self):
        for store, config in sync.STORES.items():
            if not config.get('collection_front_key'):
                continue
            with self.subTest(store=store):
                cfg, state, rows = self.scenario(store)
                before = copy.deepcopy(state)
                # Repeated API stock numbers must not occupy two front positions.
                rows.append({**rows[0], 'units': 120})
                self.apply(cfg, state, rows)
                front = state[cfg['collection_front_key']]['slots']
                self.assertEqual([s['productId'] for s in front], [f"{cfg['prefix']}-sku{i}" for i in range(8)])
                back = state[cfg['collection_back_key']]
                start = 0 if store == 'pesoplus-mambaling' else 1
                if start:
                    self.assertEqual(back['slots'][:5], before[cfg['collection_back_key']]['slots'][:5])
                    self.assertEqual(back['groupNames'][0], 'Custom Christmas heading')
                self.assertEqual(back['groupNames'][start:], [f'Department {i}' for i in range(5-start)])
                for group in range(start, 5):
                    self.assertEqual([s['productId'] for s in back['slots'] if s['group'] == group],
                        [f"{cfg['prefix']}-sku{i}" for i in range((group-start)*6, (group-start)*6+5)])
                products = {p['id']: p for p in state['products']}
                first = products[front[0]['productId']]
                self.assertEqual(first['name'], 'Approved catalog name 0')
                self.assertEqual(first['image']['__defaultImage'], 'images/catalog-0.png')
                self.assertEqual(first['price'], 50)  # API price remains authoritative.
                self.assertTrue(first['sharedCatalog'])
                self.assertEqual(first['storePrices'][store],50)
                self.assertEqual(front[0]['details']['price'],50)
                for key in ('everyday', 'homeBack', 'peso', 'pesoBack'):
                    self.assertEqual(state[key], before[key], f'{key} is not changed by Template #2 filling')
                other = sync.STORES['home-express-basak' if store == 'pesoplus-mambaling' else 'pesoplus-mambaling']
                for key in ('collection_front_key', 'collection_back_key'):
                    self.assertEqual(state[other[key]], before[other[key]])

    def test_short_pesoplus_rankings_clear_unfilled_slots_in_all_rows(self):
        cfg, state, rows = self.scenario('pesoplus-mambaling')
        self.apply(cfg, state, rows[:3])
        self.assertTrue(all(s['productId'] is None for s in state['pesoCollectionFront']['slots'][3:]))
        self.assertEqual(state['pesoCollectionBack']['groupNames'][0], 'Department 0')
        self.assertTrue(all(s['productId'] is None for s in state['pesoCollectionBack']['slots'][3:]))

    def test_missing_template_aborts(self):
        cfg, state, rows = self.scenario('pesoplus-mambaling')
        del state['pesoCollectionBack']
        with self.assertRaisesRegex(RuntimeError, 'missing'):
            self.apply(cfg, state, rows)


class AlkeiaSyncReview(unittest.TestCase):
    def test_ranked_pair_reuses_catalog_and_keeps_other_templates(self):
        cfg = sync.STORES['alkeia-talamban']
        state = json.loads((sync.REPO / 'defaults/project.json').read_text(encoding='utf-8'))['state']
        before = copy.deepcopy(state)
        rows = [dict(stockno=f'ALKEIA-TEST-{i}', name=f'API name {i}', units=100-i,
                     retail_price=20+i, image_url='', department='Kitchenware', category='Plates') for i in range(20)]
        for i, row in enumerate(rows):
            state['products'].append(dict(id=f'test-alkeia-{i}', code=row['stockno'], name=f'Catalog name {i}',
                price=99, image='approved-photo', photoSource='approved', storePrices={'pesoplus-mambaling':99}))
        with patch.object(sync, 'placeholder_image_marker', return_value={}), \
             patch.object(sync, 'find_and_enhance_product_image', side_effect=AssertionError('Reuse catalog image')):
            sync.apply_ranked_pair(sync.REPO,state,{p['id']:p for p in state['products']},cfg,rows+[rows[0]])
        slots=state['alkeiaFront']['slots']+state['alkeiaBack']['slots']
        self.assertEqual([s['productId'] for s in slots],[f'test-alkeia-{i}' for i in range(18)])
        product=next(p for p in state['products'] if p['id']=='test-alkeia-0')
        self.assertEqual(product['name'],'Catalog name 0')
        self.assertEqual(product['image'],'approved-photo')
        self.assertEqual(product['storePrices'],{'pesoplus-mambaling':99,'alkeia-talamban':20})
        for key in ['everyday','homeBack','peso','pesoBack','homeCollection','homeCollectionFront','pesoCollectionFront','pesoCollectionBack']:
            self.assertEqual(state[key],before[key])

    def test_unavailable_store_is_skipped(self):
        with patch.object(sync,'api_get',return_value={'stores':[{'id':'home-express-basak'}]}):
            self.assertFalse(sync.optional_store_available('url','key','alkeia-talamban'))
        with patch.object(sync,'api_get',return_value={'stores':[{'id':'alkeia-talamban'}]}):
            self.assertTrue(sync.optional_store_available('url','key','alkeia-talamban'))

    def test_short_rankings_preserve_both_templates(self):
        cfg=sync.STORES['alkeia-talamban']
        state=json.loads((sync.REPO/'defaults/project.json').read_text(encoding='utf-8'))['state']
        before=copy.deepcopy(state)
        self.assertEqual(sync.apply_ranked_pair(sync.REPO,state,{},cfg,[]),[])
        self.assertEqual(state,before)

    def test_store_lookup_failure_is_safe(self):
        with patch.object(sync,'api_get',side_effect=RuntimeError('offline')):
            self.assertFalse(sync.optional_store_available('url','key','alkeia-talamban'))


class LandscapeTemplate3Review(unittest.TestCase):
    def scenario(self):
        state = json.loads((sync.REPO / 'defaults/project.json').read_text(encoding='utf-8'))['state']
        rows = [dict(stockno=f'T3-{d}-{i}', name=f'Product {d}-{i}', units=1000-d*30-i,
                     department=f'Dept {d}', category=f'Category {d}', retail_price=100+i,
                     image_url='') for d in range(10) for i in range(7)]
        for key in ('homeV2Front', 'homeV2Back'):
            for slot in state[key]['slots']:
                slot.update(textSizes={'name':120}, image='old-photo', details={'name':'Old item'}, discountPercent=20)
        return state, rows

    def apply(self, state, rows):
        with patch.object(sync, 'upsert_product', side_effect=lambda repo, state, products, prefix, code, *args: (code, 'catalog-matched')) as upsert:
            entries = sync.apply_home_template_3(sync.REPO, state, {}, 'sales-heb', rows)
            self.assertTrue(all(c.args[3] == 'sales-heb' for c in upsert.call_args_list))
            return entries

    def test_rankings_featured_slots_and_isolation(self):
        state, rows = self.scenario()
        before = copy.deepcopy(state)
        rows += [dict(rows[0]), dict(rows[0], stockno='EXCLUDED', department='Grocery', units=99999)]
        self.assertTrue(sync.STORES['home-express-basak']['landscape_template_3'])
        self.assertFalse(sync.STORES['pesoplus-mambaling'].get('landscape_template_3'))
        entries = self.apply(state, rows)
        self.assertEqual(len(entries), 91)
        for key, groups in [('homeV2Front',7), ('homeV2Back',10)]:
            self.assertEqual(state[key]['groupNames'][:groups], [f'Dept {i}' for i in range(groups)])
            for group in range(groups):
                slots = [s for s in state[key]['slots'] if s['group']==group]
                self.assertEqual([s['productId'] for s in slots], [f'T3-{group}-{i}' for i in range(5)])
                for i, slot in enumerate(slots):
                    self.assertEqual(slot['textSizes'], {'name':120})
                    self.assertNotIn('image', slot)
                    self.assertEqual(slot['details'], {'price':100+i})
                    self.assertEqual(slot['discountPercent'],0)
        featured = state['homeV2Front']['slots'][35:]
        self.assertEqual([s['productId'] for s in featured], [f'T3-0-{i}' for i in range(6)])
        for key in before:
            if key not in ('homeV2Front', 'homeV2Back'):
                self.assertEqual(state[key], before[key], key)

    def test_short_and_empty_rankings_clear_stale_items(self):
        for size in (0, 2):
            state, rows = self.scenario()
            self.apply(state, rows[:size])
            for key in ('homeV2Front', 'homeV2Back'):
                slots = state[key]['slots']
                self.assertEqual(sum(s['productId'] is not None for s in slots),size*(2 if key=='homeV2Front' else 1))
                self.assertTrue(all('image' not in s and s['discountPercent']==0 for s in slots))
                self.assertTrue(all(s['textSizes']=={'name':120} for s in slots))

    def test_invalid_back_aborts_before_front_changes(self):
        state, rows = self.scenario()
        state['homeV2Back']['slots'].pop()
        before = copy.deepcopy(state)
        with self.assertRaisesRegex(RuntimeError, 'unexpected groups'):
            self.apply(state, rows)
        self.assertEqual(state, before)


if __name__ == '__main__':
    unittest.main()
