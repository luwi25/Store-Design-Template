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
    return (root / "home-express-collection.js").read_text(encoding="utf-8").replace(
        "__HOME_COLLECTION_ART__", json.dumps(artwork)
    ).replace("__HOME_COLLECTION_SEEDS__", json.dumps(products, ensure_ascii=False))


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
