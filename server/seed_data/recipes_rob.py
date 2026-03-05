"""
Rob's own original recipes.

source_type should be "original" for recipes you created yourself.

Recipe dict schema:
  author          str   must match a username in users.py
  title           str
  description     str   short post caption shown on feed cards
  cook_time_minutes int
  servings        int
  difficulty      str   "easy" | "medium" | "hard"
  self_rating     int   1–5
  source_type     str   "original" | "credit" | "external"
  source_url      str | None   (external recipes only)
  source_credit   str | None   e.g. "Samin Nosrat, Salt Fat Acid Heat" (credit recipes)
  image_url       str | None
  tags            list  tag names from tags.py
  ingredients     list of {"quantity": str, "unit": str, "name": str}
                         quantity and unit can be "" if not applicable
  steps           list of str  (one string per step)
"""

RECIPES = [
    # Paste your formatted recipe dicts here. Example shape:
    # {
    #     "author": "rob",
    #     "title": "My Favourite Chili",
    #     "description": "Sunday chili that gets better the next day.",
    #     "cook_time_minutes": 90,
    #     "servings": 6,
    #     "difficulty": "medium",
    #     "self_rating": 5,
    #     "source_type": "original",
    #     "source_url": None,
    #     "source_credit": None,
    #     "image_url": None,
    #     "tags": ["american"],
    #     "ingredients": [
    #         {"quantity": "2", "unit": "lbs", "name": "ground beef"},
    #         {"quantity": "1", "unit": "can", "name": "crushed tomatoes"},
    #     ],
    #     "steps": [
    #         "Brown the beef over medium-high heat.",
    #         "Add tomatoes and spices, simmer 1 hour.",
    #     ],
    # },
]
