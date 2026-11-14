"""Embed the additional Home Express artwork for local and Pages builds."""
import base64
import json
import hashlib
from pathlib import Path


def collection_source(root: Path) -> str:
    def data_url(path, mime):
        return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")

    artwork = "defaults/images/" + hashlib.sha256((root / "template-artwork/home-express-collection.png").read_bytes()).hexdigest() + ".png"
    products = json.loads((root / "template-artwork/home-express-collection-products.json").read_text(encoding="utf-8"))
    for product in products:
        marker = product["image"]
        product["image"] = data_url(root / "defaults" / marker["__defaultImage"], marker["mime"])
    back = (root / "home-express-collection.js").read_text(encoding="utf-8").replace(
        "__HOME_COLLECTION_ART__", json.dumps(artwork)
    ).replace("__HOME_COLLECTION_SEEDS__", json.dumps(products, ensure_ascii=False))
    front_artwork = "defaults/images/" + hashlib.sha256((root / "template-artwork/home-express-collection-front.jpg").read_bytes()).hexdigest() + ".jpg"
    front_products = json.loads((root / "template-artwork/home-express-collection-front-products.json").read_text(encoding="utf-8"))
    for product in front_products:
        marker = product["image"]
        product["image"] = data_url(root / "defaults" / marker["__defaultImage"], marker["mime"])
    front = (root / "home-express-collection-front.js").read_text(encoding="utf-8").replace(
        "__HOME_COLLECTION_FRONT_ART__", json.dumps(front_artwork)
    ).replace("__HOME_COLLECTION_FRONT_SEEDS__", json.dumps(front_products, ensure_ascii=False))
    peso_artwork = "defaults/images/" + hashlib.sha256((root / "template-artwork/pesoplus-collection-front.jpg").read_bytes()).hexdigest() + ".jpg"
    peso_products = json.loads((root / "template-artwork/pesoplus-collection-front-products.json").read_text(encoding="utf-8"))
    peso = (root / "pesoplus-collection-front.js").read_text(encoding="utf-8").replace(
        "__PESO_COLLECTION_FRONT_ART__", json.dumps(peso_artwork)
    ).replace("__PESO_COLLECTION_FRONT_SEEDS__", json.dumps(peso_products, ensure_ascii=False))
    peso_back_art = "defaults/images/" + hashlib.sha256((root / "template-artwork/pesoplus-collection-back.png").read_bytes()).hexdigest() + ".png"
    peso_back_products = json.loads((root / "template-artwork/pesoplus-collection-back-products.json").read_text(encoding="utf-8"))
    for product in peso_back_products:
        marker = product["image"]
        # Keep full-quality photos in the existing defaults assets instead of
        # duplicating their base64 payloads in the already large editor HTML.
        product["image"] = "defaults/" + marker["__defaultImage"]
    peso_back = (root / "pesoplus-collection-back.js").read_text(encoding="utf-8").replace(
        "__PESO_COLLECTION_BACK_ART__", json.dumps(peso_back_art)
    ).replace("__PESO_COLLECTION_BACK_SEEDS__", json.dumps(peso_back_products, ensure_ascii=False))
    alkeia_art = "defaults/images/" + hashlib.sha256((root / 'template-artwork/alkeia-talamban-front.jpg').read_bytes()).hexdigest() + '.jpg'
    alkeia_products = json.loads((root / 'template-artwork/alkeia-talamban-front-products.json').read_text(encoding='utf-8'))
    for product in alkeia_products:
        product['image'] = 'defaults/' + product['image']['__defaultImage']
    alkeia = (root / 'alkeia-front.js').read_text(encoding='utf-8').replace('__ALKEIA_FRONT_ART__',json.dumps(alkeia_art)).replace('__ALKEIA_FRONT_SEEDS__',json.dumps(alkeia_products))
    alkeia_back_art = "defaults/images/" + hashlib.sha256((root / 'template-artwork/alkeia-talamban-back.png').read_bytes()).hexdigest() + '.png'
    alkeia_back_products = json.loads((root / 'template-artwork/alkeia-talamban-back-products.json').read_text(encoding='utf-8'))
    for product in alkeia_back_products:
        product['image'] = 'defaults/' + product['image']['__defaultImage']
    alkeia_back = (root / 'alkeia-back.js').read_text(encoding='utf-8').replace('__ALKEIA_BACK_ART__',json.dumps(alkeia_back_art)).replace('__ALKEIA_BACK_SEEDS__',json.dumps(alkeia_back_products))
    felcon_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/felcon-bato-back.jpg').read_bytes()).hexdigest() + '.jpg'
    felcon_products = json.loads((root / 'template-artwork/felcon-bato-back-products.json').read_text(encoding='utf-8'))
    for product in felcon_products:
        product['image'] = 'defaults/' + product['image']['__defaultImage']
    felcon = (root / 'felcon-back.js').read_text(encoding='utf-8').replace('__FELCON_BACK_ART__',json.dumps(felcon_art)).replace('__FELCON_BACK_SEEDS__',json.dumps(felcon_products))
    felcon_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/felcon-bato-front.jpg').read_bytes()).hexdigest() + '.jpg'
    felcon_front_products = json.loads((root / 'template-artwork/felcon-bato-front-products.json').read_text(encoding='utf-8'))
    for product in felcon_front_products:
        product['image'] = 'defaults/' + product['image']['__defaultImage']
    felcon_front = (root / 'felcon-front.js').read_text(encoding='utf-8').replace('__FELCON_FRONT_ART__',json.dumps(felcon_front_art)).replace('__FELCON_FRONT_SEEDS__',json.dumps(felcon_front_products))
    ginsey_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-oslob-front.jpg').read_bytes()).hexdigest() + '.jpg'
    ginsey_products = json.loads((root / 'template-artwork/ginsey-oslob-front-products.json').read_text(encoding='utf-8'))
    ginsey = (root / 'ginsey-front.js').read_text(encoding='utf-8').replace('__GINSEY_FRONT_ART__',json.dumps(ginsey_art)).replace('__GINSEY_FRONT_SEEDS__',json.dumps(ginsey_products))
    ginsey_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-oslob-back.jpg').read_bytes()).hexdigest() + '.jpg'
    ginsey_back_products = json.loads((root / 'template-artwork/ginsey-oslob-back-products.json').read_text(encoding='utf-8'))
    ginsey_back = (root / 'ginsey-back.js').read_text(encoding='utf-8').replace('__GINSEY_BACK_ART__',json.dumps(ginsey_back_art)).replace('__GINSEY_BACK_SEEDS__',json.dumps(ginsey_back_products))
    welmart_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/welmart-inayawan-front.jpg').read_bytes()).hexdigest() + '.jpg'
    welmart_products = json.loads((root / 'template-artwork/welmart-inayawan-front-products.json').read_text(encoding='utf-8'))
    welmart = (root / 'welmart-front.js').read_text(encoding='utf-8').replace('__WELMART_FRONT_ART__',json.dumps(welmart_art)).replace('__WELMART_FRONT_SEEDS__',json.dumps(welmart_products))
    welmart_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/welmart-inayawan-back.jpg').read_bytes()).hexdigest() + '.jpg'
    welmart_back_products = json.loads((root / 'template-artwork/welmart-inayawan-back-products.json').read_text(encoding='utf-8'))
    welmart_back = (root / 'welmart-back.js').read_text(encoding='utf-8').replace('__WELMART_BACK_ART__',json.dumps(welmart_back_art)).replace('__WELMART_BACK_SEEDS__',json.dumps(welmart_back_products))
    tayud_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-tayud-front.jpg').read_bytes()).hexdigest() + '.jpg'
    tayud_products = json.loads((root / 'template-artwork/alkeia-tayud-front-products.json').read_text(encoding='utf-8'))
    tayud = (root / 'tayud-front.js').read_text(encoding='utf-8').replace('__TAYUD_FRONT_ART__',json.dumps(tayud_art)).replace('__TAYUD_FRONT_SEEDS__',json.dumps(tayud_products))
    tayud_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-tayud-back.jpg').read_bytes()).hexdigest() + '.jpg'
    tayud_back_products = json.loads((root / 'template-artwork/alkeia-tayud-back-products.json').read_text(encoding='utf-8'))
    tayud_back = (root / 'tayud-back.js').read_text(encoding='utf-8').replace('__TAYUD_BACK_ART__',json.dumps(tayud_back_art)).replace('__TAYUD_BACK_SEEDS__',json.dumps(tayud_back_products))
    kazumi_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-linao-front.jpg').read_bytes()).hexdigest() + '.jpg'
    kazumi_products = json.loads((root / 'template-artwork/kazumi-linao-front-products.json').read_text(encoding='utf-8'))
    kazumi = (root / 'kazumi-front.js').read_text(encoding='utf-8').replace('__KAZUMI_FRONT_ART__',json.dumps(kazumi_art)).replace('__KAZUMI_FRONT_SEEDS__',json.dumps(kazumi_products))
    kazumi_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-linao-back.jpg').read_bytes()).hexdigest() + '.jpg'
    kazumi_back_products = json.loads((root / 'template-artwork/kazumi-linao-back-products.json').read_text(encoding='utf-8'))
    kazumi_back = (root / 'kazumi-back.js').read_text(encoding='utf-8').replace('__KAZUMI_BACK_ART__',json.dumps(kazumi_back_art)).replace('__KAZUMI_BACK_SEEDS__',json.dumps(kazumi_back_products))
    oneplus_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/oneplus-pardo-front.jpg').read_bytes()).hexdigest() + '.jpg'
    oneplus_products = json.loads((root / 'template-artwork/oneplus-pardo-front-products.json').read_text(encoding='utf-8'))
    oneplus = (root / 'oneplus-front.js').read_text(encoding='utf-8').replace('__ONEPLUS_FRONT_ART__',json.dumps(oneplus_art)).replace('__ONEPLUS_FRONT_SEEDS__',json.dumps(oneplus_products))
    oneplus_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/oneplus-pardo-back.jpg').read_bytes()).hexdigest() + '.jpg'
    oneplus_back_products = json.loads((root / 'template-artwork/oneplus-pardo-back-products.json').read_text(encoding='utf-8'))
    oneplus_back = (root / 'oneplus-back.js').read_text(encoding='utf-8').replace('__ONEPLUS_BACK_ART__',json.dumps(oneplus_back_art)).replace('__ONEPLUS_BACK_SEEDS__',json.dumps(oneplus_back_products))
    weldon_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-carcar-front.jpg').read_bytes()).hexdigest() + '.jpg'
    weldon_products = json.loads((root / 'template-artwork/weldon-carcar-front-products.json').read_text(encoding='utf-8'))
    weldon = (root / 'weldon-front.js').read_text(encoding='utf-8').replace('__WELDON_FRONT_ART__',json.dumps(weldon_art)).replace('__WELDON_FRONT_SEEDS__',json.dumps(weldon_products))
    weldon_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-carcar-back.jpg').read_bytes()).hexdigest() + '.jpg'
    weldon_back_products = json.loads((root / 'template-artwork/weldon-carcar-back-products.json').read_text(encoding='utf-8'))
    weldon_back = (root / 'weldon-back.js').read_text(encoding='utf-8').replace('__WELDON_BACK_ART__',json.dumps(weldon_back_art)).replace('__WELDON_BACK_SEEDS__',json.dumps(weldon_back_products))
    sheldon_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/sheldon-pinamungajan-front.jpg').read_bytes()).hexdigest() + '.jpg'
    sheldon_products = json.loads((root / 'template-artwork/sheldon-pinamungajan-front-products.json').read_text(encoding='utf-8'))
    sheldon = (root / 'sheldon-front.js').read_text(encoding='utf-8').replace('__SHELDON_FRONT_ART__',json.dumps(sheldon_art)).replace('__SHELDON_FRONT_SEEDS__',json.dumps(sheldon_products))
    sheldon_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/sheldon-pinamungajan-back.jpg').read_bytes()).hexdigest() + '.jpg'
    sheldon_back_products = json.loads((root / 'template-artwork/sheldon-pinamungajan-back-products.json').read_text(encoding='utf-8'))
    sheldon_back = (root / 'sheldon-back.js').read_text(encoding='utf-8').replace('__SHELDON_BACK_ART__',json.dumps(sheldon_back_art)).replace('__SHELDON_BACK_SEEDS__',json.dumps(sheldon_back_products))
    mandarin_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-catmon-front.jpg').read_bytes()).hexdigest() + '.jpg'
    mandarin_products = json.loads((root / 'template-artwork/mandarin-catmon-front-products.json').read_text(encoding='utf-8'))
    mandarin = (root / 'mandarin-front.js').read_text(encoding='utf-8').replace('__MANDARIN_FRONT_ART__',json.dumps(mandarin_art)).replace('__MANDARIN_FRONT_SEEDS__',json.dumps(mandarin_products))
    mandarin_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-catmon-back.jpg').read_bytes()).hexdigest() + '.jpg'
    mandarin_back_products = json.loads((root / 'template-artwork/mandarin-catmon-back-products.json').read_text(encoding='utf-8'))
    mandarin_back = (root / 'mandarin-back.js').read_text(encoding='utf-8').replace('__MANDARIN_BACK_ART__',json.dumps(mandarin_back_art)).replace('__MANDARIN_BACK_SEEDS__',json.dumps(mandarin_back_products))
    dalaguete_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-dalaguete-front.jpg').read_bytes()).hexdigest() + '.jpg'
    dalaguete_products = json.loads((root / 'template-artwork/mandarin-dalaguete-front-products.json').read_text(encoding='utf-8'))
    dalaguete = (root / 'dalaguete-front.js').read_text(encoding='utf-8').replace('__DALAGUETE_FRONT_ART__',json.dumps(dalaguete_art)).replace('__DALAGUETE_FRONT_SEEDS__',json.dumps(dalaguete_products))
    dalaguete_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-dalaguete-back.jpg').read_bytes()).hexdigest() + '.jpg'
    dalaguete_back_products = json.loads((root / 'template-artwork/mandarin-dalaguete-back-products.json').read_text(encoding='utf-8'))
    dalaguete_back = (root / 'dalaguete-back.js').read_text(encoding='utf-8').replace('__DALAGUETE_BACK_ART__',json.dumps(dalaguete_back_art)).replace('__DALAGUETE_BACK_SEEDS__',json.dumps(dalaguete_back_products))
    bestco_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/bestco-tuburan-back.jpg').read_bytes()).hexdigest() + '.jpg'
    bestco_back_products = json.loads((root / 'template-artwork/bestco-tuburan-back-products.json').read_text(encoding='utf-8'))
    bestco_back = (root / 'bestco-back.js').read_text(encoding='utf-8').replace('__BESTCO_BACK_ART__',json.dumps(bestco_back_art)).replace('__BESTCO_BACK_SEEDS__',json.dumps(bestco_back_products))
    bestco_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/bestco-tuburan-front.jpg').read_bytes()).hexdigest() + '.jpg'
    bestco_products = json.loads((root / 'template-artwork/bestco-tuburan-front-products.json').read_text(encoding='utf-8'))
    bestco = (root / 'bestco-front.js').read_text(encoding='utf-8').replace('__BESTCO_FRONT_ART__',json.dumps(bestco_art)).replace('__BESTCO_FRONT_SEEDS__',json.dumps(bestco_products))
    sibonga_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-sibonga-front.jpg').read_bytes()).hexdigest() + '.jpg'
    sibonga_products = json.loads((root / 'template-artwork/ginsey-sibonga-front-products.json').read_text(encoding='utf-8'))
    sibonga = (root / 'sibonga-front.js').read_text(encoding='utf-8').replace('__SIBONGA_FRONT_ART__',json.dumps(sibonga_art)).replace('__SIBONGA_FRONT_SEEDS__',json.dumps(sibonga_products))
    sibonga_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-sibonga-back.jpg').read_bytes()).hexdigest() + '.jpg'
    sibonga_back_products = json.loads((root / 'template-artwork/ginsey-sibonga-back-products.json').read_text(encoding='utf-8'))
    sibonga_back = (root / 'sibonga-back.js').read_text(encoding='utf-8').replace('__SIBONGA_BACK_ART__',json.dumps(sibonga_back_art)).replace('__SIBONGA_BACK_SEEDS__',json.dumps(sibonga_back_products))
    return back + "\n" + front + "\n" + peso + "\n" + peso_back + "\n" + alkeia + "\n" + alkeia_back + "\n" + felcon + "\n" + felcon_front + "\n" + ginsey + "\n" + ginsey_back + "\n" + welmart + "\n" + welmart_back + "\n" + tayud + "\n" + tayud_back + "\n" + kazumi + "\n" + kazumi_back + "\n" + oneplus + "\n" + oneplus_back + "\n" + weldon + "\n" + weldon_back + "\n" + sheldon + "\n" + sheldon_back + "\n" + mandarin + "\n" + mandarin_back + "\n" + dalaguete + "\n" + dalaguete_back + "\n" + bestco_back + "\n" + bestco + "\n" + sibonga + "\n" + sibonga_back


def embed_collection(html: str, root: Path) -> str:
    start = "// BEGIN HOME EXPRESS COLLECTION\n"
    end = "// END HOME EXPRESS COLLECTION\n"
    section = start + collection_source(root) + "\n" + end
    if start in html:
        first = html.index(start)
        last = html.index(end, first) + len(end)
        return html[:first] + section + html[last:]
    anchor = "// Runs inside the editor closure;"
    return html.replace(anchor, section + anchor, 1)
