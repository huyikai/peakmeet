#!/usr/bin/env python3
"""Generate repository-owned, copyright-safe equipment/food cover illustrations.

Action media comes from database/vendor/exercises-dataset under the temporary
Gym visual exception and must NOT be regenerated here. This script only maintains
first-party equipment/food PNGs under database/assets/content/.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "database" / "catalog"
OUT = ROOT / "database" / "assets" / "content"

INK = "#0B0D10"
ORANGE = "#FF5A1F"
SNOW = "#F2F4F7"
WHITE = "#FFFFFF"
MUTED = "#A8ADB5"

WIDTH, HEIGHT = 640, 400


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size, index=1 if bold else 0)
    return ImageFont.load_default()


TITLE_FONT = font(46, bold=True)
META_FONT = font(22)
ID_FONT = font(16)


def seed_int(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)


def canvas(doc_id: str, label: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), SNOW)
    draw = ImageDraw.Draw(image)
    seed = seed_int(doc_id)

    # Brand-aligned frame and per-item geometric texture.
    draw.rounded_rectangle((18, 18, WIDTH - 18, HEIGHT - 18), 32, fill=INK)
    for i in range(5):
        x = 330 + ((seed >> (i * 4)) & 0x7F)
        y = 42 + ((seed >> (i * 3 + 2)) & 0x7F)
        r = 18 + ((seed >> (i * 5 + 1)) & 0x1F)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(28, 31, 36))

    draw.rounded_rectangle((38, 38, 278, 362), 24, fill=WHITE)
    draw.rectangle((18, HEIGHT - 24, WIDTH - 18, HEIGHT - 18), fill=ORANGE)
    draw.text((314, 48), label, font=META_FONT, fill=ORANGE)
    return image, draw


def fit_title(draw: ImageDraw.ImageDraw, text: str) -> ImageFont.FreeTypeFont:
    for size in (46, 42, 38, 34, 30):
        candidate = font(size, bold=True)
        box = draw.textbbox((0, 0), text, font=candidate)
        if box[2] - box[0] <= 285:
            return candidate
    return font(28, bold=True)


def footer(draw: ImageDraw.ImageDraw, doc: dict, meta: str) -> None:
    draw.text((314, 118), doc["name"], font=fit_title(draw, doc["name"]), fill=SNOW)
    draw.text((314, 190), meta, font=META_FONT, fill=MUTED)
    draw.text((314, 330), doc["_id"], font=ID_FONT, fill="#6C727C")


def line(draw: ImageDraw.ImageDraw, points, fill=INK, width=12) -> None:
    draw.line(points, fill=fill, width=width, joint="curve")


def draw_action(draw: ImageDraw.ImageDraw, doc: dict) -> None:
    raise RuntimeError("Action covers are provided by vendor media; do not generate them")


def draw_equipment(draw: ImageDraw.ImageDraw, doc: dict) -> None:
    kind = doc.get("type", "accessory")
    if kind == "free_weight":
        line(draw, [(72, 210), (244, 210)], width=14)
        for x in (82, 102, 214, 234):
            draw.rounded_rectangle((x - 10, 160, x + 10, 260), 8, fill=ORANGE)
    elif kind == "machine":
        line(draw, [(84, 294), (84, 105), (226, 105), (226, 294)], width=12)
        draw.rounded_rectangle((107, 206, 205, 252), 12, fill=ORANGE)
        line(draw, [(156, 206), (156, 132)], width=9)
    elif kind == "cardio":
        draw.ellipse((82, 142, 226, 286), outline=INK, width=13)
        draw.ellipse((134, 194, 174, 234), fill=ORANGE)
        line(draw, [(154, 194), (208, 120), (238, 120)], width=10)
    else:
        draw.arc((76, 126, 236, 286), 35, 325, fill=ORANGE, width=18)
        draw.ellipse((63, 200, 97, 234), fill=INK)
        draw.ellipse((215, 200, 249, 234), fill=INK)

    draw.text((72, 317), doc.get("type", "equipment"), font=ID_FONT, fill=INK)


FOOD_COLORS = {
    "staple": ("#E9B872", "#FFF2D8"),
    "protein": ("#D95D39", "#FFE3D8"),
    "veg": ("#5A9A62", "#DDF2DF"),
    "fruit": ("#F08A5D", "#FFE0D3"),
    "dairy": ("#79A9D1", "#E1F0FF"),
    "snack": ("#9A6B45", "#F1E0D0"),
}


def draw_food(draw: ImageDraw.ImageDraw, doc: dict) -> None:
    category = doc.get("category", "snack")
    main, pale = FOOD_COLORS.get(category, FOOD_COLORS["snack"])
    seed = seed_int(doc["_id"])
    draw.ellipse((62, 105, 254, 297), fill=pale, outline=INK, width=8)
    draw.ellipse((88, 131, 228, 271), fill=WHITE)

    # Item-specific serving pieces.
    count = 3 + seed % 5
    for i in range(count):
        angle = (2 * math.pi * i / count) + (seed % 10) / 10
        x = 158 + int(math.cos(angle) * (32 + seed % 16))
        y = 201 + int(math.sin(angle) * (30 + (seed >> 3) % 16))
        radius = 15 + ((seed >> (i + 2)) % 12)
        if category in ("veg", "fruit"):
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=main)
            draw.line((x, y - radius, x + 8, y - radius - 12), fill="#477A4A", width=4)
        elif category == "staple":
            draw.rounded_rectangle(
                (x - radius, y - radius // 2, x + radius, y + radius // 2),
                8,
                fill=main,
            )
        else:
            draw.polygon(
                [(x, y - radius), (x + radius, y + radius), (x - radius, y + radius)],
                fill=main,
            )
    draw.text((72, 317), category, font=ID_FONT, fill=INK)


def generate_collection(name: str) -> list[dict]:
    source = CATALOG / f"{name}.json"
    if not source.exists():
        raise RuntimeError(f"Missing catalog file: {source}")
    docs = json.loads(source.read_text(encoding="utf-8"))
    target = OUT / name
    target.mkdir(parents=True, exist_ok=True)
    manifest: list[dict] = []

    for doc in docs:
        if name == "equipment" and not doc.get("cover"):
            # New equipment catalog may omit first-party covers; generate PNGs for sync.
            pass
        image, draw = canvas(doc["_id"], {"equipment": "器材", "foods": "食物"}[name])
        if name == "equipment":
            draw_equipment(draw, doc)
            meta = f'{doc["type"]} · {doc["primaryScene"]}'
        else:
            draw_food(draw, doc)
            meta = f'{doc["category"]} · 每100g {doc["per100g"]["kcal"]} kcal'
        footer(draw, doc, meta)

        path = target / f'{doc["_id"]}.png'
        image.save(path, "PNG", optimize=True)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        manifest.append(
            {
                "collection": name,
                "id": doc["_id"],
                "source": path.relative_to(ROOT).as_posix(),
                "cloudPath": f'content/{name}/{doc["_id"]}.png',
                "assetUri": f'asset://content/{name}/{doc["_id"]}.png',
                "sha256": digest,
            }
        )
    return manifest


def main() -> None:
    all_entries: list[dict] = []
    # Actions are vendor-owned; only regenerate first-party equipment/foods.
    expected = {"equipment": 27, "foods": 200}
    for collection, count in expected.items():
        entries = generate_collection(collection)
        if len(entries) != count:
            raise RuntimeError(f"{collection}: expected {count}, got {len(entries)}")
        all_entries.extend(entries)
        print(f"generated {collection}: {len(entries)}")

    print(
        "first-party covers generated; run `pnpm db:build-manifest` to refresh the combined manifest"
    )
    print(f"local entries prepared: {len(all_entries)}")


if __name__ == "__main__":
    main()
