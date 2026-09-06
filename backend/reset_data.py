import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db
from app.models.customer import Customer
from app.models.spin import Spin
from app.models.otp import OTP
from app.models.prize import Prize

app = create_app(os.getenv("FLASK_ENV", "development"))

def reset_test_data():
    with app.app_context():
        print("Starting customer test data reset...")
        
        # 1. Clear Spin records
        deleted_spins = db.session.query(Spin).delete()
        print(f"-> Cleared {deleted_spins} spin records.")

        # 2. Clear OTP records
        deleted_otps = db.session.query(OTP).delete()
        print(f"-> Cleared {deleted_otps} OTP records.")

        # 3. Clear Customer records
        deleted_customers = db.session.query(Customer).delete()
        print(f"-> Cleared {deleted_customers} customer records.")

        # 4. Reset Prize remaining quantities to original quantities
        prizes = Prize.query.all()
        for p in prizes:
            p.remaining_quantity = p.quantity
        print(f"-> Reset inventory counters for {len(prizes)} prizes.")

        db.session.commit()
        print("Test data reset complete! Database is now clean for fresh testing.")

if __name__ == "__main__":
    reset_test_data()
