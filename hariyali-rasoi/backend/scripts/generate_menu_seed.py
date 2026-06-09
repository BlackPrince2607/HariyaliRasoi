"""Generate menu seed JSON from the Hariyali Rasoi PDF menu."""
from __future__ import annotations

import json
import re
from pathlib import Path

from slugify import slugify

ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = Path(__file__).resolve().parents[1] / "seed" / "menu.json"

CATEGORIES = [
    {"name": "Breakfast", "slug": "breakfast", "display_order": 1},
    {"name": "Evening Snacks & Chaat", "slug": "evening-snacks-chaat", "display_order": 2},
    {"name": "Pakoda & Fried", "slug": "pakoda-fried", "display_order": 3},
    {"name": "Street Food", "slug": "street-food", "display_order": 4},
    {"name": "Sandwich & Rolls", "slug": "sandwich-rolls", "display_order": 5},
    {"name": "Rice", "slug": "rice", "display_order": 6},
    {"name": "Dal & Kadhi", "slug": "dal-kadhi", "display_order": 7},
    {"name": "Veg Curries", "slug": "veg-curries", "display_order": 8},
    {"name": "Paneer Special", "slug": "paneer-special", "display_order": 9},
    {"name": "Mushroom & Soya", "slug": "mushroom-soya", "display_order": 10},
    {"name": "Kofta & Special", "slug": "kofta-special", "display_order": 11},
    {"name": "Rajasthani Special", "slug": "rajasthani-special", "display_order": 12},
    {"name": "Roti & Paratha", "slug": "roti-paratha", "display_order": 13},
    {"name": "Combos", "slug": "combos", "display_order": 14},
    {"name": "Thali", "slug": "thali", "display_order": 15},
    {"name": "Beverages", "slug": "beverages", "display_order": 16},
]

