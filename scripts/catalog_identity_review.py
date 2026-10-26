import copy
import unittest
from unittest.mock import patch
import weekly_sync as sync
from catalog_identity import merge_catalog_duplicates


class SharedCatalogReview(unittest.TestCase):
    def test_same_stock_reuses_approved_photo_across_stores_with_separate_prices(self):
        p=dict(id='sales-ppm-cn-t450',code='CN-T450',name='Tissue',price=28,
               templateId='peso-back',image='approved.png',photoSource='approved')
        state={'products':[p]}
        with patch.object(sync,'download_and_enhance_image',side_effect=AssertionError('Do not fetch')), patch.object(sync,'find_and_enhance_product_image',side_effect=AssertionError('Do not search')):
            pid,_=sync.upsert_product(sync.REPO,state,{p['id']:p},'sales-heb','CN-T450','Raw Tissue',30,'api.jpg','home-back')
        self.assertEqual(pid,p['id'])
        self.assertEqual(len(state['products']),1)
        self.assertEqual(p['image'],'approved.png')
        self.assertEqual(p['name'],'Tissue')
        self.assertEqual(p['storePrices'],{'pesoplus-mambaling':28,'home-express-basak':30})

    def test_merge_keeps_settings_overrides_prices_and_archives_removed_record(self):
        a=dict(id='sales-heb-abc',code='ABC',name='ABC Tissue',price=30,image='old.jpg',templateId='home-back')
        b=dict(id='sales-ppm-abc',code='abc',name='Tissue',price=28,image='approved.png',photoSource='approved',templateId='peso-back')
        slot=dict(productId=a['id'],discountPercent=15,textSizes={'name':120},image='custom.png',details={'name':'Custom'})
        state={'products':[a,b],'homeBack':{'slots':[slot]},'pesoBack':{'slots':[{'productId':b['id']}]}}
        report=merge_catalog_duplicates(state)
        self.assertEqual(len(report['merged']),1)
        self.assertEqual(slot,dict(productId=b['id'],discountPercent=15,textSizes={'name':120},image='custom.png',details={'name':'Custom','price':30}))
        self.assertEqual(b['storePrices'],{'home-express-basak':30,'pesoplus-mambaling':28})
        self.assertEqual(len(state['catalogMergeHistory']),1)
        before=copy.deepcopy(state)
        merge_catalog_duplicates(state)
        self.assertEqual(state,before)

    def test_new_stock_is_shared_and_store_slot_prices_do_not_leak(self):
        state={'products':[], 'homeBack':{'slots':[]}}
        products={}
        with patch.object(sync,'find_and_enhance_product_image',return_value=(None,None)):
            a,_=sync.upsert_product(sync.REPO,state,products,'sales-heb','X-1','Test',10,None,'home-back')
            state['homeBack']['slots']=[{'productId':a,'details':{'price':10}}]
            b,_=sync.upsert_product(sync.REPO,state,products,'sales-ppm','X-1','Test',20,None,'peso-back')
        self.assertEqual(a,b)
        self.assertEqual(len(products),1)
        self.assertEqual(products[a]['storePrices'],{'home-express-basak':10,'pesoplus-mambaling':20})
        self.assertEqual(state['homeBack']['slots'][0]['details']['price'],10)

    def test_conflicting_variants_are_not_merged_or_matched(self):
        state={'products':[dict(id='a',code='ABC',name='Tissue 250'),dict(id='b',code='ABC',name='Tissue 450')]}
        report=merge_catalog_duplicates(state)
        self.assertEqual(len(state['products']),2)
        self.assertEqual(len(report['conflicts']),1)
        with self.assertRaisesRegex(RuntimeError,'Conflicting'):
            sync.upsert_product(sync.REPO,state,{p['id']:p for p in state['products']},'sales-heb','ABC','Tissue',30,None,'home-back')


if __name__=='__main__': unittest.main()
