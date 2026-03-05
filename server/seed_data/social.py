"""
Social graph: follows, box saves, and comments.

MUTUAL_FOLLOWS: every username listed here follows every other username listed.
FOLLOWS:        additional one-way or asymmetric follow pairs.
BOX_SAVES:      (username, box_type_or_name, recipe_title) tuples.
COMMENTS:       {"author": username, "post_title": recipe_title, "body": str} dicts.
"""

# Every user in this list follows every other user in the list.
MUTUAL_FOLLOWS = [
    "cookbook",
    "rob",
    "masha",
    "sonia",
    "mike_sahl",
    "julianne",
    "rachel_and_mike",
    "zach",
    "keith",
    "gtr",
    "carolyn",
    "jocelyn",
    "cody",
    "beth",
]

# Any additional asymmetric follows beyond the mutual group above.
FOLLOWS = []

BOX_SAVES = [

    # ── rob ───────────────────────────────────────────────────────────────────
    ("rob", "cooked",          "Sonia's Butter Chicken"),
    ("rob", "cooked",          "Lasagna with Big Sauce"),
    ("rob", "cooked",          "Geoff's Dank Guac"),
    ("rob", "cooked",          "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("rob", "cooked",          "3-Ingredient Stovetop Mac and Cheese"),
    ("rob", "cooked",          "Salmon Roasted in Butter"),
    ("rob", "cooked",          "Zach's Peanut Noodles"),
    ("rob", "cooked",          "Sticky Pomegranate & Black Pepper Chicken Wings"),
    ("rob", "liked",           "Jelly Almond Cookies"),
    ("rob", "liked",           "Mike's Marvelous Mai Tai"),
    ("rob", "liked",           "Special K Bars"),
    ("rob", "liked",           "Keith's Kranberry Relish"),
    ("rob", "liked",           "Masha's Everything Salad"),
    ("rob", "liked",           "Sweet Potato Crunch Casserole"),
    ("rob", "want_to_try",     "Pressure Cooker Corn Risotto"),
    ("rob", "want_to_try",     "Salmon Burgers with Rémoulade and Fennel Slaw"),
    ("rob", "want_to_try",     "Upside-Down Peach Mochi Cake"),
    ("rob", "want_to_try",     "French Onion Soup-fflé"),
    ("rob", "sunday projects", "Pressure Cooker Corn Risotto"),
    ("rob", "sunday projects", "French Onion Soup-fflé"),

    # ── masha ─────────────────────────────────────────────────────────────────
    ("masha", "cooked",      "3-Ingredient Stovetop Mac and Cheese"),
    ("masha", "cooked",      "Lasagna with Big Sauce"),
    ("masha", "cooked",      "Spinach and Feta Cooked Like Saag Paneer"),
    ("masha", "liked",       "Jelly Almond Cookies"),
    ("masha", "liked",       "Classy Bitch Cocktail"),
    ("masha", "liked",       "Geoff's Dank Guac"),
    ("masha", "liked",       "Keith's Kranberry Relish"),
    ("masha", "liked",       "Zach's Peanut Noodles"),
    ("masha", "want_to_try", "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("masha", "want_to_try", "Salmon Roasted in Butter"),
    ("masha", "want_to_try", "5-Minute Miso-Glazed Toaster Oven Salmon"),
    ("masha", "want_to_try", "Sticky Pomegranate & Black Pepper Chicken Wings"),

    # ── sonia ─────────────────────────────────────────────────────────────────
    ("sonia", "cooked",      "Lasagna with Big Sauce"),
    ("sonia", "cooked",      "Spinach and Feta Cooked Like Saag Paneer"),
    ("sonia", "liked",       "15-Minute Creamy Tomato Soup"),
    ("sonia", "liked",       "Geoff's Dank Guac"),
    ("sonia", "liked",       "Vietnamese Tomato Salad"),
    ("sonia", "liked",       "Masha's Everything Salad"),
    ("sonia", "want_to_try", "French Onion Soup-fflé"),
    ("sonia", "want_to_try", "Salmon Burgers with Rémoulade and Fennel Slaw"),
    ("sonia", "want_to_try", "Upside-Down Peach Mochi Cake"),

    # ── mike_sahl ─────────────────────────────────────────────────────────────
    ("mike_sahl", "cooked",      "Geoff's Dank Guac"),
    ("mike_sahl", "cooked",      "Zach's Peanut Noodles"),
    ("mike_sahl", "liked",       "Jelly Almond Cookies"),
    ("mike_sahl", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("mike_sahl", "liked",       "Sonia's Butter Chicken"),
    ("mike_sahl", "liked",       "Special K Bars"),
    ("mike_sahl", "want_to_try", "Sticky Pomegranate & Black Pepper Chicken Wings"),
    ("mike_sahl", "want_to_try", "Salmon Roasted in Butter"),
    ("mike_sahl", "want_to_try", "Pressure Cooker Corn Risotto"),

    # ── julianne ──────────────────────────────────────────────────────────────
    ("julianne", "cooked",      "Zach's Peanut Noodles"),
    ("julianne", "cooked",      "3-Ingredient Stovetop Mac and Cheese"),
    ("julianne", "liked",       "Masha's Everything Salad"),
    ("julianne", "liked",       "Sonia's Butter Chicken"),
    ("julianne", "liked",       "Sweet Potato Crunch Casserole"),
    ("julianne", "want_to_try", "Pressure Cooker Corn Risotto"),
    ("julianne", "want_to_try", "Vietnamese Tomato Salad"),
    ("julianne", "want_to_try", "Upside-Down Peach Mochi Cake"),

    # ── rachel_and_mike ───────────────────────────────────────────────────────
    ("rachel_and_mike", "cooked",      "Special K Bars"),
    ("rachel_and_mike", "cooked",      "Geoff's Dank Guac"),
    ("rachel_and_mike", "cooked",      "Keith's Kranberry Relish"),
    ("rachel_and_mike", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("rachel_and_mike", "liked",       "Sonia's Butter Chicken"),
    ("rachel_and_mike", "liked",       "15-Minute Creamy Tomato Soup"),
    ("rachel_and_mike", "want_to_try", "Salmon Burgers with Rémoulade and Fennel Slaw"),
    ("rachel_and_mike", "want_to_try", "Pressure Cooker Corn Risotto"),
    ("rachel_and_mike", "want_to_try", "Vietnamese Tomato Salad"),

    # ── zach ──────────────────────────────────────────────────────────────────
    ("zach", "cooked",      "Geoff's Dank Guac"),
    ("zach", "cooked",      "3-Ingredient Stovetop Mac and Cheese"),
    ("zach", "liked",       "Mike's Marvelous Mai Tai"),
    ("zach", "liked",       "Classy Bitch Cocktail"),
    ("zach", "liked",       "Lasagna with Big Sauce"),
    ("zach", "want_to_try", "Sonia's Butter Chicken"),
    ("zach", "want_to_try", "Pressure Cooker Corn Risotto"),
    ("zach", "want_to_try", "French Onion Soup-fflé"),

    # ── keith ─────────────────────────────────────────────────────────────────
    ("keith", "cooked",      "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("keith", "cooked",      "Sweet Potato Crunch Casserole"),
    ("keith", "liked",       "Lasagna with Big Sauce"),
    ("keith", "liked",       "Sonia's Butter Chicken"),
    ("keith", "liked",       "Zach's Peanut Noodles"),
    ("keith", "want_to_try", "Salmon Roasted in Butter"),
    ("keith", "want_to_try", "5-Minute Miso-Glazed Toaster Oven Salmon"),
    ("keith", "want_to_try", "Sticky Pomegranate & Black Pepper Chicken Wings"),

    # ── gtr ───────────────────────────────────────────────────────────────────
    ("gtr", "cooked",      "Sonia's Butter Chicken"),
    ("gtr", "cooked",      "Lasagna with Big Sauce"),
    ("gtr", "liked",       "Mike's Marvelous Mai Tai"),
    ("gtr", "liked",       "Classy Bitch Cocktail"),
    ("gtr", "liked",       "Masha's Delicious Smoothie"),
    ("gtr", "liked",       "Special K Bars"),
    ("gtr", "want_to_try", "French Onion Soup-fflé"),
    ("gtr", "want_to_try", "Upside-Down Peach Mochi Cake"),

    # ── carolyn ───────────────────────────────────────────────────────────────
    ("carolyn", "cooked",      "Jelly Almond Cookies"),
    ("carolyn", "cooked",      "Keith's Kranberry Relish"),
    ("carolyn", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("carolyn", "liked",       "Sonia's Butter Chicken"),
    ("carolyn", "liked",       "Geoff's Dank Guac"),
    ("carolyn", "want_to_try", "Salmon Roasted in Butter"),
    ("carolyn", "want_to_try", "Vietnamese Tomato Salad"),
    ("carolyn", "want_to_try", "Pressure Cooker Corn Risotto"),

    # ── jocelyn ───────────────────────────────────────────────────────────────
    ("jocelyn", "cooked",      "Mike's Marvelous Mai Tai"),
    ("jocelyn", "cooked",      "Geoff's Dank Guac"),
    ("jocelyn", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("jocelyn", "liked",       "Sonia's Butter Chicken"),
    ("jocelyn", "liked",       "Zach's Peanut Noodles"),
    ("jocelyn", "want_to_try", "Upside-Down Peach Mochi Cake"),
    ("jocelyn", "want_to_try", "Spinach and Feta Cooked Like Saag Paneer"),
    ("jocelyn", "want_to_try", "Vietnamese Tomato Salad"),

    # ── cody ──────────────────────────────────────────────────────────────────
    ("cody", "cooked",      "Geoff's Dank Guac"),
    ("cody", "cooked",      "Jelly Almond Cookies"),
    ("cody", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("cody", "liked",       "Lasagna with Big Sauce"),
    ("cody", "liked",       "Mike's Marvelous Mai Tai"),
    ("cody", "liked",       "Keith's Kranberry Relish"),
    ("cody", "want_to_try", "Sonia's Butter Chicken"),
    ("cody", "want_to_try", "Salmon Roasted in Butter"),
    ("cody", "want_to_try", "Sticky Pomegranate & Black Pepper Chicken Wings"),

    # ── beth ──────────────────────────────────────────────────────────────────
    ("beth", "cooked",      "Zach's Peanut Noodles"),
    ("beth", "cooked",      "3-Ingredient Stovetop Mac and Cheese"),
    ("beth", "liked",       "Sweet Potato Chorizo Chili with Poblano-Avocado Crema"),
    ("beth", "liked",       "Sonia's Butter Chicken"),
    ("beth", "liked",       "Special K Bars"),
    ("beth", "liked",       "Masha's Everything Salad"),
    ("beth", "want_to_try", "Pressure Cooker Corn Risotto"),
    ("beth", "want_to_try", "Salmon Burgers with Rémoulade and Fennel Slaw"),
    ("beth", "want_to_try", "Upside-Down Peach Mochi Cake"),

]

COMMENTS = [

    # ── Julianne's Chili ──────────────────────────────────────────────────────
    {"author": "rob",   "post_title": "Sweet Potato Chorizo Chili with Poblano-Avocado Crema", "body": "Julianne this is still one of my all-time favorites. The crema puts it completely over the top."},
    {"author": "masha", "post_title": "Sweet Potato Chorizo Chili with Poblano-Avocado Crema", "body": "Made this last fall and it was incredible. That crema!!"},
    {"author": "keith", "post_title": "Sweet Potato Chorizo Chili with Poblano-Avocado Crema", "body": "This has been on my list for years. Finally making it this fall."},
    {"author": "cody",  "post_title": "Sweet Potato Chorizo Chili with Poblano-Avocado Crema", "body": "The award-winning chili! I remember when you first made this."},

    # ── Mike's Mai Tai ────────────────────────────────────────────────────────
    {"author": "rob",  "post_title": "Mike's Marvelous Mai Tai", "body": "Finally got the formula out of him. This is dangerous."},
    {"author": "zach", "post_title": "Mike's Marvelous Mai Tai", "body": "I have made this an embarrassing number of times since Mike shared it. No regrets."},
    {"author": "gtr",  "post_title": "Mike's Marvelous Mai Tai", "body": "The 'less juice if you wanna get more fucked up' instruction is exactly what I needed."},

    # ── Beth's Cookies ────────────────────────────────────────────────────────
    {"author": "rob",     "post_title": "Jelly Almond Cookies", "body": "These cookies are everything. The almond extract is the secret."},
    {"author": "carolyn", "post_title": "Jelly Almond Cookies", "body": "Beth these are perfect for the holidays. Making them this year for sure."},
    {"author": "masha",   "post_title": "Jelly Almond Cookies", "body": "These are SO good. The glaze takes them to another level."},

    # ── Masha's Smoothie ──────────────────────────────────────────────────────
    {"author": "julianne", "post_title": "Masha's Delicious Smoothie", "body": "This is my breakfast 4x a week now. Highly recommend."},
    {"author": "sonia",    "post_title": "Masha's Delicious Smoothie", "body": "The almond milk + honey combo is perfect. Simple and so good."},

    # ── Masha's Everything Salad ──────────────────────────────────────────────
    {"author": "rob",      "post_title": "Masha's Everything Salad", "body": "Masha's salad is the platonic ideal of a salad. Every ingredient earns its spot."},
    {"author": "julianne", "post_title": "Masha's Everything Salad", "body": "The beet + couscous + feta combo is genuinely genius."},
    {"author": "beth",     "post_title": "Masha's Everything Salad", "body": "Perfect for meal prep. Made a big batch and ate it for lunch all week."},

    # ── Masha's Tomato Soup ───────────────────────────────────────────────────
    {"author": "sonia",    "post_title": "15-Minute Creamy Tomato Soup", "body": "15 minutes!! And it's silkier than any tomato soup I've made before."},
    {"author": "julianne", "post_title": "15-Minute Creamy Tomato Soup", "body": "My new emergency weeknight dinner. With grilled cheese obviously."},

    # ── Cody's Casserole ──────────────────────────────────────────────────────
    {"author": "rob",             "post_title": "Sweet Potato Crunch Casserole", "body": "This casserole is Thanksgiving. Full stop."},
    {"author": "rachel_and_mike", "post_title": "Sweet Potato Crunch Casserole", "body": "Cody brings this every year and it disappears in minutes. It's non-negotiable at this point."},
    {"author": "keith",           "post_title": "Sweet Potato Crunch Casserole", "body": "The crunch topping alone is worth making this."},

    # ── Jocelyn's Cocktail ────────────────────────────────────────────────────
    {"author": "rob",       "post_title": "Classy Bitch Cocktail", "body": "The name is perfect and so is the drink."},
    {"author": "mike_sahl", "post_title": "Classy Bitch Cocktail", "body": "The rosemary garnish is such a nice touch. Looks beautiful."},
    {"author": "gtr",       "post_title": "Classy Bitch Cocktail", "body": "Jocelyn delivered with this one."},
    {"author": "zach",      "post_title": "Classy Bitch Cocktail", "body": "Perfect summer patio drink. Making this for everyone this summer."},

    # ── Carolyn's Special K Bars ──────────────────────────────────────────────
    {"author": "rob",  "post_title": "Special K Bars", "body": "These are a menace to have in the house. I ate way too many."},
    {"author": "beth", "post_title": "Special K Bars", "body": "Carolyn!! My family went crazy for these. So easy and so good."},
    {"author": "gtr",  "post_title": "Special K Bars", "body": "The butterscotch-chocolate topping is absolutely the right call."},

    # ── Geoff's Guac ──────────────────────────────────────────────────────────
    {"author": "rob",       "post_title": "Geoff's Dank Guac", "body": "Geoff put the right amount of garlic in here (which is more than you think)."},
    {"author": "mike_sahl", "post_title": "Geoff's Dank Guac", "body": "The avocado pit trick actually works. Guac stayed green for days."},
    {"author": "zach",      "post_title": "Geoff's Dank Guac", "body": "The cayenne is the sleeper ingredient. Don't skip it."},
    {"author": "jocelyn",   "post_title": "Geoff's Dank Guac", "body": "This is the only guac recipe I use now."},

    # ── Keith's Cranberry Relish ──────────────────────────────────────────────
    {"author": "rob",             "post_title": "Keith's Kranberry Relish", "body": "This completely ruined canned cranberry sauce for me. I can never go back."},
    {"author": "carolyn",         "post_title": "Keith's Kranberry Relish", "body": "Keith!! This is our go-to every Thanksgiving now."},
    {"author": "rachel_and_mike", "post_title": "Keith's Kranberry Relish", "body": "We've made this three Thanksgivings in a row. Absolutely non-negotiable."},
    {"author": "cody",            "post_title": "Keith's Kranberry Relish", "body": "The whole orange in the food processor is genius. So simple."},

    # ── Zach's Peanut Noodles ─────────────────────────────────────────────────
    {"author": "julianne", "post_title": "Zach's Peanut Noodles", "body": "I make these on repeat. The ginger is key."},
    {"author": "rob",      "post_title": "Zach's Peanut Noodles", "body": "Classic Zach — effortless and delicious. The cold version is especially great in summer."},
    {"author": "beth",     "post_title": "Zach's Peanut Noodles", "body": "Made these last night. Absolutely a new weeknight staple."},

    # ── Rachel & Mike's Lasagna ───────────────────────────────────────────────
    {"author": "rob",   "post_title": "Lasagna with Big Sauce", "body": "The pecorino in the sauce is the move. That orange color!!"},
    {"author": "masha", "post_title": "Lasagna with Big Sauce", "body": "This lasagna is worth every minute of effort."},
    {"author": "keith", "post_title": "Lasagna with Big Sauce", "body": "Best lasagna I've ever had. That sauce is something else."},
    {"author": "sonia", "post_title": "Lasagna with Big Sauce", "body": "The vegetable-packed sauce is so smart. Even my kids ate it."},

    # ── Sonia's Butter Chicken ────────────────────────────────────────────────
    {"author": "rob",       "post_title": "Sonia's Butter Chicken", "body": "The overnight tandoori marinade is completely worth the wait. This is the real deal."},
    {"author": "masha",     "post_title": "Sonia's Butter Chicken", "body": "This is the best butter chicken I've ever had and I've had a lot of butter chicken."},
    {"author": "gtr",       "post_title": "Sonia's Butter Chicken", "body": "Sonia this belongs in a restaurant. Insane."},
    {"author": "mike_sahl", "post_title": "Sonia's Butter Chicken", "body": "The charred bits from the oven are everything."},
    {"author": "julianne",  "post_title": "Sonia's Butter Chicken", "body": "Genuinely one of the best things I've ever eaten. Please never stop making this."},

    # ── Cookbook: 3-Ingredient Mac ────────────────────────────────────────────
    {"author": "rob",      "post_title": "3-Ingredient Stovetop Mac and Cheese", "body": "My go-to late-night meal. Three ingredients and it's better than the boxed stuff."},
    {"author": "masha",    "post_title": "3-Ingredient Stovetop Mac and Cheese", "body": "Game changer. No roux and it's actually creamier than normal mac. How??"},
    {"author": "zach",     "post_title": "3-Ingredient Stovetop Mac and Cheese", "body": "This blew my mind the first time I made it. So good."},
    {"author": "julianne", "post_title": "3-Ingredient Stovetop Mac and Cheese", "body": "My new emergency weeknight meal. Beth and I made it at like midnight."},

    # ── Cookbook: Salmon Roasted in Butter ────────────────────────────────────
    {"author": "rob",   "post_title": "Salmon Roasted in Butter", "body": "Mark Bittman got this exactly right. The simplest things are always the best."},
    {"author": "sonia", "post_title": "Salmon Roasted in Butter", "body": "The herb butter is everything. I use dill every single time."},

    # ── Cookbook: Spinach & Feta Saag ─────────────────────────────────────────
    {"author": "sonia",   "post_title": "Spinach and Feta Cooked Like Saag Paneer", "body": "Priya Krishna is a genius. The feta completely works here — maybe better than paneer honestly."},
    {"author": "masha",   "post_title": "Spinach and Feta Cooked Like Saag Paneer", "body": "Made this last week! The tarka at the end takes it to another level."},
    {"author": "jocelyn", "post_title": "Spinach and Feta Cooked Like Saag Paneer", "body": "This is such a brilliant idea. On my list for sure."},

    # ── Cookbook: Sticky Wings ────────────────────────────────────────────────
    {"author": "rob",       "post_title": "Sticky Pomegranate & Black Pepper Chicken Wings", "body": "The pomegranate molasses glaze is next level. Made these for the Super Bowl and they were gone instantly."},
    {"author": "mike_sahl", "post_title": "Sticky Pomegranate & Black Pepper Chicken Wings", "body": "These are next level. The walnut finish is unexpected and perfect."},
    {"author": "gtr",       "post_title": "Sticky Pomegranate & Black Pepper Chicken Wings", "body": "That glaze though. Need to make these ASAP."},

    # ── Cookbook: Upside-Down Peach Mochi ─────────────────────────────────────
    {"author": "sonia",    "post_title": "Upside-Down Peach Mochi Cake", "body": "The texture is unlike any cake I've had. Chewy, caramelized, perfect."},
    {"author": "julianne", "post_title": "Upside-Down Peach Mochi Cake", "body": "Made this for a dinner party and people could not stop talking about it."},
    {"author": "beth",     "post_title": "Upside-Down Peach Mochi Cake", "body": "I made this and it was absolutely incredible. Mochiko flour is a game changer."},

]
