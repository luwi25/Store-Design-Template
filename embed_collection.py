"""Embed the additional Home Express artwork for local and Pages builds."""
import base64
import json
from pathlib import Path


def collection_source(root: Path) -> str:
    def data_url(path, mime):
        return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")

    artwork = data_url(root / "template-artwork/home-express-collection.png", "image/png")
    products = json.loads((root / "template-artwork/home-express-collection-products.json").read_text(encoding="utf-8"))
    for product in products:
        marker = product["image"]
        product["image"] = data_url(root / "defaults" / marker["__defaultImage"], marker["mime"])
    back = (root / "home-express-collection.js").read_text(encoding="utf-8").replace(
        "__HOME_COLLECTION_ART__", json.dumps(artwork)
    ).replace("__HOME_COLLECTION_SEEDS__", json.dumps(products, ensure_ascii=False))
    front_artwork = data_url(root / "template-artwork/home-express-collection-front.jpg", "image/jpeg")
    front_products = json.loads((root / "template-artwork/home-express-collection-front-products.json").read_text(encoding="utf-8"))
    for product in front_products:
        marker = product["image"]
        product["image"] = data_url(root / "defaults" / marker["__defaultImage"], marker["mime"])
    front = (root / "home-express-collection-front.js").read_text(encoding="utf-8").replace(
        "__HOME_COLLECTION_FRONT_ART__", json.dumps(front_artwork)
    ).replace("__HOME_COLLECTION_FRONT_SEEDS__", json.dumps(front_products, ensure_ascii=False))
    peso_artwork = data_url(root / "template-artwork/pesoplus-collection-front.jpg", "image/jpeg")
    peso_products = json.loads((root / "template-artwork/pesoplus-collection-front-products.json").read_text(encoding="utf-8"))
    peso = (root / "pesoplus-collection-front.js").read_text(encoding="utf-8").replace(
        "__PESO_COLLECTION_FRONT_ART__", json.dumps(peso_artwork)
    ).replace("__PESO_COLLECTION_FRONT_SEEDS__", json.dumps(peso_products, ensure_ascii=False))
    peso_back_art = data_url(root / "template-artwork/pesoplus-collection-back.png", "image/png")
    peso_back_products = json.loads((root / "template-artwork/pesoplus-collection-back-products.json").read_text(encoding="utf-8"))
    for product in peso_back_products:
        marker = product["image"]
        product["image"] = data_url(root / "defaults" / marker["__defaultImage"], marker["mime"])
    peso_back = (root / "pesoplus-collection-back.js").read_text(encoding="utf-8").replace(
        "__PESO_COLLECTION_BACK_ART__", json.dumps(peso_back_art)
    ).replace("__PESO_COLLECTION_BACK_SEEDS__", json.dumps(peso_back_products, ensure_ascii=False))
    return back + "\n" + front + "\n" + peso + "\n" + peso_back


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
