import re

from flask import Blueprint, request, jsonify

parse_bp = Blueprint("parse", __name__, url_prefix="/api/parse")

# Common units for ingredient splitting
_UNITS = [
    "tablespoons", "tablespoon", "teaspoons", "teaspoon",
    "cups", "cup", "ounces", "ounce", "pounds", "pound",
    "liters", "liter", "milliliters", "milliliter",
    "cloves", "clove", "slices", "slice", "pinches", "pinch",
    "tbsp", "tsp", "oz", "lb", "kg", "g", "ml", "l",
    "quarts", "quart", "pints", "pint", "gallons", "gallon",
    "sticks", "stick", "cans", "can", "packages", "package",
    "bunch", "bunches", "heads", "head", "sprigs", "sprig",
    "strips", "strip", "pieces", "piece",
    "large", "medium", "small",
]
# Sort longest first so "tablespoons" matches before "tablespoon", etc.
_UNITS_SORTED = sorted(_UNITS, key=len, reverse=True)
_UNIT_PATTERN = "|".join(re.escape(u) for u in _UNITS_SORTED)

# Match: optional leading number → optional unit → rest
_INGREDIENT_RE = re.compile(
    r"^([\d\s\u2009\u00bc\u00bd\u00be\u2153-\u215e\/\.\-]+)?"  # quantity (digits, fractions, slashes)
    r"\s*(" + _UNIT_PATTERN + r")?"
    r"\.?\s*(.+)$",
    re.IGNORECASE,
)


def _parse_ingredient(raw: str) -> dict:
    """Split 'raw' into {quantity, unit, name}. Falls back to {name: raw}."""
    s = raw.strip()
    m = _INGREDIENT_RE.match(s)
    if m:
        qty = (m.group(1) or "").strip() or None
        unit = (m.group(2) or "").strip().lower() or None
        name = (m.group(3) or "").strip() or s
        return {"quantity": qty, "unit": unit, "name": name}
    return {"quantity": None, "unit": None, "name": s}


@parse_bp.post("/recipe")
def parse_recipe():
    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"error": "url is required", "message": "Failed"}), 400

    try:
        import ssl as _ssl
        # Bypass SSL verification on macOS dev machines without system certs installed
        try:
            _ssl._create_default_https_context = _ssl._create_unverified_context  # noqa: SLF001
        except AttributeError:
            pass

        from recipe_scrapers import scrape_me
        scraper = scrape_me(url)

        raw_ingredients = []
        try:
            raw_ingredients = scraper.ingredients() or []
        except Exception:
            pass

        instructions = []
        try:
            instructions = scraper.instructions_list() or []
        except Exception:
            try:
                instructions = [scraper.instructions()] if scraper.instructions() else []
            except Exception:
                pass

        cook_time = None
        try:
            cook_time = scraper.total_time()
        except Exception:
            pass

        servings = None
        try:
            servings = scraper.yields()
        except Exception:
            pass

        image_url = None
        try:
            image_url = scraper.image()
        except Exception:
            pass

        title = ""
        try:
            title = scraper.title() or ""
        except Exception:
            pass

        parsed_ingredients = [_parse_ingredient(i) for i in raw_ingredients]

        return jsonify({
            "data": {
                "title": title,
                "ingredients": parsed_ingredients,
                "instructions": instructions,
                "cook_time": cook_time,
                "servings": servings,
                "image_url": image_url,
            },
            "message": "Success",
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Could not parse recipe from that URL. Try pasting ingredients manually.",
            "message": "Failed",
            "detail": str(e),
        }), 422
