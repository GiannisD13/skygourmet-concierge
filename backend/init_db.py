from app.core.database import engine, Base
# Κάνουμε import όλα τα models για να τα "δει" η SQLAlchemy
from app.models.user import User
from app.models.menu import Item, Bundle, BundleItem
from app.models.order import Order, OrderItem

#ΔΕΝ ΧΡΕΙΑΖΕΤΑΙ ΠΛΕΟΝ ΜΕΤΑ ΤΗ ΠΡΟΣΘΗΚΗ ΤΟΥ ALEMBIC
def create_tables():
    print(" Ξεκινάει η δημιουργία των πινάκων στη βάση...")
    try:
        # Αυτή η εντολή δημιουργεί ό,τι λείπει από τη βάση
        Base.metadata.create_all(bind=engine)
        print(" Οι πίνακες δημιουργήθηκαν με επιτυχία!")
    except Exception as e:
        print(f" Κάτι πήγε στραβά: {e}")

if __name__ == "__main__":
    create_tables()