"""
Seed script: populates the database with realistic sample data.
Run from the server/ directory:  python seed.py
Requires the Flask app + DB to be configured (DATABASE_URL in .env).
"""
from app import create_app, db
from models.user import User
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
    Tag.query.delete()
    # Post rows are deleted via cascade when RecipePost rows go away
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

    db.session.add_all([alice, bob, cora])
    db.session.flush()

    for user in [alice, bob, cora]:
        make_default_boxes(user)

    # Custom boxes
    db.session.add(RecipeBox(user_id=alice.id, name="Pasta Night", box_type="custom", is_default=False))
    db.session.add(RecipeBox(user_id=bob.id, name="Grill Season", box_type="custom", is_default=False))

    return alice, bob, cora


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


def seed_social(alice, bob, cora, pasta, pasta_fork, tacos):
    # Follows
    db.session.add_all([
        Follow(follower_id=bob.id, followed_id=alice.id),
        Follow(follower_id=cora.id, followed_id=alice.id),
        Follow(follower_id=alice.id, followed_id=cora.id),
    ])

    # Comments
    db.session.add_all([
        Comment(user_id=bob.id, post_id=pasta.id, body="This is life-changing. The pepper-toasting step is the key!"),
        Comment(user_id=cora.id, post_id=pasta.id, body="Can I make this with nutritional yeast instead of Pecorino?"),
        Comment(user_id=alice.id, post_id=pasta.id, parent_id=None, body="@cora — yes! It won't be the same but it'll still be delicious."),
        Comment(user_id=alice.id, post_id=tacos.id, body="Made these last night. Added pickled jalapeños. Outstanding."),
    ])

    # Save some posts to boxes (get Alice's Pasta Night box and Bob's cooked box)
    alice_pasta_box = RecipeBox.query.filter_by(user_id=alice.id, name="Pasta Night").first()
    bob_cooked_box = RecipeBox.query.filter_by(user_id=bob.id, box_type="cooked").first()
    cora_want_box = RecipeBox.query.filter_by(user_id=cora.id, box_type="want_to_try").first()

    db.session.add_all([
        BoxPost(box_id=alice_pasta_box.id, post_id=pasta_fork.id),
        BoxPost(box_id=bob_cooked_box.id, post_id=pasta_fork.id),
        BoxPost(box_id=cora_want_box.id, post_id=pasta.id),
    ])


def run():
    with app.app_context():
        clear_data()

        print("Seeding tags...")
        tags = seed_tags()

        print("Seeding users + default boxes...")
        alice, bob, cora = seed_users()

        print("Seeding recipe posts...")
        pasta, pasta_fork, tacos = seed_posts(alice, bob, cora, tags)

        print("Seeding follows, comments, box saves...")
        seed_social(alice, bob, cora, pasta, pasta_fork, tacos)

        db.session.commit()
        print("Done! Database seeded successfully.")
        print(f"  Users: alice / bob / cora (password: password123)")
        print(f"  Posts: {pasta.title}, {pasta_fork.title}, {tacos.title}")


if __name__ == "__main__":
    run()
