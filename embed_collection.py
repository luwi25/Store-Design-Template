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
    unico_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-talisay-front.jpg').read_bytes()).hexdigest() + '.jpg'
    unico_products = json.loads((root / 'template-artwork/unico-talisay-front-products.json').read_text(encoding='utf-8'))
    unico = (root / 'unico-front.js').read_text(encoding='utf-8').replace('__UNICO_FRONT_ART__',json.dumps(unico_art)).replace('__UNICO_FRONT_SEEDS__',json.dumps(unico_products))
    unico_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-talisay-back.jpg').read_bytes()).hexdigest() + '.jpg'
    unico_back_products = json.loads((root / 'template-artwork/unico-talisay-back-products.json').read_text(encoding='utf-8'))
    unico_back = (root / 'unico-back.js').read_text(encoding='utf-8').replace('__UNICO_BACK_ART__',json.dumps(unico_back_art)).replace('__UNICO_BACK_SEEDS__',json.dumps(unico_back_products))
    alkeia_v2_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-talamban-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    alkeia_v2_seeds = json.loads((root / 'template-artwork/alkeia-talamban-v2-back-products.json').read_text(encoding='utf-8'))
    alkeia_v2 = (root / 'alkeia-v2-back.js').read_text(encoding='utf-8').replace('__ALKEIA_V2_BACK_ART__',json.dumps(alkeia_v2_art)).replace('__ALKEIA_V2_BACK_SEEDS__',json.dumps(alkeia_v2_seeds))
    front_v2_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-talamban-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    front_v2_seeds = json.loads((root / 'template-artwork/alkeia-talamban-v2-front-products.json').read_text(encoding='utf-8'))
    front_v2 = (root / 'alkeia-v2-front.js').read_text(encoding='utf-8').replace('__ALKEIA_V2_FRONT_ART__',json.dumps(front_v2_art)).replace('__ALKEIA_V2_FRONT_SEEDS__',json.dumps(front_v2_seeds))
    home_v2_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/home-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    home_v2_seeds = json.loads((root / 'template-artwork/home-v2-front-products.json').read_text(encoding='utf-8'))
    home_v2 = (root / 'home-v2-front.js').read_text(encoding='utf-8').replace('__HOME_V2_FRONT_ART__',json.dumps(home_v2_art)).replace('__HOME_V2_FRONT_SEEDS__',json.dumps(home_v2_seeds))
    home_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/home-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    home_v2_back_seeds = json.loads((root / 'template-artwork/home-v2-back-products.json').read_text(encoding='utf-8'))
    home_v2_back = (root / 'home-v2-back.js').read_text(encoding='utf-8').replace('__HOME_V2_BACK_ART__',json.dumps(home_v2_back_art)).replace('__HOME_V2_BACK_SEEDS__',json.dumps(home_v2_back_seeds))
    bestco_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/bestco-tuburan-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    bestco_v2_front_seeds = json.loads((root / 'template-artwork/bestco-tuburan-v2-front-products.json').read_text(encoding='utf-8'))
    bestco_v2_front = (root / 'bestco-v2-front.js').read_text(encoding='utf-8').replace('__BESTCO_V2_FRONT_ART__',json.dumps(bestco_v2_front_art)).replace('__BESTCO_V2_FRONT_SEEDS__',json.dumps(bestco_v2_front_seeds))
    bestco_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/bestco-tuburan-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    bestco_v2_back_seeds = json.loads((root / 'template-artwork/bestco-tuburan-v2-back-products.json').read_text(encoding='utf-8'))
    bestco_v2_back = (root / 'bestco-v2-back.js').read_text(encoding='utf-8').replace('__BESTCO_V2_BACK_ART__',json.dumps(bestco_v2_back_art)).replace('__BESTCO_V2_BACK_SEEDS__',json.dumps(bestco_v2_back_seeds))
    ginsey_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-oslob-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    ginsey_v2_front_seeds = json.loads((root / 'template-artwork/ginsey-oslob-v2-front-products.json').read_text(encoding='utf-8'))
    ginsey_v2_front = (root / 'ginsey-v2-front.js').read_text(encoding='utf-8').replace('__GINSEY_V2_FRONT_ART__',json.dumps(ginsey_v2_front_art)).replace('__GINSEY_V2_FRONT_SEEDS__',json.dumps(ginsey_v2_front_seeds))
    welmart_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/welmart-inayawan-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    welmart_v2_front_seeds = json.loads((root / 'template-artwork/welmart-inayawan-v2-front-products.json').read_text(encoding='utf-8'))
    welmart_v2_front = (root / 'welmart-v2-front.js').read_text(encoding='utf-8').replace('__WELMART_V2_FRONT_ART__',json.dumps(welmart_v2_front_art)).replace('__WELMART_V2_FRONT_SEEDS__',json.dumps(welmart_v2_front_seeds))
    welmart_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/welmart-inayawan-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    welmart_v2_back_seeds = json.loads((root / 'template-artwork/welmart-inayawan-v2-back-products.json').read_text(encoding='utf-8'))
    welmart_v2_back = (root / 'welmart-v2-back.js').read_text(encoding='utf-8').replace('__WELMART_V2_BACK_ART__',json.dumps(welmart_v2_back_art)).replace('__WELMART_V2_BACK_SEEDS__',json.dumps(welmart_v2_back_seeds))
    unico_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-talisay-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    unico_v2_front_seeds = json.loads((root / 'template-artwork/unico-talisay-v2-front-products.json').read_text(encoding='utf-8'))
    unico_v2_front = (root / 'unico-v2-front.js').read_text(encoding='utf-8').replace('__UNICO_V2_FRONT_ART__',json.dumps(unico_v2_front_art)).replace('__UNICO_V2_FRONT_SEEDS__',json.dumps(unico_v2_front_seeds))
    ginsey_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-oslob-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    ginsey_v2_back_seeds = json.loads((root / 'template-artwork/ginsey-oslob-v2-back-products.json').read_text(encoding='utf-8'))
    ginsey_v2_back = (root / 'ginsey-v2-back.js').read_text(encoding='utf-8').replace('__GINSEY_V2_BACK_ART__',json.dumps(ginsey_v2_back_art)).replace('__GINSEY_V2_BACK_SEEDS__',json.dumps(ginsey_v2_back_seeds))
    oneplus_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/oneplus-pardo-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    oneplus_v2_front_seeds = json.loads((root / 'template-artwork/oneplus-pardo-v2-front-products.json').read_text(encoding='utf-8'))
    oneplus_v2_front = (root / 'oneplus-v2-front.js').read_text(encoding='utf-8').replace('__ONEPLUS_V2_FRONT_ART__',json.dumps(oneplus_v2_front_art)).replace('__ONEPLUS_V2_FRONT_SEEDS__',json.dumps(oneplus_v2_front_seeds))
    oneplus_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/oneplus-pardo-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    oneplus_v2_back_seeds = json.loads((root / 'template-artwork/oneplus-pardo-v2-back-products.json').read_text(encoding='utf-8'))
    oneplus_v2_back = (root / 'oneplus-v2-back.js').read_text(encoding='utf-8').replace('__ONEPLUS_V2_BACK_ART__',json.dumps(oneplus_v2_back_art)).replace('__ONEPLUS_V2_BACK_SEEDS__',json.dumps(oneplus_v2_back_seeds))
    kazumi_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-linao-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    kazumi_v2_front_seeds = json.loads((root / 'template-artwork/kazumi-linao-v2-front-products.json').read_text(encoding='utf-8'))
    kazumi_v2_front = (root / 'kazumi-v2-front.js').read_text(encoding='utf-8').replace('__KAZUMI_V2_FRONT_ART__',json.dumps(kazumi_v2_front_art)).replace('__KAZUMI_V2_FRONT_SEEDS__',json.dumps(kazumi_v2_front_seeds))
    kazumi_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-linao-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    kazumi_v2_back_seeds = json.loads((root / 'template-artwork/kazumi-linao-v2-back-products.json').read_text(encoding='utf-8'))
    kazumi_v2_back = (root / 'kazumi-v2-back.js').read_text(encoding='utf-8').replace('__KAZUMI_V2_BACK_ART__',json.dumps(kazumi_v2_back_art)).replace('__KAZUMI_V2_BACK_SEEDS__',json.dumps(kazumi_v2_back_seeds))
    tisa_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/home-express-tisa-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    tisa_v2_back_seeds = json.loads((root / 'template-artwork/home-express-tisa-v2-back-products.json').read_text(encoding='utf-8'))
    tisa_v2_back = (root / 'tisa-v2-back.js').read_text(encoding='utf-8').replace('__TISA_V2_BACK_ART__',json.dumps(tisa_v2_back_art)).replace('__TISA_V2_BACK_SEEDS__',json.dumps(tisa_v2_back_seeds))
    tisa_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/home-express-tisa-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    tisa_v2_front_seeds = json.loads((root / 'template-artwork/home-express-tisa-v2-front-products.json').read_text(encoding='utf-8'))
    tisa_v2_front = (root / 'tisa-v2-front.js').read_text(encoding='utf-8').replace('__TISA_V2_FRONT_ART__',json.dumps(tisa_v2_front_art)).replace('__TISA_V2_FRONT_SEEDS__',json.dumps(tisa_v2_front_seeds))
    ubest_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ubest-opon-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    ubest_v2_back_seeds = json.loads((root / 'template-artwork/ubest-opon-v2-back-products.json').read_text(encoding='utf-8'))
    ubest_v2_back = (root / 'ubest-v2-back.js').read_text(encoding='utf-8').replace('__UBEST_V2_BACK_ART__',json.dumps(ubest_v2_back_art)).replace('__UBEST_V2_BACK_SEEDS__',json.dumps(ubest_v2_back_seeds))
    ubest_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ubest-opon-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    ubest_v2_front_seeds = json.loads((root / 'template-artwork/ubest-opon-v2-front-products.json').read_text(encoding='utf-8'))
    ubest_v2_front = (root / 'ubest-v2-front.js').read_text(encoding='utf-8').replace('__UBEST_V2_FRONT_ART__',json.dumps(ubest_v2_front_art)).replace('__UBEST_V2_FRONT_SEEDS__',json.dumps(ubest_v2_front_seeds))
    peso_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/peso-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    peso_v2_front_seeds = json.loads((root / 'template-artwork/peso-v2-front-products.json').read_text(encoding='utf-8'))
    peso_v2_front = (root / 'peso-v2-front.js').read_text(encoding='utf-8').replace('__PESO_V2_FRONT_ART__',json.dumps(peso_v2_front_art)).replace('__PESO_V2_FRONT_SEEDS__',json.dumps(peso_v2_front_seeds))
    peso_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/peso-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    peso_v2_back_seeds = json.loads((root / 'template-artwork/peso-v2-back-products.json').read_text(encoding='utf-8'))
    peso_v2_back = (root / 'peso-v2-back.js').read_text(encoding='utf-8').replace('__PESO_V2_BACK_ART__',json.dumps(peso_v2_back_art)).replace('__PESO_V2_BACK_SEEDS__',json.dumps(peso_v2_back_seeds))
    babag_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-babag-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    babag_v2_front_seeds = json.loads((root / 'template-artwork/weldon-babag-v2-front-products.json').read_text(encoding='utf-8'))
    babag_v2_front = (root / 'babag-v2-front.js').read_text(encoding='utf-8').replace('__BABAG_V2_FRONT_ART__',json.dumps(babag_v2_front_art)).replace('__BABAG_V2_FRONT_SEEDS__',json.dumps(babag_v2_front_seeds))
    babag_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-babag-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    babag_v2_back_seeds = json.loads((root / 'template-artwork/weldon-babag-v2-back-products.json').read_text(encoding='utf-8'))
    babag_v2_back = (root / 'babag-v2-back.js').read_text(encoding='utf-8').replace('__BABAG_V2_BACK_ART__',json.dumps(babag_v2_back_art)).replace('__BABAG_V2_BACK_SEEDS__',json.dumps(babag_v2_back_seeds))
    carmen_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-carmen-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    carmen_v2_back_seeds = json.loads((root / 'template-artwork/alkeia-carmen-v2-back-products.json').read_text(encoding='utf-8'))
    carmen_v2_back = (root / 'carmen-v2-back.js').read_text(encoding='utf-8').replace('__CARMEN_V2_BACK_ART__',json.dumps(carmen_v2_back_art)).replace('__CARMEN_V2_BACK_SEEDS__',json.dumps(carmen_v2_back_seeds))
    carmen_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-carmen-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    carmen_v2_front_seeds = json.loads((root / 'template-artwork/alkeia-carmen-v2-front-products.json').read_text(encoding='utf-8'))
    carmen_v2_front = (root / 'carmen-v2-front.js').read_text(encoding='utf-8').replace('__CARMEN_V2_FRONT_ART__',json.dumps(carmen_v2_front_art)).replace('__CARMEN_V2_FRONT_SEEDS__',json.dumps(carmen_v2_front_seeds))
    pinam_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-pinamungajan-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    pinam_v2_front_seeds = json.loads((root / 'template-artwork/unico-pinamungajan-v2-front-products.json').read_text(encoding='utf-8'))
    pinam_v2_front = (root / 'pinam-v2-front.js').read_text(encoding='utf-8').replace('__PINAM_V2_FRONT_ART__',json.dumps(pinam_v2_front_art)).replace('__PINAM_V2_FRONT_SEEDS__',json.dumps(pinam_v2_front_seeds))
    pinam_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-pinamungajan-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    pinam_v2_back_seeds = json.loads((root / 'template-artwork/unico-pinamungajan-v2-back-products.json').read_text(encoding='utf-8'))
    pinam_v2_back = (root / 'pinam-v2-back.js').read_text(encoding='utf-8').replace('__PINAM_V2_BACK_ART__',json.dumps(pinam_v2_back_art)).replace('__PINAM_V2_BACK_SEEDS__',json.dumps(pinam_v2_back_seeds))
    danao_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ubest-danao-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    danao_v2_back_seeds = json.loads((root / 'template-artwork/ubest-danao-v2-back-products.json').read_text(encoding='utf-8'))
    danao_v2_back = (root / 'danao-v2-back.js').read_text(encoding='utf-8').replace('__DANAO_V2_BACK_ART__',json.dumps(danao_v2_back_art)).replace('__DANAO_V2_BACK_SEEDS__',json.dumps(danao_v2_back_seeds))
    danao_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ubest-danao-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    danao_v2_front_seeds = json.loads((root / 'template-artwork/ubest-danao-v2-front-products.json').read_text(encoding='utf-8'))
    danao_v2_front = (root / 'danao-v2-front.js').read_text(encoding='utf-8').replace('__DANAO_V2_FRONT_ART__',json.dumps(danao_v2_front_art)).replace('__DANAO_V2_FRONT_SEEDS__',json.dumps(danao_v2_front_seeds))
    balamban_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-balamban-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    balamban_v2_back_seeds = json.loads((root / 'template-artwork/unico-balamban-v2-back-products.json').read_text(encoding='utf-8'))
    balamban_v2_back = (root / 'balamban-v2-back.js').read_text(encoding='utf-8').replace('__BALAMBAN_V2_BACK_ART__',json.dumps(balamban_v2_back_art)).replace('__BALAMBAN_V2_BACK_SEEDS__',json.dumps(balamban_v2_back_seeds))
    balamban_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-balamban-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    balamban_v2_front_seeds = json.loads((root / 'template-artwork/unico-balamban-v2-front-products.json').read_text(encoding='utf-8'))
    balamban_v2_front = (root / 'balamban-v2-front.js').read_text(encoding='utf-8').replace('__BALAMBAN_V2_FRONT_ART__',json.dumps(balamban_v2_front_art)).replace('__BALAMBAN_V2_FRONT_SEEDS__',json.dumps(balamban_v2_front_seeds))
    catmon_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-catmon-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    catmon_v2_back_seeds = json.loads((root / 'template-artwork/mandarin-catmon-v2-back-products.json').read_text(encoding='utf-8'))
    catmon_v2_back = (root / 'catmon-v2-back.js').read_text(encoding='utf-8').replace('__CATMON_V2_BACK_ART__',json.dumps(catmon_v2_back_art)).replace('__CATMON_V2_BACK_SEEDS__',json.dumps(catmon_v2_back_seeds))
    catmon_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/mandarin-catmon-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    catmon_v2_front_seeds = json.loads((root / 'template-artwork/mandarin-catmon-v2-front-products.json').read_text(encoding='utf-8'))
    catmon_v2_front = (root / 'catmon-v2-front.js').read_text(encoding='utf-8').replace('__CATMON_V2_FRONT_ART__',json.dumps(catmon_v2_front_art)).replace('__CATMON_V2_FRONT_SEEDS__',json.dumps(catmon_v2_front_seeds))
    opon_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-opon-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    opon_v2_back_seeds = json.loads((root / 'template-artwork/kazumi-opon-v2-back-products.json').read_text(encoding='utf-8'))
    opon_v2_back = (root / 'opon-v2-back.js').read_text(encoding='utf-8').replace('__OPON_V2_BACK_ART__',json.dumps(opon_v2_back_art)).replace('__OPON_V2_BACK_SEEDS__',json.dumps(opon_v2_back_seeds))
    opon_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/kazumi-opon-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    opon_v2_front_seeds = json.loads((root / 'template-artwork/kazumi-opon-v2-front-products.json').read_text(encoding='utf-8'))
    opon_v2_front = (root / 'opon-v2-front.js').read_text(encoding='utf-8').replace('__OPON_V2_FRONT_ART__',json.dumps(opon_v2_front_art)).replace('__OPON_V2_FRONT_SEEDS__',json.dumps(opon_v2_front_seeds))
    talisay_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/unico-talisay-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    talisay_v2_back_seeds = json.loads((root / 'template-artwork/unico-talisay-v2-back-products.json').read_text(encoding='utf-8'))
    talisay_v2_back = (root / 'talisay-v2-back.js').read_text(encoding='utf-8').replace('__TALISAY_V2_BACK_ART__',json.dumps(talisay_v2_back_art)).replace('__TALISAY_V2_BACK_SEEDS__',json.dumps(talisay_v2_back_seeds))
    tayud_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-tayud-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    tayud_v2_back_seeds = json.loads((root / 'template-artwork/alkeia-tayud-v2-back-products.json').read_text(encoding='utf-8'))
    tayud_v2_back = (root / 'tayud-v2-back.js').read_text(encoding='utf-8').replace('__TAYUD_V2_BACK_ART__',json.dumps(tayud_v2_back_art)).replace('__TAYUD_V2_BACK_SEEDS__',json.dumps(tayud_v2_back_seeds))
    tayud_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-tayud-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    tayud_v2_front_seeds = json.loads((root / 'template-artwork/alkeia-tayud-v2-front-products.json').read_text(encoding='utf-8'))
    tayud_v2_front = (root / 'tayud-v2-front.js').read_text(encoding='utf-8').replace('__TAYUD_V2_FRONT_ART__',json.dumps(tayud_v2_front_art)).replace('__TAYUD_V2_FRONT_SEEDS__',json.dumps(tayud_v2_front_seeds))
    carcar_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-carcar-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    carcar_v2_back_seeds = json.loads((root / 'template-artwork/weldon-carcar-v2-back-products.json').read_text(encoding='utf-8'))
    carcar_v2_back = (root / 'carcar-v2-back.js').read_text(encoding='utf-8').replace('__CARCAR_V2_BACK_ART__',json.dumps(carcar_v2_back_art)).replace('__CARCAR_V2_BACK_SEEDS__',json.dumps(carcar_v2_back_seeds))
    carcar_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-carcar-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    carcar_v2_front_seeds = json.loads((root / 'template-artwork/weldon-carcar-v2-front-products.json').read_text(encoding='utf-8'))
    carcar_v2_front = (root / 'carcar-v2-front.js').read_text(encoding='utf-8').replace('__CARCAR_V2_FRONT_ART__',json.dumps(carcar_v2_front_art)).replace('__CARCAR_V2_FRONT_SEEDS__',json.dumps(carcar_v2_front_seeds))
    sheldon_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/sheldon-pinamungajan-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    sheldon_v2_back_seeds = json.loads((root / 'template-artwork/sheldon-pinamungajan-v2-back-products.json').read_text(encoding='utf-8'))
    sheldon_v2_back = (root / 'sheldon-v2-back.js').read_text(encoding='utf-8').replace('__SHELDON_V2_BACK_ART__',json.dumps(sheldon_v2_back_art)).replace('__SHELDON_V2_BACK_SEEDS__',json.dumps(sheldon_v2_back_seeds))
    sheldon_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/sheldon-pinamungajan-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    sheldon_v2_front_seeds = json.loads((root / 'template-artwork/sheldon-pinamungajan-v2-front-products.json').read_text(encoding='utf-8'))
    sheldon_v2_front = (root / 'sheldon-v2-front.js').read_text(encoding='utf-8').replace('__SHELDON_V2_FRONT_ART__',json.dumps(sheldon_v2_front_art)).replace('__SHELDON_V2_FRONT_SEEDS__',json.dumps(sheldon_v2_front_seeds))
    alpha_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alpha-dumanjug-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    alpha_v2_back_seeds = json.loads((root / 'template-artwork/alpha-dumanjug-v2-back-products.json').read_text(encoding='utf-8'))
    alpha_v2_back = (root / 'alpha-v2-back.js').read_text(encoding='utf-8').replace('__ALPHA_V2_BACK_ART__',json.dumps(alpha_v2_back_art)).replace('__ALPHA_V2_BACK_SEEDS__',json.dumps(alpha_v2_back_seeds))
    alpha_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alpha-dumanjug-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    alpha_v2_front_seeds = json.loads((root / 'template-artwork/alpha-dumanjug-v2-front-products.json').read_text(encoding='utf-8'))
    alpha_v2_front = (root / 'alpha-v2-front.js').read_text(encoding='utf-8').replace('__ALPHA_V2_FRONT_ART__',json.dumps(alpha_v2_front_art)).replace('__ALPHA_V2_FRONT_SEEDS__',json.dumps(alpha_v2_front_seeds))
    atomi_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/atomi-lutopan-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    atomi_v2_back_seeds = json.loads((root / 'template-artwork/atomi-lutopan-v2-back-products.json').read_text(encoding='utf-8'))
    atomi_v2_back = (root / 'atomi-v2-back.js').read_text(encoding='utf-8').replace('__ATOMI_V2_BACK_ART__',json.dumps(atomi_v2_back_art)).replace('__ATOMI_V2_BACK_SEEDS__',json.dumps(atomi_v2_back_seeds))
    atomi_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/atomi-lutopan-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    atomi_v2_front_seeds = json.loads((root / 'template-artwork/atomi-lutopan-v2-front-products.json').read_text(encoding='utf-8'))
    atomi_v2_front = (root / 'atomi-v2-front.js').read_text(encoding='utf-8').replace('__ATOMI_V2_FRONT_ART__',json.dumps(atomi_v2_front_art)).replace('__ATOMI_V2_FRONT_SEEDS__',json.dumps(atomi_v2_front_seeds))
    bogo_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-bogo-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    bogo_v2_back_seeds = json.loads((root / 'template-artwork/weldon-bogo-v2-back-products.json').read_text(encoding='utf-8'))
    bogo_v2_back = (root / 'bogo-v2-back.js').read_text(encoding='utf-8').replace('__BOGO_V2_BACK_ART__',json.dumps(bogo_v2_back_art)).replace('__BOGO_V2_BACK_SEEDS__',json.dumps(bogo_v2_back_seeds))
    bogo_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/weldon-bogo-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    bogo_v2_front_seeds = json.loads((root / 'template-artwork/weldon-bogo-v2-front-products.json').read_text(encoding='utf-8'))
    bogo_v2_front = (root / 'bogo-v2-front.js').read_text(encoding='utf-8').replace('__BOGO_V2_FRONT_ART__',json.dumps(bogo_v2_front_art)).replace('__BOGO_V2_FRONT_SEEDS__',json.dumps(bogo_v2_front_seeds))
    albal_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-balamban-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    albal_v2_back_seeds = json.loads((root / 'template-artwork/alkeia-balamban-v2-back-products.json').read_text(encoding='utf-8'))
    albal_v2_back = (root / 'albal-v2-back.js').read_text(encoding='utf-8').replace('__ALBAL_V2_BACK_ART__',json.dumps(albal_v2_back_art)).replace('__ALBAL_V2_BACK_SEEDS__',json.dumps(albal_v2_back_seeds))
    albal_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/alkeia-balamban-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    albal_v2_front_seeds = json.loads((root / 'template-artwork/alkeia-balamban-v2-front-products.json').read_text(encoding='utf-8'))
    albal_v2_front = (root / 'albal-v2-front.js').read_text(encoding='utf-8').replace('__ALBAL_V2_FRONT_ART__',json.dumps(albal_v2_front_art)).replace('__ALBAL_V2_FRONT_SEEDS__',json.dumps(albal_v2_front_seeds))
    sibonga_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-sibonga-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    sibonga_v2_front_seeds = json.loads((root / 'template-artwork/ginsey-sibonga-v2-front-products.json').read_text(encoding='utf-8'))
    sibonga_v2_front = (root / 'sibonga-v2-front.js').read_text(encoding='utf-8').replace('__SIBONGA_V2_FRONT_ART__',json.dumps(sibonga_v2_front_art)).replace('__SIBONGA_V2_FRONT_SEEDS__',json.dumps(sibonga_v2_front_seeds))
    sibonga_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/ginsey-sibonga-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    sibonga_v2_back_seeds = json.loads((root / 'template-artwork/ginsey-sibonga-v2-back-products.json').read_text(encoding='utf-8'))
    sibonga_v2_back = (root / 'sibonga-v2-back.js').read_text(encoding='utf-8').replace('__SIBONGA_V2_BACK_ART__',json.dumps(sibonga_v2_back_art)).replace('__SIBONGA_V2_BACK_SEEDS__',json.dumps(sibonga_v2_back_seeds))
    wester_v2_back_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/wester-talibon-v2-back.jpg').read_bytes()).hexdigest() + '.jpg'
    wester_v2_back_seeds = json.loads((root / 'template-artwork/wester-talibon-v2-back-products.json').read_text(encoding='utf-8'))
    wester_v2_back = (root / 'wester-v2-back.js').read_text(encoding='utf-8').replace('__WESTER_V2_BACK_ART__',json.dumps(wester_v2_back_art)).replace('__WESTER_V2_BACK_SEEDS__',json.dumps(wester_v2_back_seeds))
    wester_v2_front_art = 'defaults/images/' + hashlib.sha256((root / 'template-artwork/wester-talibon-v2-front.jpg').read_bytes()).hexdigest() + '.jpg'
    wester_v2_front_seeds = json.loads((root / 'template-artwork/wester-talibon-v2-front-products.json').read_text(encoding='utf-8'))
    wester_v2_front = (root / 'wester-v2-front.js').read_text(encoding='utf-8').replace('__WESTER_V2_FRONT_ART__',json.dumps(wester_v2_front_art)).replace('__WESTER_V2_FRONT_SEEDS__',json.dumps(wester_v2_front_seeds))
    version_logic = (root / 'template-versions.js').read_text(encoding='utf-8')
    return back + "\n" + front + "\n" + peso + "\n" + peso_back + "\n" + alkeia + "\n" + alkeia_back + "\n" + felcon + "\n" + felcon_front + "\n" + ginsey + "\n" + ginsey_back + "\n" + welmart + "\n" + welmart_back + "\n" + tayud + "\n" + tayud_back + "\n" + kazumi + "\n" + kazumi_back + "\n" + oneplus + "\n" + oneplus_back + "\n" + weldon + "\n" + weldon_back + "\n" + sheldon + "\n" + sheldon_back + "\n" + mandarin + "\n" + mandarin_back + "\n" + dalaguete + "\n" + dalaguete_back + "\n" + bestco_back + "\n" + bestco + "\n" + sibonga + "\n" + sibonga_back + "\n" + unico + "\n" + unico_back + "\n" + alkeia_v2 + "\n" + front_v2 + "\n" + home_v2 + "\n" + home_v2_back + "\n" + bestco_v2_front + "\n" + bestco_v2_back + "\n" + ginsey_v2_front + "\n" + welmart_v2_front + "\n" + welmart_v2_back + "\n" + unico_v2_front + "\n" + ginsey_v2_back + "\n" + oneplus_v2_front + "\n" + oneplus_v2_back + "\n" + kazumi_v2_front + "\n" + kazumi_v2_back + "\n" + tisa_v2_back + "\n" + tisa_v2_front + "\n" + ubest_v2_back + "\n" + ubest_v2_front + "\n" + peso_v2_front + "\n" + peso_v2_back + "\n" + babag_v2_front + "\n" + babag_v2_back + "\n" + carmen_v2_back + "\n" + carmen_v2_front + "\n" + pinam_v2_front + "\n" + pinam_v2_back + "\n" + danao_v2_back + "\n" + danao_v2_front + "\n" + balamban_v2_back + "\n" + balamban_v2_front + "\n" + catmon_v2_back + "\n" + catmon_v2_front + "\n" + opon_v2_back + "\n" + opon_v2_front + "\n" + talisay_v2_back + "\n" + tayud_v2_back + "\n" + tayud_v2_front + "\n" + carcar_v2_back + "\n" + carcar_v2_front + "\n" + sheldon_v2_back + "\n" + sheldon_v2_front + "\n" + alpha_v2_back + "\n" + alpha_v2_front + "\n" + atomi_v2_back + "\n" + atomi_v2_front + "\n" + bogo_v2_back + "\n" + bogo_v2_front + "\n" + albal_v2_back + "\n" + albal_v2_front + "\n" + sibonga_v2_front + "\n" + sibonga_v2_back + "\n" + wester_v2_back + "\n" + wester_v2_front + "\n" + version_logic


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
