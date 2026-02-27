"""
Seed script: populates the database with realistic sample data.
Run from the server/ directory:  python seed.py
Requires the Flask app + DB to be configured (DATABASE_URL in .env).
"""
from app import create_app, db
from models.user import User
from models.post import Post
from models.recipe_post import RecipePost
from models.ingredient import Ingredient
from models.step import Step
from models.tag import Tag
from models.post_tag import PostTag
from models.recipe_box import RecipeBox
from models.box_post import BoxPost
from models.comment import Comment
from models.follow import Follow

app = create_app()


def clear_data():
    """Delete all rows in a safe order (respect FK constraints)."""
    print("Clearing existing data...")
    Follow.query.delete()
    BoxPost.query.delete()
    PostTag.query.delete()
    Comment.query.delete()
    Ingredient.query.delete()
    Step.query.delete()
    RecipeBox.query.delete()
    RecipePost.query.delete()
    Post.query.delete()
    Tag.query.delete()
    User.query.delete()
    db.session.commit()


def seed_tags():
    tags = [
        Tag(name="italian", category="cuisine"),
        Tag(name="mexican", category="cuisine"),
        Tag(name="japanese", category="cuisine"),
        Tag(name="american", category="cuisine"),
        Tag(name="mediterranean", category="cuisine"),
        Tag(name="vegan", category="dietary"),
        Tag(name="vegetarian", category="dietary"),
        Tag(name="gluten-free", category="dietary"),
        Tag(name="dairy-free", category="dietary"),
    ]
    db.session.add_all(tags)
    db.session.flush()
    return {t.name: t for t in tags}


def make_default_boxes(user):
    boxes = [
        RecipeBox(user_id=user.id, name="Liked", box_type="liked", is_default=True),
        RecipeBox(user_id=user.id, name="Cooked", box_type="cooked", is_default=True),
        RecipeBox(user_id=user.id, name="Want to Try", box_type="want_to_try", is_default=True),
    ]
    db.session.add_all(boxes)
    return boxes


def seed_users():
    alice = User(
        email="alice@example.com",
        username="alice",
        display_name="Alice Chen",
        bio="Home cook obsessed with weeknight pasta and sourdough experiments.",
        profile_image_url="https://i.pravatar.cc/150?u=alice",
    )
    alice.set_password("password123")

    bob = User(
        email="bob@example.com",
        username="bob",
        display_name="Bob Martinez",
        bio="Taco Tuesday is every day in my house.",
        profile_image_url="https://i.pravatar.cc/150?u=bob",
    )
    bob.set_password("password123")

    cora = User(
        email="cora@example.com",
        username="cora",
        display_name="Cora Kim",
        bio="Mostly vegan, always hungry.",
        profile_image_url="https://i.pravatar.cc/150?u=cora",
    )
    cora.set_password("password123")

    cookbook = User(
        email="cookbook@example.com",
        username="cookbook",
        display_name="CookBook Kitchen",
        bio="Classic recipes from around the world, tested and perfected. This is home base.",
        profile_image_url="https://i.pravatar.cc/150?u=cookbook",
    )
    cookbook.set_password("password123")

    db.session.add_all([alice, bob, cora, cookbook])
    db.session.flush()

    for user in [alice, bob, cora, cookbook]:
        make_default_boxes(user)

    # Custom boxes
    db.session.add(RecipeBox(user_id=alice.id, name="Pasta Night", box_type="custom", is_default=False))
    db.session.add(RecipeBox(user_id=alice.id, name="Weekend Projects", box_type="custom", is_default=False))
    db.session.add(RecipeBox(user_id=bob.id, name="Grill Season", box_type="custom", is_default=False))
    db.session.add(RecipeBox(user_id=cora.id, name="Veganize It", box_type="custom", is_default=False))

    return alice, bob, cora, cookbook


