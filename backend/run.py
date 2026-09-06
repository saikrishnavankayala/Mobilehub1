import os
from app import create_app
from app.extensions import db

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    with app.app_context():
        # Ensure tables exist on local startup if migrations not yet executed
        db.create_all()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