# Parsed from menu/Dark Blue Textured Simple Vintage Manu-1.pdf
MENU_ITEMS: dict[str, list[tuple[str, float]]] = {
    "Breakfast": [
        ("Club Kachori with Aloo Sabzi & Bhujiya (6 pcs)", 80.00),
        ("Sattu Stuffed Kachori with Aloo Sabzi (4 pcs)", 110.00),
        ("Matar Kachori with Aloo Sabzi (4 pcs)", 130.00),
        ("Atta Ajwain Kachori with Aloo Sabzi (5 pcs)", 130.00),
        ("Kanak Poha with Chutney", 110.00),
        ("Upma with Sambar & Chutney", 130.00),
        ("Idli with Sambar & Chutney (2 pcs)", 80.00),
        ("Mini Rawa Idli with Sambar & Chutney", 130.00),
        ("Plain Dosa with Sambar & Chutney", 80.00),
        ("Masala Dosa with Sambar & Chutney", 120.00),
        ("Onion Dosa", 110.00),
        ("Onion Cheese Dosa", 135.00),
        ("Masala Cheese Sandwich Dosa", 155.00),
        ("Onion Uttapam", 120.00),
        ("Mixed Uttapam", 130.00),
        ("Onion Cheese Uttapam", 150.00),
        ("Mixed Cheese Uttapam", 160.00),
        ("Appam with Chutney (8 pcs)", 100.00),
        ("Cheese Appam (8 pcs)", 130.00),
        ("Sabudana Vada with Chutney (6 pcs)", 130.00),
        ("Moong Dal Chilla with Chutney (2 pcs)", 120.00),
        ("Masala Cheese Dosa", 145.00),
        ("Paneer Stuffed Moong Dal Chilla (2 pcs)", 200.00),
    ],
    "Evening Snacks & Chaat": [
        ("Dahi Puchka Chaat", 120.00),
        ("Papdi Chaat", 100.00),
        ("Corn Chaat", 100.00),
        ("Aloo Chaat", 100.00),
        ("Peanut Masala", 120.00),
    ],
    "Pakoda & Fried": [
        ("Onion Pakoda with Chutney (6 pcs)", 120.00),
        ("Moong Dal Bhajiya", 120.00),
        ("Mix Veg Pakoda", 140.00),
        ("Paneer Pakoda", 170.00),
    ],
    "Street Food": [
        ("Pav Bhaji with 2 Pavs", 140.00),
        ("Extra Pav (2 pcs)", 30.00),
        ("Vada Pav (2 pcs)", 130.00),
        ("Cheese Vada Pav (2 pcs)", 160.00),
        ("Extra Cheese Vada Pav (2 pcs)", 160.00),
        ("Chole Bhature (2 pcs)", 170.00),
        ("Extra Bhatura", 35.00),
        ("Chola Kulcha (2 pcs)", 190.00),
        ("Dhokla (6 pcs)", 100.00),
        ("Dahi Cada (4 pcs)", 140.00),
    ],
    "Sandwich & Rolls": [
        ("Vegetable Cheese Sandwich (2 pcs)", 120.00),
        ("Vegetable Corn Sandwich (2 pcs)", 120.00),
        ("Onion Chilli Garlic Cheese Mushroom Sandwich", 140.00),
        ("Vegetable Maggie Sandwich", 170.00),
        ("Bombay Masala Sandwich", 160.00),
        ("Bread Roll (4 pcs)", 120.00),
        ("Bread Cheese Roll (4 pcs)", 160.00),
    ],
    "Rice": [
        ("Plain Rice", 80.00),
        ("Veg Pulao", 170.00),
        ("Jeera Rice", 120.00),
        ("Peas Pulao", 140.00),
    ],
    "Dal & Kadhi": [
        ("Dal Tadka", 150.00),
        ("Dal Makhani", 170.00),
        ("Plain Kadhi", 120.00),
        ("Pyaz Kadhi", 140.00),
        ("Kadhi Pakoda", 150.00),
    ],
    "Veg Curries": [
        ("Aloo Jeera", 135.00),
        ("Aloo Matar", 180.00),
        ("Aloo Dum", 170.00),
        ("Aloo Do Pyaza", 180.00),
        ("Aloo Palak", 150.00),
        ("Baigan Ka Bharta", 180.00),
        ("Mix Vegetable", 200.00),
        ("Panchmel Dal", 180.00),
        ("Amritsari Chole", 180.00),
        ("Rajma Masala", 180.00),
    ],
    "Paneer Special": [
        ("Kadhai Paneer", 230.00),
        ("Paneer Butter Masala", 230.00),
        ("Mattar Paneer", 230.00),
        ("Paneer Do Pyaaza", 230.00),
        ("Palak Paneer Lasuni", 230.00),
    ],
    "Mushroom & Soya": [
        ("Mushroom Masala", 230.00),
        ("Mattar Mushroom Masala", 230.00),
        ("Soya Chaap Masala (Gravy)", 230.00),
        ("Tandoori Soya Chaap", 220.00),
    ],
    "Kofta & Special": [
        ("Vegetable Kofta (4 pcs)", 240.00),
        ("Malai Kofta (4 pcs)", 240.00),
    ],
    "Rajasthani Special": [
        ("Rajasthani Papad Ki Sabji", 230.00),
        ("Rajasthani Gatte Ki Sabzi", 220.00),
        ("Sarson Ka Saag", 220.00),
    ],
    "Roti & Paratha": [
        ("Fulka", 12.00),
        ("Ghee Fulka", 15.00),
        ("Plain Paratha", 25.00),
        ("Methi Paratha", 35.00),
        ("Missi Roti", 35.00),
        ("Makke Di Roti", 45.00),
        ("Bajre Di Roti", 45.00),
        ("Puran Poli (4 pcs)", 120.00),
        ("Thepla (5 pcs)", 125.00),
        ("Aloo Paratha", 60.00),
        ("Sattu Paratha", 70.00),
        ("Onion Paratha", 60.00),
        ("Paneer Paratha", 100.00),
        ("Gobhi Paratha", 70.00),
        ("Chilli Garlic Onion Paratha", 110.00),
        ("Mooli Paratha", 60.00),
        ("Mattar Paratha", 70.00),
        ("Lachha Paratha", 50.00),
        ("Lachha Paratha (Cheese)", 80.00),
    ],
    "Combos": [
        ("Makkai Roti & Sarson Ka Saag (2 pcs)", 280.00),
        ("Bajra Roti & Aloo Mattar & Lasun Chutney", 280.00),
        ("Rajma Chawal", 230.00),
        ("Lachha Paratha & Kadhai Paneer", 230.00),
        ("Lachha Paratha & Amritsari Chole", 210.00),
        ("Dal Makhani & Jeera Rice", 200.00),
        ("Chole & Jeera Rice", 200.00),
        ("Kadhi & Peas Pulao", 200.00),
    ],
    "Thali": [
        ("Mini Thali (Rice + 2 Roti + Dal Fry + Veg Sabzi + Salad)", 160.00),
        ("Methi Paratha Thali (2 Methi Paratha + Kadhi + Aloo Jeera + Sweet + Pickle + Salad)", 200.00),
        ("Veg Executive Thali (2 Ghee Roti + Jeera Rice + Dal Fry + Paneer Sabzi + Veg Sabzi + Curd + Salad + Fryums)", 220.00),
        ("Paratha Wali Thali (4 Plain Paratha + Kadhi + Veg Sabzi + Salad + Pickle + Fryums)", 200.00),
        ("Roti Wali Thali (4 Ghee Roti + Dal Fry + Veg Sabzi + Salad + Fryums)", 160.00),
        ("Hariyali Rasoi Special Thali (Veg Pulao + 2 Plain Paratha + Dal Fry + Paneer Sabzi + Veg Sabzi + Raita + Salad + Papad + Pickle)", 260.00),
        ("Missi Roti Thali (2 Missi Roti + Kadhi + Aloo Jeera + Sweet + Pickle + Salad)", 200.00),
    ],
    "Beverages": [
        ("Sada Shikanji", 50.00),
        ("Salted Lime Soda", 50.00),
        ("Sweet Lassi", 70.00),
        ("Butter Milk", 50.00),
        ("Masala Cold Drink", 50.00),
    ],
}

