"""
Tag definitions for seeding.

Each dict becomes one Tag row.
`category` must be "cuisine" or "dietary".
`name` is stored lowercase and must be unique.

Add any cuisine or dietary tags you need for your recipes.
"""

TAGS = [
    # ── Cuisine tags ──────────────────────────────────────────────────────────
    {"name": "italian",        "category": "cuisine"},
    {"name": "mexican",        "category": "cuisine"},
    {"name": "japanese",       "category": "cuisine"},
    {"name": "american",       "category": "cuisine"},
    {"name": "mediterranean",  "category": "cuisine"},
    {"name": "french",         "category": "cuisine"},
    {"name": "indian",         "category": "cuisine"},
    {"name": "thai",           "category": "cuisine"},
    {"name": "korean",         "category": "cuisine"},
    {"name": "chinese",        "category": "cuisine"},
    {"name": "middle eastern", "category": "cuisine"},
    {"name": "vietnamese",     "category": "cuisine"},

    # ── Dietary tags ──────────────────────────────────────────────────────────
    {"name": "vegan",          "category": "dietary"},
    {"name": "vegetarian",     "category": "dietary"},
    {"name": "gluten-free",    "category": "dietary"},
    {"name": "dairy-free",     "category": "dietary"},
]
