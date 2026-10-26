"""Shared stock identities, with store prices and conservative duplicate merging."""
import copy
import json
import re
from collections import defaultdict


def stock_key(value):
    return str(value or '').strip().casefold()


def product_store(product):
    pid, template = str(product.get('id', '')), str(product.get('templateId') or '')
    if pid.startswith('sales-heb-') or template.startswith('home-'):
        return 'home-express-basak'
    if pid.startswith('sales-ppm-') or template.startswith('peso-'):
        return 'pesoplus-mambaling'
    return None


def slot_lists(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in ('products', 'sharedCatalogDraft', 'catalogMergeHistory'):
                continue
            if key == 'slots' and isinstance(child, list):
                yield child
            else:
                yield from slot_lists(child)
    elif isinstance(value, list):
        for child in value:
            yield from slot_lists(child)


def display_identity(product):
    name = stock_key(product.get('name'))
    code = stock_key(product.get('code'))
    if code and name.startswith(code + ' '):
        name = name[len(code):].strip()
    return re.sub(r'\s+', ' ', name)


def merge_catalog_duplicates(state):
    """Merge only matching descriptions, preserving slot-specific settings."""
    groups = defaultdict(list)
    for product in state['products']:
        if stock_key(product.get('code')):
            groups[stock_key(product['code'])].append(product)
    aliases = state.setdefault('catalogAliases', {})
    report = {'merged': [], 'conflicts': []}
    removed = set()
    for code, products in groups.items():
        if len(products) < 2:
            continue
        approved = {json.dumps(p['image'], sort_keys=True) for p in products
                    if p.get('image') and p.get('photoSource') == 'approved'}
        if len({display_identity(p) for p in products}) != 1 or len(approved) > 1:
            report['conflicts'].append({'code': code, 'ids': [p['id'] for p in products]})
            continue
        winner = max(products, key=lambda p: (p.get('photoSource') == 'approved',
                     bool(p.get('image')) and p.get('photoSource') != 'placeholder'))
        prices = {}
        for p in products:
            prices.update(p.get('storePrices', {}))
            store = product_store(p)
            if store:
                prices.setdefault(store, p.get('price', 0))
        ids = {p['id']: p for p in products}
        for slots in slot_lists(state):
            for slot in slots:
                old = ids.get(slot.get('productId'))
                if old is None:
                    continue
                # Freeze the effective price before the shared identity changes.
                slot['details'] = {**(slot.get('details') or {})}
                slot['details'].setdefault('price', old.get('price', 0))
                slot['productId'] = winner['id']
        for p in products:
            if p is winner:
                continue
            removed.add(p['id'])
            aliases[p['id']] = winner['id']
            state.setdefault('catalogMergeHistory', []).append(copy.deepcopy(p))
        winner.update(sharedCatalog=True, templateId='', storePrices=prices)
        report['merged'].append({'code': code, 'id': winner['id'], 'removed': sorted(set(ids)-{winner['id']})})
    state['products'] = [p for p in state['products'] if p['id'] not in removed]
    # Existing starter seeders respect tombstones and must not recreate duplicates.
    state['deletedProductIds'] = sorted(set(state.get('deletedProductIds', [])) | removed)
    return report