def seed_posts(alice, bob, cora, tags):
    # --- Alice's original pasta post ---
    pasta = RecipePost(
        user_id=alice.id,
        post_type="recipe_post",
        title="Cacio e Pepe",
        description="The Roman classic. Only three ingredients, but technique is everything.",
        self_rating=5,
        source_type="original",
        cook_time_minutes=20,
        servings=2,
        difficulty="medium",
        image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    )
    db.session.add(pasta)
    db.session.flush()

    db.session.add_all([
        Ingredient(recipe_post_id=pasta.id, name="spaghetti", quantity="200", unit="g", sort_order=0),
        Ingredient(recipe_post_id=pasta.id, name="Pecorino Romano", quantity="100", unit="g", sort_order=1),
        Ingredient(recipe_post_id=pasta.id, name="black pepper", quantity="2", unit="tsp", sort_order=2),
        Ingredient(recipe_post_id=pasta.id, name="pasta water", quantity="1", unit="cup", sort_order=3),
    ])
    db.session.add_all([
        Step(recipe_post_id=pasta.id, body="Cook spaghetti in well-salted boiling water until 2 min shy of al dente. Reserve 1 cup pasta water.", sort_order=0),
        Step(recipe_post_id=pasta.id, body="Toast black pepper in a dry pan over medium heat until fragrant, about 1 minute.", sort_order=1),
        Step(recipe_post_id=pasta.id, body="Add a splash of pasta water to the pepper, then add the drained pasta. Toss vigorously off the heat.", sort_order=2),
        Step(recipe_post_id=pasta.id, body="Add grated Pecorino in batches, adding pasta water as needed to create a creamy sauce. Serve immediately.", sort_order=3),
    ])
    db.session.add_all([
        PostTag(post_id=pasta.id, tag_id=tags["italian"].id),
        PostTag(post_id=pasta.id, tag_id=tags["vegetarian"].id),
    ])

    # --- Bob forks Alice's pasta ---
    pasta_fork = RecipePost(
        user_id=bob.id,
        post_type="recipe_post",
        title="Cacio e Pepe (my version — added guanciale)",
        description="Alice's recipe but I couldn't resist adding some crispy guanciale. 10/10.",
        self_rating=5,
        source_type="internal",
        source_post_id=pasta.id,
        cook_time_minutes=25,
        servings=2,
        difficulty="medium",
        image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800",
    )
    db.session.add(pasta_fork)
    db.session.flush()

    db.session.add_all([
        Ingredient(recipe_post_id=pasta_fork.id, name="spaghetti", quantity="200", unit="g", sort_order=0),
        Ingredient(recipe_post_id=pasta_fork.id, name="guanciale", quantity="80", unit="g", sort_order=1),
        Ingredient(recipe_post_id=pasta_fork.id, name="Pecorino Romano", quantity="80", unit="g", sort_order=2),
        Ingredient(recipe_post_id=pasta_fork.id, name="black pepper", quantity="2", unit="tsp", sort_order=3),
    ])
    db.session.add_all([
        Step(recipe_post_id=pasta_fork.id, body="Render guanciale in a dry pan over medium-low until crispy. Set aside on paper towels.", sort_order=0),
        Step(recipe_post_id=pasta_fork.id, body="Cook pasta, reserve water. Toast pepper in guanciale fat.", sort_order=1),
        Step(recipe_post_id=pasta_fork.id, body="Toss pasta in pepper fat with pasta water and Pecorino off heat until saucy.", sort_order=2),
        Step(recipe_post_id=pasta_fork.id, body="Top with crispy guanciale and extra pepper. Serve immediately.", sort_order=3),
    ])
    db.session.add(PostTag(post_id=pasta_fork.id, tag_id=tags["italian"].id))

    # --- Cora's vegan tacos ---
    tacos = RecipePost(
        user_id=cora.id,
        post_type="recipe_post",
        title="Smoky Black Bean Tacos",
        description="Weeknight saviour. Ready in 20 minutes, totally plant-based.",
        self_rating=4,
        source_type="original",
        cook_time_minutes=20,
        servings=4,
        difficulty="easy",
        image_url="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    )
    db.session.add(tacos)
    db.session.flush()

    db.session.add_all([
        Ingredient(recipe_post_id=tacos.id, name="black beans", quantity="2", unit="cans", sort_order=0),
        Ingredient(recipe_post_id=tacos.id, name="smoked paprika", quantity="1", unit="tsp", sort_order=1),
        Ingredient(recipe_post_id=tacos.id, name="cumin", quantity="1", unit="tsp", sort_order=2),
        Ingredient(recipe_post_id=tacos.id, name="corn tortillas", quantity="8", unit="", sort_order=3),
        Ingredient(recipe_post_id=tacos.id, name="avocado", quantity="2", unit="", sort_order=4),
        Ingredient(recipe_post_id=tacos.id, name="lime", quantity="1", unit="", sort_order=5),
    ])
    db.session.add_all([
        Step(recipe_post_id=tacos.id, body="Drain and rinse beans. Heat in a pan with spices and a splash of water for 5 minutes.", sort_order=0),
        Step(recipe_post_id=tacos.id, body="Warm tortillas directly over gas flame or in a dry pan.", sort_order=1),
        Step(recipe_post_id=tacos.id, body="Mash beans slightly in the pan. Fill tortillas and top with sliced avocado and lime juice.", sort_order=2),
    ])
    db.session.add_all([
        PostTag(post_id=tacos.id, tag_id=tags["mexican"].id),
        PostTag(post_id=tacos.id, tag_id=tags["vegan"].id),
        PostTag(post_id=tacos.id, tag_id=tags["gluten-free"].id),
    ])

    return pasta, pasta_fork, tacos


def seed_extra_posts(alice, bob, cora, pasta, pasta_fork, tacos, tags):
    """
    'I Cooked' posts: users cook each other's recipes with modifications.
    """
    # Bob cooks Cora's tacos — adds chicken, different rating
    bob_tacos = RecipePost(
        user_id=bob.id,
        post_type="recipe_post",
        title="Smoky Black Bean Tacos (with chicken)",
        description="Cora's tacos are great but I added chicken thighs. Not vegan anymore but incredible.",
        self_rating=3,
        source_type="internal",
        source_post_id=tacos.id,
        inspo_post_id=tacos.id,
        cook_time_minutes=30,
        servings=4,
        difficulty="easy",
    )
    db.session.add(bob_tacos)
    db.session.flush()

    db.session.add_all([
        Ingredient(recipe_post_id=bob_tacos.id, name="black beans", quantity="2", unit="cans", sort_order=0),
        Ingredient(recipe_post_id=bob_tacos.id, name="chicken thighs", quantity="2", unit="", sort_order=1),
        Ingredient(recipe_post_id=bob_tacos.id, name="smoked paprika", quantity="1.5", unit="tsp", sort_order=2),
        Ingredient(recipe_post_id=bob_tacos.id, name="cumin", quantity="1", unit="tsp", sort_order=3),
        Ingredient(recipe_post_id=bob_tacos.id, name="corn tortillas", quantity="8", unit="", sort_order=4),
        Ingredient(recipe_post_id=bob_tacos.id, name="avocado", quantity="1", unit="", sort_order=5),
        Ingredient(recipe_post_id=bob_tacos.id, name="lime", quantity="1", unit="", sort_order=6),
    ])
    db.session.add_all([
        Step(recipe_post_id=bob_tacos.id, body="Season and pan-fry chicken thighs 6 min per side. Slice thinly.", sort_order=0),
        Step(recipe_post_id=bob_tacos.id, body="Add beans and spices to the same pan with chicken drippings. Cook 5 min.", sort_order=1),
        Step(recipe_post_id=bob_tacos.id, body="Warm tortillas. Fill with beans, chicken, avocado, and squeeze of lime.", sort_order=2),
    ])
    db.session.add_all([
        PostTag(post_id=bob_tacos.id, tag_id=tags["mexican"].id),
    ])

    # Alice cooks Bob's pasta fork
    alice_pasta_cook = RecipePost(
        user_id=alice.id,
        post_type="recipe_post",
        title="Cacio e Pepe with guanciale (Bob's version)",
        description="Bob's take on my original. I had to try it. He was right — the guanciale is a game changer.",
        self_rating=5,
        source_type="internal",
        source_post_id=pasta_fork.id,
        inspo_post_id=pasta_fork.id,
        cook_time_minutes=25,
        servings=2,
        difficulty="medium",
    )
    db.session.add(alice_pasta_cook)
    db.session.flush()

    db.session.add_all([
        Ingredient(recipe_post_id=alice_pasta_cook.id, name="spaghetti", quantity="200", unit="g", sort_order=0),
        Ingredient(recipe_post_id=alice_pasta_cook.id, name="guanciale", quantity="100", unit="g", sort_order=1),
        Ingredient(recipe_post_id=alice_pasta_cook.id, name="Pecorino Romano", quantity="80", unit="g", sort_order=2),
        Ingredient(recipe_post_id=alice_pasta_cook.id, name="Parmigiano-Reggiano", quantity="30", unit="g", sort_order=3),
        Ingredient(recipe_post_id=alice_pasta_cook.id, name="black pepper", quantity="2", unit="tsp", sort_order=4),
    ])
    db.session.add_all([
        Step(recipe_post_id=alice_pasta_cook.id, body="Render guanciale until crispy. Set aside.", sort_order=0),
        Step(recipe_post_id=alice_pasta_cook.id, body="Cook pasta, toast pepper in guanciale fat.", sort_order=1),
        Step(recipe_post_id=alice_pasta_cook.id, body="Toss pasta off heat with Pecorino, Parmigiano, pasta water.", sort_order=2),
        Step(recipe_post_id=alice_pasta_cook.id, body="Top with guanciale. Added Parmigiano — sue me.", sort_order=3),
    ])
    db.session.add(PostTag(post_id=alice_pasta_cook.id, tag_id=tags["italian"].id))

    return bob_tacos, alice_pasta_cook


def seed_cookbook_posts(cookbook, tags):
    """20 diverse recipe posts from @cookbook covering all tag categories."""

    # Data-driven: list of (title, description, rating, source_type, cook_time, servings, difficulty, image_url, tag_names, ingredients, steps)
    recipes = [
        {
            "title": "Spaghetti Carbonara",
            "description": "The real thing — no cream. Eggs, Pecorino, guanciale, and technique.",
            "self_rating": 5,
            "cook_time_minutes": 25,
            "servings": 2,
            "difficulty": "hard",
            "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
            "tag_names": ["italian"],
            "ingredients": [
                {"name": "spaghetti", "quantity": "200", "unit": "g"},
                {"name": "guanciale", "quantity": "100", "unit": "g"},
                {"name": "eggs", "quantity": "3", "unit": ""},
                {"name": "Pecorino Romano", "quantity": "80", "unit": "g"},
                {"name": "black pepper", "quantity": "1", "unit": "tsp"},
            ],
            "steps": [
                "Render guanciale in a cold pan over medium heat until crispy. Reserve the fat.",
                "Whisk eggs with finely grated Pecorino and cracked pepper in a bowl.",
                "Cook spaghetti al dente. Reserve 1 cup pasta water.",
                "Off the heat, add drained pasta to guanciale. Add egg mixture slowly, tossing constantly. Add pasta water to loosen into a glossy sauce. Serve immediately.",
            ],
        },
        {
            "title": "Osso Buco alla Milanese",
            "description": "Slow-braised veal shanks with gremolata. A Sunday afternoon project worth every minute.",
            "self_rating": 5,
            "cook_time_minutes": 150,
            "servings": 4,
            "difficulty": "hard",
            "image_url": "https://images.unsplash.com/photo-1544025162-d76538879b4b?w=800",
            "tag_names": ["italian"],
            "ingredients": [
                {"name": "veal shanks", "quantity": "4", "unit": "pieces"},
                {"name": "white wine", "quantity": "250", "unit": "ml"},
                {"name": "crushed tomatoes", "quantity": "400", "unit": "g"},
                {"name": "onion", "quantity": "1", "unit": ""},
                {"name": "carrots", "quantity": "2", "unit": ""},
                {"name": "celery", "quantity": "2", "unit": "stalks"},
            ],
            "steps": [
                "Season and flour the veal shanks. Sear until deeply browned on both sides in olive oil.",
                "Sauté onion, carrot, celery in the same pot until soft. Add wine and reduce by half.",
                "Add tomatoes and enough stock to come halfway up the shanks. Cover and braise at 160°C for 2 hours.",
                "Make gremolata: mix lemon zest, garlic, and parsley. Spoon over shanks before serving.",
            ],
        },
        {
            "title": "Classic Tiramisu",
            "description": "No shortcuts. Homemade savoiardi optional but worth it. Rich, boozy, perfect.",
            "self_rating": 5,
            "cook_time_minutes": 30,
            "servings": 8,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
            "tag_names": ["italian", "vegetarian"],
            "ingredients": [
                {"name": "mascarpone", "quantity": "500", "unit": "g"},
                {"name": "eggs", "quantity": "4", "unit": ""},
                {"name": "sugar", "quantity": "100", "unit": "g"},
                {"name": "savoiardi biscuits", "quantity": "300", "unit": "g"},
                {"name": "espresso", "quantity": "300", "unit": "ml"},
                {"name": "cocoa powder", "quantity": "2", "unit": "tbsp"},
            ],
            "steps": [
                "Whisk egg yolks with sugar until pale and thick. Fold in mascarpone.",
                "Whip egg whites to stiff peaks and gently fold into mascarpone mixture.",
                "Dip savoiardi briefly in cooled espresso (with a splash of marsala if using). Layer in a dish.",
                "Spread mascarpone cream over biscuits. Repeat layers. Refrigerate overnight. Dust with cocoa before serving.",
            ],
        },
        {
            "title": "Penne all'Arrabbiata",
            "description": "Angry pasta — just tomatoes, garlic, and chilli. The simplest things are usually the best.",
            "self_rating": 4,
            "cook_time_minutes": 20,
            "servings": 2,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1608219994872-b8e0e4a7df71?w=800",
            "tag_names": ["italian", "vegan"],
            "ingredients": [
                {"name": "penne", "quantity": "200", "unit": "g"},
                {"name": "crushed tomatoes", "quantity": "400", "unit": "g"},
                {"name": "garlic", "quantity": "4", "unit": "cloves"},
                {"name": "dried chilli flakes", "quantity": "1", "unit": "tsp"},
                {"name": "olive oil", "quantity": "3", "unit": "tbsp"},
            ],
            "steps": [
                "Sauté garlic and chilli in olive oil over medium heat until garlic is golden.",
                "Add crushed tomatoes. Season and simmer 15 minutes until thickened.",
                "Cook penne al dente. Toss in sauce with a splash of pasta water. Serve.",
            ],
        },
        {
            "title": "Chicken Enchiladas Rojas",
            "description": "Corn tortillas filled with spiced chicken, smothered in red chile sauce. Family comfort food.",
            "self_rating": 5,
            "cook_time_minutes": 60,
            "servings": 6,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800",
            "tag_names": ["mexican"],
            "ingredients": [
                {"name": "corn tortillas", "quantity": "12", "unit": ""},
                {"name": "shredded chicken", "quantity": "500", "unit": "g"},
                {"name": "dried guajillo chiles", "quantity": "6", "unit": ""},
                {"name": "garlic", "quantity": "4", "unit": "cloves"},
                {"name": "chicken stock", "quantity": "400", "unit": "ml"},
                {"name": "Oaxaca cheese", "quantity": "200", "unit": "g"},
            ],
            "steps": [
                "Toast and rehydrate dried chiles in hot water 15 min. Blend with garlic and stock. Strain and simmer 10 min.",
                "Dip tortillas in warm chile sauce. Fill each with chicken and cheese. Roll and arrange seam-down in a baking dish.",
                "Pour remaining sauce over enchiladas. Top with more cheese. Bake at 190°C for 20 minutes until bubbly.",
            ],
        },
        {
            "title": "Pozole Verde",
            "description": "A bright, tangy Mexican stew with hominy and pork, topped with shredded cabbage and radish.",
            "self_rating": 4,
            "cook_time_minutes": 90,
            "servings": 6,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
            "tag_names": ["mexican", "gluten-free"],
            "ingredients": [
                {"name": "pork shoulder", "quantity": "800", "unit": "g"},
                {"name": "hominy", "quantity": "2", "unit": "cans"},
                {"name": "tomatillos", "quantity": "500", "unit": "g"},
                {"name": "poblano peppers", "quantity": "2", "unit": ""},
                {"name": "fresh cilantro", "quantity": "1", "unit": "bunch"},
            ],
            "steps": [
                "Simmer pork in water with onion and garlic until tender, about 1 hour. Shred and reserve broth.",
                "Roast tomatillos and poblanos. Blend with cilantro, garlic, and a cup of broth.",
                "Add green sauce and hominy to the broth. Simmer 20 min. Add pork. Serve with cabbage, radish, lime, and oregano.",
            ],
        },
        {
            "title": "Chiles Rellenos",
            "description": "Poblano peppers stuffed with cheese, battered, and fried. Topped with a simple tomato broth.",
            "self_rating": 4,
            "cook_time_minutes": 45,
            "servings": 4,
            "difficulty": "hard",
            "image_url": "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800",
            "tag_names": ["mexican", "vegetarian"],
            "ingredients": [
                {"name": "poblano peppers", "quantity": "4", "unit": "large"},
                {"name": "Oaxaca cheese", "quantity": "200", "unit": "g"},
                {"name": "eggs", "quantity": "3", "unit": ""},
                {"name": "flour", "quantity": "4", "unit": "tbsp"},
                {"name": "tomatoes", "quantity": "4", "unit": ""},
            ],
            "steps": [
                "Char peppers over open flame, peel, slit lengthwise, and remove seeds. Stuff with cheese.",
                "Separate eggs. Whip whites to stiff peaks; fold in yolks. Dust peppers with flour.",
                "Dip peppers in egg batter and fry in hot oil until golden. Serve over tomato broth.",
            ],
        },
        {
            "title": "Miso Ramen",
            "description": "Rich, hearty, satisfying. Spend the time on the broth and everything else falls into place.",
            "self_rating": 5,
            "cook_time_minutes": 120,
            "servings": 2,
            "difficulty": "hard",
            "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
            "tag_names": ["japanese"],
            "ingredients": [
                {"name": "ramen noodles", "quantity": "200", "unit": "g"},
                {"name": "white miso paste", "quantity": "3", "unit": "tbsp"},
                {"name": "dashi stock", "quantity": "1", "unit": "L"},
                {"name": "soy sauce", "quantity": "2", "unit": "tbsp"},
                {"name": "soft-boiled eggs", "quantity": "2", "unit": ""},
                {"name": "green onions", "quantity": "4", "unit": "stalks"},
                {"name": "nori sheets", "quantity": "2", "unit": ""},
            ],
            "steps": [
                "Make dashi by steeping kombu in cold water for 30 min, then bringing to just below boil. Add katsuobushi, steep 5 min, and strain.",
                "Whisk miso and soy sauce into hot dashi. Taste for seasoning. Do not boil.",
                "Cook noodles separately. Arrange in bowls with broth, sliced soft-boiled egg, green onion, and nori.",
            ],
        },
        {
            "title": "Crispy Pork Gyoza",
            "description": "Pan-fried dumplings with a crackling bottom crust. Make a big batch and freeze half.",
            "self_rating": 5,
            "cook_time_minutes": 60,
            "servings": 4,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800",
            "tag_names": ["japanese", "dairy-free"],
            "ingredients": [
                {"name": "ground pork", "quantity": "300", "unit": "g"},
                {"name": "napa cabbage", "quantity": "150", "unit": "g"},
                {"name": "ginger", "quantity": "1", "unit": "tbsp"},
                {"name": "garlic", "quantity": "2", "unit": "cloves"},
                {"name": "gyoza wrappers", "quantity": "30", "unit": ""},
                {"name": "soy sauce", "quantity": "2", "unit": "tbsp"},
            ],
            "steps": [
                "Finely chop cabbage, salt, and squeeze dry. Mix with pork, ginger, garlic, soy sauce, and sesame oil.",
                "Place a teaspoon of filling in each wrapper. Fold and pleat edges to seal.",
                "Heat oil in a flat-bottomed pan. Add gyoza flat-side-down. Pan-fry 2 min, then add a splash of water and cover to steam 3 min. Uncover to crisp the bottom.",
            ],
        },
        {
            "title": "Onigiri (Rice Balls)",
            "description": "The perfect portable Japanese snack. Fill with anything — umeboshi is the classic.",
            "self_rating": 4,
            "cook_time_minutes": 30,
            "servings": 4,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800",
            "tag_names": ["japanese", "vegan", "gluten-free"],
            "ingredients": [
                {"name": "Japanese short-grain rice", "quantity": "2", "unit": "cups"},
                {"name": "umeboshi (pickled plum)", "quantity": "4", "unit": ""},
                {"name": "nori sheets", "quantity": "2", "unit": ""},
                {"name": "salt", "quantity": "1", "unit": "tsp"},
            ],
            "steps": [
                "Cook rice. Let cool until just warm enough to handle.",
                "Wet hands, sprinkle with salt. Take a handful of rice, press an indent in the centre, add an umeboshi, and fold rice over to seal.",
                "Shape into a triangle. Wrap with a strip of nori. Eat immediately or wrap for later.",
            ],
        },
        {
            "title": "Teriyaki Salmon",
            "description": "Glossy, sticky, and done in 15 minutes. A weeknight staple that never gets old.",
            "self_rating": 4,
            "cook_time_minutes": 15,
            "servings": 2,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
            "tag_names": ["japanese", "gluten-free"],
            "ingredients": [
                {"name": "salmon fillets", "quantity": "2", "unit": ""},
                {"name": "soy sauce", "quantity": "3", "unit": "tbsp"},
                {"name": "mirin", "quantity": "2", "unit": "tbsp"},
                {"name": "sake", "quantity": "1", "unit": "tbsp"},
                {"name": "sugar", "quantity": "1", "unit": "tbsp"},
            ],
            "steps": [
                "Mix soy sauce, mirin, sake, and sugar for the teriyaki glaze.",
                "Sear salmon skin-side up in a hot oiled pan for 3 min. Flip, sear 2 min more.",
                "Pour glaze over salmon. Simmer and baste until glaze is thick and sticky. Serve with steamed rice.",
            ],
        },
        {
            "title": "Classic Baked Mac & Cheese",
            "description": "Three-cheese sauce with a panko crust. No powdered cheese. This is the real deal.",
            "self_rating": 5,
            "cook_time_minutes": 50,
            "servings": 6,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1612202958839-c98e87c19c33?w=800",
            "tag_names": ["american", "vegetarian"],
            "ingredients": [
                {"name": "elbow macaroni", "quantity": "400", "unit": "g"},
                {"name": "sharp cheddar", "quantity": "200", "unit": "g"},
                {"name": "Gruyère", "quantity": "100", "unit": "g"},
                {"name": "whole milk", "quantity": "500", "unit": "ml"},
                {"name": "butter", "quantity": "50", "unit": "g"},
                {"name": "panko breadcrumbs", "quantity": "80", "unit": "g"},
            ],
            "steps": [
                "Make a béchamel: melt butter, whisk in flour, gradually add milk until thick. Melt in cheeses. Season.",
                "Toss cooked macaroni in cheese sauce. Pour into a baking dish.",
                "Top with panko tossed in melted butter. Bake at 190°C for 25 min until golden and bubbling.",
            ],
        },
        {
            "title": "Texas-Style Beef Chili",
            "description": "No beans, no tomatoes. Just beef and chiles. An argument-starter, but in a good way.",
            "self_rating": 5,
            "cook_time_minutes": 180,
            "servings": 6,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1607716623609-c8f5a8e36bc9?w=800",
            "tag_names": ["american", "gluten-free"],
            "ingredients": [
                {"name": "beef chuck", "quantity": "1.5", "unit": "kg"},
                {"name": "dried ancho chiles", "quantity": "4", "unit": ""},
                {"name": "dried guajillo chiles", "quantity": "3", "unit": ""},
                {"name": "beef stock", "quantity": "500", "unit": "ml"},
                {"name": "garlic", "quantity": "6", "unit": "cloves"},
            ],
            "steps": [
                "Toast and rehydrate dried chiles. Blend with garlic and stock into a smooth paste.",
                "Cut beef into 2 cm cubes. Brown in batches in a heavy pot.",
                "Add chile paste to beef. Cover and simmer over low heat for 2.5 hours until beef is tender. Adjust seasoning.",
            ],
        },
        {
            "title": "Jalapeño Cheddar Cornbread",
            "description": "Crispy edges, tender crumb, spicy kick. Baked in a cast iron skillet for maximum crust.",
            "self_rating": 4,
            "cook_time_minutes": 30,
            "servings": 8,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
            "tag_names": ["american", "vegetarian"],
            "ingredients": [
                {"name": "cornmeal", "quantity": "200", "unit": "g"},
                {"name": "flour", "quantity": "120", "unit": "g"},
                {"name": "sharp cheddar", "quantity": "100", "unit": "g"},
                {"name": "jalapeños", "quantity": "2", "unit": ""},
                {"name": "buttermilk", "quantity": "240", "unit": "ml"},
                {"name": "eggs", "quantity": "2", "unit": ""},
            ],
            "steps": [
                "Preheat oven to 220°C with a cast iron skillet inside.",
                "Mix dry ingredients. Whisk buttermilk, eggs, and oil. Combine. Fold in cheese and diced jalapeños.",
                "Add butter to hot skillet, swirl to coat, pour in batter. Bake 20-25 min until golden and a skewer comes out clean.",
            ],
        },
        {
            "title": "Shakshuka",
            "description": "Eggs poached in a spiced tomato sauce. Perfect for any meal of the day. Don't skip the feta.",
            "self_rating": 5,
            "cook_time_minutes": 30,
            "servings": 2,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800",
            "tag_names": ["mediterranean", "vegetarian", "gluten-free"],
            "ingredients": [
                {"name": "eggs", "quantity": "4", "unit": ""},
                {"name": "crushed tomatoes", "quantity": "400", "unit": "g"},
                {"name": "red bell pepper", "quantity": "1", "unit": ""},
                {"name": "cumin", "quantity": "1", "unit": "tsp"},
                {"name": "smoked paprika", "quantity": "1", "unit": "tsp"},
                {"name": "feta cheese", "quantity": "60", "unit": "g"},
            ],
            "steps": [
                "Sauté diced onion and pepper in olive oil until soft. Add cumin, paprika, and garlic.",
                "Add crushed tomatoes. Simmer 10 min until sauce thickens. Season.",
                "Make wells in the sauce. Crack in eggs. Cover and cook 5-7 min until whites are set. Crumble feta over the top and serve with crusty bread.",
            ],
        },
        {
            "title": "Crispy Baked Falafel",
            "description": "Baked, not fried, but just as crispy. Serve in pita with tzatziki or alongside a mezze spread.",
            "self_rating": 4,
            "cook_time_minutes": 40,
            "servings": 4,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1602253057119-44d745d9b860?w=800",
            "tag_names": ["mediterranean", "vegan", "gluten-free"],
            "ingredients": [
                {"name": "dried chickpeas", "quantity": "250", "unit": "g"},
                {"name": "fresh parsley", "quantity": "1", "unit": "bunch"},
                {"name": "garlic", "quantity": "4", "unit": "cloves"},
                {"name": "cumin", "quantity": "1", "unit": "tsp"},
                {"name": "coriander", "quantity": "1", "unit": "tsp"},
                {"name": "olive oil", "quantity": "2", "unit": "tbsp"},
            ],
            "steps": [
                "Soak dried chickpeas in water overnight. Drain — do not cook.",
                "Pulse chickpeas, parsley, garlic, and spices in a food processor until a coarse paste. Form into small patties.",
                "Brush with oil. Bake at 200°C for 25 min, flipping halfway, until golden and crispy.",
            ],
        },
        {
            "title": "Tabbouleh",
            "description": "More parsley than bulgur. Bright, fresh, lemony. The way it's meant to be made.",
            "self_rating": 4,
            "cook_time_minutes": 20,
            "servings": 4,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
            "tag_names": ["mediterranean", "vegan", "gluten-free"],
            "ingredients": [
                {"name": "flat-leaf parsley", "quantity": "2", "unit": "bunches"},
                {"name": "bulgur wheat", "quantity": "60", "unit": "g"},
                {"name": "tomatoes", "quantity": "3", "unit": ""},
                {"name": "lemon juice", "quantity": "4", "unit": "tbsp"},
                {"name": "olive oil", "quantity": "3", "unit": "tbsp"},
                {"name": "fresh mint", "quantity": "1", "unit": "small bunch"},
            ],
            "steps": [
                "Soak bulgur in boiling water for 15 min. Drain and cool.",
                "Finely chop parsley and mint. Dice tomatoes. Combine with bulgur.",
                "Dress with lemon juice and olive oil. Season generously. Rest 30 min before serving.",
            ],
        },
        {
            "title": "Hummus from Scratch",
            "description": "Worth the effort of cooking your own chickpeas. Silky, creamy, and leagues better than store-bought.",
            "self_rating": 5,
            "cook_time_minutes": 90,
            "servings": 8,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
            "tag_names": ["mediterranean", "vegan", "gluten-free"],
            "ingredients": [
                {"name": "dried chickpeas", "quantity": "250", "unit": "g"},
                {"name": "tahini", "quantity": "100", "unit": "g"},
                {"name": "lemon juice", "quantity": "4", "unit": "tbsp"},
                {"name": "garlic", "quantity": "2", "unit": "cloves"},
                {"name": "ice water", "quantity": "4", "unit": "tbsp"},
            ],
            "steps": [
                "Soak chickpeas overnight. Cook with baking soda until very soft, 1-1.5 hours. Reserve cooking liquid.",
                "Blend tahini and lemon juice until white and fluffy. Add garlic and blend.",
                "Add warm chickpeas gradually, blending until smooth. Thin with ice water and cooking liquid. Season. The key is to blend a very long time.",
            ],
        },
        {
            "title": "Risotto al Limone",
            "description": "Bright, creamy, and just rich enough. Lemon and Parmigiano do the heavy lifting here.",
            "self_rating": 4,
            "cook_time_minutes": 35,
            "servings": 4,
            "difficulty": "medium",
            "image_url": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
            "tag_names": ["italian", "vegetarian"],
            "ingredients": [
                {"name": "Arborio rice", "quantity": "320", "unit": "g"},
                {"name": "vegetable stock", "quantity": "1.2", "unit": "L"},
                {"name": "lemon", "quantity": "2", "unit": ""},
                {"name": "Parmigiano-Reggiano", "quantity": "80", "unit": "g"},
                {"name": "butter", "quantity": "60", "unit": "g"},
                {"name": "white wine", "quantity": "100", "unit": "ml"},
            ],
            "steps": [
                "Toast rice in butter and oil with finely diced onion. Add wine and stir until absorbed.",
                "Add warm stock one ladle at a time, stirring constantly and waiting for each addition to absorb, about 18 min.",
                "Remove from heat. Stir in butter, Parmigiano, and lemon zest and juice. Rest 2 min and serve.",
            ],
        },
        {
            "title": "Roasted Cauliflower Shawarma",
            "description": "A plant-based spin on shawarma with serious depth of flavour. Serve with flatbread and tahini.",
            "self_rating": 4,
            "cook_time_minutes": 45,
            "servings": 4,
            "difficulty": "easy",
            "image_url": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800",
            "tag_names": ["mediterranean", "vegan", "gluten-free"],
            "ingredients": [
                {"name": "cauliflower", "quantity": "1", "unit": "large head"},
                {"name": "cumin", "quantity": "1.5", "unit": "tsp"},
                {"name": "coriander", "quantity": "1", "unit": "tsp"},
                {"name": "smoked paprika", "quantity": "1", "unit": "tsp"},
                {"name": "olive oil", "quantity": "3", "unit": "tbsp"},
                {"name": "tahini", "quantity": "3", "unit": "tbsp"},
            ],
            "steps": [
                "Cut cauliflower into thick steaks. Toss with spices and olive oil.",
                "Roast at 220°C for 30-35 min until deeply golden and caramelised.",
                "Serve over hummus or flatbread with tahini drizzle, pickled onions, and herbs.",
            ],
        },
    ]

    posts = []
    for r in recipes:
        post = RecipePost(
            user_id=cookbook.id,
            post_type="recipe_post",
            title=r["title"],
            description=r["description"],
            self_rating=r["self_rating"],
            source_type="original",
            cook_time_minutes=r["cook_time_minutes"],
            servings=r["servings"],
            difficulty=r["difficulty"],
            image_url=r.get("image_url"),
        )
        db.session.add(post)
        db.session.flush()

        for i, ing in enumerate(r["ingredients"]):
            db.session.add(Ingredient(
                recipe_post_id=post.id,
                name=ing["name"],
                quantity=ing.get("quantity"),
                unit=ing.get("unit", ""),
                sort_order=i,
            ))

        for i, body in enumerate(r["steps"]):
            db.session.add(Step(recipe_post_id=post.id, body=body, sort_order=i))

        for tag_name in r["tag_names"]:
            if tag_name in tags:
                db.session.add(PostTag(post_id=post.id, tag_id=tags[tag_name].id))

        posts.append(post)

    return posts  # returns list of 20 posts in same order as recipes[]


def seed_cookbook_cooked(alice, bob, cora, cookbook_posts, tags):
    """
    8 'I Cooked' posts from alice/bob/cora cooking @cookbook's recipes.
    cookbook_posts is a list of 20 RecipePost objects in recipe order.
    """
    shakshuka = cookbook_posts[14]   # index 14 = shakshuka
    falafel   = cookbook_posts[15]   # index 15 = falafel
    ramen     = cookbook_posts[7]    # index 7  = miso ramen
    chili     = cookbook_posts[12]   # index 12 = beef chili
    gyoza     = cookbook_posts[8]    # index 8  = gyoza
    tabbouleh = cookbook_posts[16]   # index 16 = tabbouleh
    onigiri   = cookbook_posts[9]    # index 9  = onigiri
    carbonara = cookbook_posts[0]    # index 0  = carbonara

    cooked_list = [
        RecipePost(
            user_id=alice.id, post_type="recipe_post",
            title="Shakshuka with leftover harissa",
            description="Tried @cookbook's shakshuka but subbed harissa for the paprika. Even better.",
            self_rating=5, source_type="internal", source_post_id=shakshuka.id,
            cook_time_minutes=25, servings=2, difficulty="easy",
        ),
        RecipePost(
            user_id=alice.id, post_type="recipe_post",
            title="Falafel power bowl",
            description="Made @cookbook's baked falafel and threw them in a bowl with quinoa and roasted veg.",
            self_rating=4, source_type="internal", source_post_id=falafel.id,
            cook_time_minutes=40, servings=2, difficulty="easy",
        ),
        RecipePost(
            user_id=bob.id, post_type="recipe_post",
            title="Miso ramen with chashu pork",
            description="@cookbook's broth is the base. I added chashu pork belly on top. Life-changing.",
            self_rating=5, source_type="internal", source_post_id=ramen.id,
            cook_time_minutes=150, servings=2, difficulty="hard",
        ),
        RecipePost(
            user_id=bob.id, post_type="recipe_post",
            title="Texas chili cook-off entry",
            description="@cookbook's recipe is my new baseline. Won second place at the block party.",
            self_rating=5, source_type="internal", source_post_id=chili.id,
            cook_time_minutes=180, servings=8, difficulty="medium",
        ),
        RecipePost(
            user_id=bob.id, post_type="recipe_post",
            title="Gyoza pan-fried, then steamed",
            description="Followed @cookbook's gyoza method to the letter. The crispy bottom is everything.",
            self_rating=4, source_type="internal", source_post_id=gyoza.id,
            cook_time_minutes=60, servings=4, difficulty="medium",
        ),
        RecipePost(
            user_id=cora.id, post_type="recipe_post",
            title="Tabbouleh with extra lemon",
            description="@cookbook's tabbouleh is already great. I added more lemon because I'm who I am.",
            self_rating=4, source_type="internal", source_post_id=tabbouleh.id,
            cook_time_minutes=15, servings=4, difficulty="easy",
        ),
        RecipePost(
            user_id=cora.id, post_type="recipe_post",
            title="Onigiri with pickled ginger",
            description="Tried @cookbook's onigiri with pickled ginger instead of umeboshi. Surprisingly good.",
            self_rating=4, source_type="internal", source_post_id=onigiri.id,
            cook_time_minutes=30, servings=2, difficulty="easy",
        ),
        RecipePost(
            user_id=cora.id, post_type="recipe_post",
            title="Vegan carbonara (no eggs!)",
            description="Adapted @cookbook's carbonara with cashew cream and nutritional yeast. Not the same but honestly delicious.",
            self_rating=3, source_type="internal", source_post_id=carbonara.id,
            cook_time_minutes=25, servings=2, difficulty="medium",
        ),
    ]

    db.session.add_all(cooked_list)
    db.session.flush()

    # Add minimal ingredients and steps so the posts look real
    simple = [
        (["salt", "pepper", "olive oil"], ["Cook as per source recipe with modifications."]),
    ]
    for post in cooked_list:
        db.session.add(Ingredient(recipe_post_id=post.id, name="ingredients as per source", sort_order=0))
        db.session.add(Step(recipe_post_id=post.id, body="Follow the source recipe with personal modifications as described.", sort_order=0))

    # Tag the cooked posts
    db.session.add(PostTag(post_id=cooked_list[0].id, tag_id=tags["mediterranean"].id))
    db.session.add(PostTag(post_id=cooked_list[0].id, tag_id=tags["vegetarian"].id))
    db.session.add(PostTag(post_id=cooked_list[1].id, tag_id=tags["mediterranean"].id))
    db.session.add(PostTag(post_id=cooked_list[1].id, tag_id=tags["vegan"].id))
    db.session.add(PostTag(post_id=cooked_list[2].id, tag_id=tags["japanese"].id))
    db.session.add(PostTag(post_id=cooked_list[3].id, tag_id=tags["american"].id))
    db.session.add(PostTag(post_id=cooked_list[4].id, tag_id=tags["japanese"].id))
    db.session.add(PostTag(post_id=cooked_list[5].id, tag_id=tags["mediterranean"].id))
    db.session.add(PostTag(post_id=cooked_list[5].id, tag_id=tags["vegan"].id))
    db.session.add(PostTag(post_id=cooked_list[6].id, tag_id=tags["japanese"].id))
    db.session.add(PostTag(post_id=cooked_list[7].id, tag_id=tags["italian"].id))

    return cooked_list


def seed_cookbook_social(alice, bob, cora, cookbook, cookbook_posts, cooked_list):
    """Follows, box saves for cookbook user so explore endpoint has data."""

    # Everyone follows cookbook
    db.session.add_all([
        Follow(follower_id=alice.id, followed_id=cookbook.id),
        Follow(follower_id=bob.id, followed_id=cookbook.id),
        Follow(follower_id=cora.id, followed_id=cookbook.id),
        Follow(follower_id=cookbook.id, followed_id=alice.id),
        Follow(follower_id=cookbook.id, followed_id=cora.id),
    ])
    db.session.flush()

    # Add box saves so explore (most_saved + most_cooked) returns results
    alice_want  = RecipeBox.query.filter_by(user_id=alice.id, box_type="want_to_try").first()
    alice_liked = RecipeBox.query.filter_by(user_id=alice.id, box_type="liked").first()
    alice_cooked = RecipeBox.query.filter_by(user_id=alice.id, box_type="cooked").first()
    bob_want    = RecipeBox.query.filter_by(user_id=bob.id, box_type="want_to_try").first()
    bob_liked   = RecipeBox.query.filter_by(user_id=bob.id, box_type="liked").first()
    bob_cooked  = RecipeBox.query.filter_by(user_id=bob.id, box_type="cooked").first()
    cora_want   = RecipeBox.query.filter_by(user_id=cora.id, box_type="want_to_try").first()
    cora_liked  = RecipeBox.query.filter_by(user_id=cora.id, box_type="liked").first()
    cora_cooked = RecipeBox.query.filter_by(user_id=cora.id, box_type="cooked").first()

    # Save cookbook posts to multiple boxes (powers most_saved)
    saves = []
    for i, post in enumerate(cookbook_posts[:10]):
        if i % 3 == 0:
            saves.append(BoxPost(box_id=alice_want.id, post_id=post.id))
            saves.append(BoxPost(box_id=bob_liked.id, post_id=post.id))
        if i % 3 == 1:
            saves.append(BoxPost(box_id=cora_want.id, post_id=post.id))
            saves.append(BoxPost(box_id=alice_liked.id, post_id=post.id))
        if i % 3 == 2:
            saves.append(BoxPost(box_id=bob_want.id, post_id=post.id))
            saves.append(BoxPost(box_id=cora_liked.id, post_id=post.id))
    db.session.add_all(saves)

    # Save the 'I Cooked' posts to cooked boxes (powers most_cooked)
    cooked_saves = []
    for post in cooked_list:
        if post.user_id == alice.id:
            cooked_saves.append(BoxPost(box_id=alice_cooked.id, post_id=post.id))
        elif post.user_id == bob.id:
            cooked_saves.append(BoxPost(box_id=bob_cooked.id, post_id=post.id))
        elif post.user_id == cora.id:
            cooked_saves.append(BoxPost(box_id=cora_cooked.id, post_id=post.id))
    db.session.add_all(cooked_saves)


def seed_social(alice, bob, cora, pasta, pasta_fork, tacos, bob_tacos, alice_pasta_cook):
    # Follows — expanded set
    db.session.add_all([
        Follow(follower_id=bob.id, followed_id=alice.id),
        Follow(follower_id=cora.id, followed_id=alice.id),
        Follow(follower_id=alice.id, followed_id=cora.id),
        Follow(follower_id=bob.id, followed_id=cora.id),
        Follow(follower_id=alice.id, followed_id=bob.id),
    ])
    db.session.flush()

    # Comments
    cora_comment = Comment(user_id=cora.id, post_id=pasta.id, body="Can I make this with nutritional yeast instead of Pecorino?")
    db.session.add(cora_comment)
    db.session.flush()

    db.session.add_all([
        Comment(user_id=bob.id, post_id=pasta.id, body="This is life-changing. The pepper-toasting step is the key!"),
        Comment(user_id=alice.id, post_id=pasta.id, parent_id=cora_comment.id, body="@cora — yes! It won't be the same but it'll still be delicious."),
        Comment(user_id=alice.id, post_id=tacos.id, body="Made these last night. Added pickled jalapeños. Outstanding."),
        Comment(user_id=cora.id, post_id=pasta_fork.id, body="You added meat to my recipe inspiration and I'm somehow not mad about it."),
        Comment(user_id=alice.id, post_id=bob_tacos.id, body="Glad the inspiration helped! The chicken version sounds amazing."),
        Comment(user_id=bob.id, post_id=alice_pasta_cook.id, body="Adding Parmigiano is controversial but honestly I respect the move."),
    ])

    # Box saves
    alice_pasta_box = RecipeBox.query.filter_by(user_id=alice.id, name="Pasta Night").first()
    bob_cooked_box = RecipeBox.query.filter_by(user_id=bob.id, box_type="cooked").first()
    bob_want_box = RecipeBox.query.filter_by(user_id=bob.id, box_type="want_to_try").first()
    cora_want_box = RecipeBox.query.filter_by(user_id=cora.id, box_type="want_to_try").first()
    cora_cooked_box = RecipeBox.query.filter_by(user_id=cora.id, box_type="cooked").first()
    alice_cooked_box = RecipeBox.query.filter_by(user_id=alice.id, box_type="cooked").first()

    db.session.add_all([
        BoxPost(box_id=alice_pasta_box.id, post_id=pasta_fork.id),
        BoxPost(box_id=bob_cooked_box.id, post_id=pasta_fork.id),
        BoxPost(box_id=bob_cooked_box.id, post_id=bob_tacos.id),
        BoxPost(box_id=bob_want_box.id, post_id=tacos.id),
        BoxPost(box_id=cora_want_box.id, post_id=pasta.id),
        BoxPost(box_id=cora_cooked_box.id, post_id=bob_tacos.id),
        BoxPost(box_id=alice_cooked_box.id, post_id=alice_pasta_cook.id),
    ])


def run():
    with app.app_context():
        clear_data()

        print("Seeding tags...")
        tags = seed_tags()

        print("Seeding users + default boxes...")
        alice, bob, cora, cookbook = seed_users()

        print("Seeding recipe posts...")
        pasta, pasta_fork, tacos = seed_posts(alice, bob, cora, tags)

        print("Seeding 'I Cooked' posts...")
        bob_tacos, alice_pasta_cook = seed_extra_posts(alice, bob, cora, pasta, pasta_fork, tacos, tags)

        print("Seeding follows, comments, box saves...")
        seed_social(alice, bob, cora, pasta, pasta_fork, tacos, bob_tacos, alice_pasta_cook)

        print("Seeding @cookbook's 20 recipe posts...")
        cookbook_posts = seed_cookbook_posts(cookbook, tags)

        print("Seeding 'I Cooked' posts on @cookbook's recipes...")
        cooked_list = seed_cookbook_cooked(alice, bob, cora, cookbook_posts, tags)

        print("Seeding @cookbook social (follows + box saves)...")
        seed_cookbook_social(alice, bob, cora, cookbook, cookbook_posts, cooked_list)

        db.session.commit()
        print("Done! Database seeded successfully.")
        print("  Users: alice / bob / cora / cookbook (password: password123)")
        print(f"  Original posts: {pasta.title}, {pasta_fork.title}, {tacos.title}")
        print(f"  @cookbook posts: {len(cookbook_posts)} recipes")
        print(f"  'I Cooked' posts: {len(cooked_list) + 2}")


if __name__ == "__main__":
    run()
