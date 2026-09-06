from app import create_app
from app.extensions import db
from app.models.prize import Prize
from app.models.campaign import Campaign

app = create_app('development')
with app.app_context():
    campaign = Campaign.query.first()
    new_prizes = [
        ("50% Discount on Accessories", "50% Discount on Accessories", 500, 100),
        ("5% Discount on Mobiles", "5% Discount on Mobiles", 500, 100),
        ("Buy @ ₹149/- Neck Band", "Buy @ ₹149/- Neck Band", 500, 100),
        ("Buy @ ₹399/- TWS Buds", "Buy @ ₹399/- TWS Buds", 500, 100),
        ("Buy @ ₹799/- Smart Watch", "Buy @ ₹799/- Smart Watch", 500, 100),
        ("Buy @ ₹49/- Glass Protection", "Buy @ ₹49/- Glass Protection", 500, 100),
    ]
    prizes = Prize.query.filter_by(campaign_id=campaign.id).order_by(Prize.id.asc()).all()
    for idx, (name, desc, qty, wt) in enumerate(new_prizes):
        if idx < len(prizes):
            p = prizes[idx]
            p.name = name
            p.description = desc
            p.quantity = qty
            p.remaining_quantity = qty
            p.weight = wt
            p.active = True
        else:
            p = Prize(campaign_id=campaign.id, name=name, description=desc, quantity=qty, remaining_quantity=qty, weight=wt, active=True)
            db.session.add(p)
    db.session.commit()
    print("Updated prizes successfully:", len(Prize.query.filter_by(campaign_id=campaign.id).all()))
