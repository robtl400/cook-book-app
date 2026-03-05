"""
User definitions for seeding.

Each dict becomes one User row + 3 default boxes (liked / cooked / want_to_try).
Optional `custom_boxes` list creates additional named boxes.
"""

USERS = [
    # ── Admin / curator account ───────────────────────────────────────────────
    {
        "username": "cookbook",
        "email": "cookbook@example.com",
        "display_name": "CookBook",
        "bio": "Classic recipes from around the world, tested and perfected. This is home base.",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },

    # ── Rob ───────────────────────────────────────────────────────────────────
    {
        "username": "rob",
        "email": "rob@example.com",
        "display_name": "Rob Lord",
        "bio": "Home cook. Always experimenting.",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [
            {"name": "Sunday Projects", "box_type": "custom"},
        ],
    },

    # ── Friends ───────────────────────────────────────────────────────────────
    {
        "username": "masha",
        "email": "masha@example.com",
        "display_name": "Masha Shapiro",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "sonia",
        "email": "sonia@example.com",
        "display_name": "Sonia Verma",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "mike_sahl",
        "email": "mike_sahl@example.com",
        "display_name": "Mike Sahl",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "julianne",
        "email": "julianne@example.com",
        "display_name": "Julianne Cabour",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "rachel_and_mike",
        "email": "rachel_and_mike@example.com",
        "display_name": "Rachel & Mike",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "zach",
        "email": "zach@example.com",
        "display_name": "Zach Knowles",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "keith",
        "email": "keith@example.com",
        "display_name": "Keith",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "gtr",
        "email": "gtr@example.com",
        "display_name": "GTR",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "carolyn",
        "email": "carolyn@example.com",
        "display_name": "Carolyn Wright",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "jocelyn",
        "email": "jocelyn@example.com",
        "display_name": "Jocelyn",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "cody",
        "email": "cody@example.com",
        "display_name": "Cody Snell",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
    {
        "username": "beth",
        "email": "beth@example.com",
        "display_name": "Beth Lord",
        "bio": "",
        "password": "password123",
        "profile_image_url": None,
        "custom_boxes": [],
    },
]