BESTSELLER_NAMES = {
    "Pav Bhaji with 2 Pavs",
    "Chole Bhature (2 pcs)",
    "Dal Makhani",
    "Paneer Butter Masala",
    "Kadhai Paneer",
    "Hariyali Rasoi Special Thali (Veg Pulao + 2 Plain Paratha + Dal Fry + Paneer Sabzi + Veg Sabzi + Raita + Salad + Papad + Pickle)",
    "Masala Dosa with Sambar & Chutney",
    "Dahi Puchka Chaat",
    "Rajma Chawal",
    "Malai Kofta (4 pcs)",
    "Makkai Roti & Sarson Ka Saag (2 pcs)",
    "Vada Pav (2 pcs)",
}

CATEGORY_TAGS: dict[str, list[str]] = {
    "Breakfast": ["breakfast", "south indian", "dosa", "idli", "kachori", "poha", "morning"],
    "Evening Snacks & Chaat": ["chaat", "snacks", "evening", "street style"],
    "Pakoda & Fried": ["pakoda", "fried", "bhajiya", "fritters", "snacks"],
    "Street Food": ["street food", "pav bhaji", "vada pav", "chole bhature", "kulcha"],
    "Sandwich & Rolls": ["sandwich", "rolls", "bread", "snacks"],
    "Rice": ["rice", "pulao", "jeera rice", "main course"],
    "Dal & Kadhi": ["dal", "kadhi", "lentils", "comfort food"],
    "Veg Curries": ["curry", "sabzi", "vegetable", "main course"],
    "Paneer Special": ["paneer", "curry", "north indian", "main course"],
    "Mushroom & Soya": ["mushroom", "soya chaap", "curry", "protein"],
    "Kofta & Special": ["kofta", "curry", "special"],
    "Rajasthani Special": ["rajasthani", "regional", "gatte", "papad", "sarson"],
    "Roti & Paratha": ["roti", "paratha", "bread", "indian bread"],
    "Combos": ["combo", "meal", "thali style", "complete meal"],
    "Thali": ["thali", "complete meal", "platter", "combo"],
    "Beverages": ["drinks", "beverages", "lassi", "shikanji", "refreshing"],
}


def _item_tags(name: str, category: str) -> list[str]:
    tags = set(CATEGORY_TAGS.get(category, []))
    words = re.findall(r"[a-zA-Z]+", name.lower())
    tags.update(w for w in words if len(w) > 2)
    if "paneer" in name.lower():
        tags.add("paneer")
    if "cheese" in name.lower():
        tags.add("cheese")
    if "dosa" in name.lower():
        tags.add("dosa")
    if "paratha" in name.lower() or "roti" in name.lower():
        tags.update(["roti", "paratha"])
    if "thali" in name.lower():
        tags.add("thali")
    if "chaat" in name.lower() or "puchka" in name.lower():
        tags.add("chaat")
    return sorted(tags)


def _description(name: str, category: str, price: float) -> str:
    return (
        f"Homestyle {name} from Hariyali Rasoi's {category} selection. "
        f"Freshly prepared vegetarian fare, served with care. ₹{price:.0f}."
    )


def _unique_slug(name: str, used: set[str]) -> str:
    base = slugify(name)
    if base not in used:
        used.add(base)
        return base
    i = 2
    while f"{base}-{i}" in used:
        i += 1
    slug = f"{base}-{i}"
    used.add(slug)
    return slug


def build_seed() -> dict:
    used_slugs: set[str] = set()
    items = []
    for category in CATEGORIES:
        cat_name = category["name"]
        for order, (name, price) in enumerate(MENU_ITEMS.get(cat_name, []), start=1):
            items.append(
                {
                    "name": name,
                    "slug": _unique_slug(name, used_slugs),
                    "category_slug": category["slug"],
                    "description": _description(name, cat_name, price),
                    "price": price,
                    "tags": _item_tags(name, cat_name),
                    "is_veg": True,
                    "is_available": True,
                    "is_out_of_stock": False,
                    "is_bestseller": name in BESTSELLER_NAMES,
                    "is_new": False,
                    "is_todays_special": False,
                    "preparation_time": 30,
                    "display_order": order,
                }
            )
    return {"categories": CATEGORIES, "items": items}


def main() -> None:
    seed = build_seed()
    SEED_PATH.parent.mkdir(parents=True, exist_ok=True)
    SEED_PATH.write_text(json.dumps(seed, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(seed['items'])} items across {len(seed['categories'])} categories to {SEED_PATH}")


if __name__ == "__main__":
    main()
