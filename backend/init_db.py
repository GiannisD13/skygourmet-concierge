from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
# Κάνουμε import όλα τα models για να τα "δει" η SQLAlchemy
from app.models.user import User
from app.models.menu import Item, Bundle, BundleItem
from app.models.order import Order, OrderItem
from app.models.airport import Airport, AirportItem, AirportBundle

ADMIN_SEED = {
    "full_name": "Admin",
    "email": "admin@skygourmet.gr",
    "phone": "+30000000000",
    "password": "admin1234",
    "is_admin": True,
}

AIRPORTS_SEED = [
    {"name": "Thessaloniki Macedonia", "code": "SKG", "city": "Thessaloniki"},
    {"name": "Athens International",   "code": "ATH", "city": "Athens"},
    {"name": "Mykonos Island National","code": "JMK", "city": "Mykonos"},
]

#ΔΕΝ ΧΡΕΙΑΖΕΤΑΙ ΠΛΕΟΝ ΜΕΤΑ ΤΗ ΠΡΟΣΘΗΚΗ ΤΟΥ ALEMBIC
def create_tables():
    print(" Ξεκινάει η δημιουργία των πινάκων στη βάση...")
    try:
        # Αυτή η εντολή δημιουργεί ό,τι λείπει από τη βάση
        Base.metadata.create_all(bind=engine)
        print(" Οι πίνακες δημιουργήθηκαν με επιτυχία!")
    except Exception as e:
        print(f" Κάτι πήγε στραβά: {e}")


def seed_airports():
    db = SessionLocal()
    try:
        for data in AIRPORTS_SEED:
            exists = db.query(Airport).filter(Airport.code == data["code"]).first()
            if not exists:
                db.add(Airport(**data))
                print(f" Seeded airport: {data['code']} — {data['name']}")
            else:
                print(f" Airport {data['code']} already exists, skipping.")
        db.commit()
    except Exception as e:
        db.rollback()
        print(f" Seed failed: {e}")
    finally:
        db.close()


def seed_admin():
    db = SessionLocal()
    try:
        exists = db.query(User).filter(User.email == ADMIN_SEED["email"]).first()
        if not exists:
            db.add(User(
                full_name=ADMIN_SEED["full_name"],
                email=ADMIN_SEED["email"],
                phone=ADMIN_SEED["phone"],
                hashed_password=hash_password(ADMIN_SEED["password"]),
                is_admin=True,
            ))
            db.commit()
            print(f" Seeded admin: {ADMIN_SEED['email']} / {ADMIN_SEED['password']}")
        else:
            print(f" Admin {ADMIN_SEED['email']} already exists, skipping.")
    except Exception as e:
        db.rollback()
        print(f" Admin seed failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    seed_airports()
    seed_admin()
