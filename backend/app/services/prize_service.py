from app.extensions import db
from app.models.prize import Prize

class PrizeService:
    @staticmethod
    def get_campaign_prizes(campaign_id: int, public_only: bool = True):
        query = Prize.query.filter_by(campaign_id=campaign_id)
        if public_only:
            query = query.filter_by(active=True)
        return query.order_by(Prize.id.asc()).all()

    @staticmethod
    def get_by_id(prize_id: int) -> Prize:
        return db.session.get(Prize, prize_id)

    @staticmethod
    def create_prize(campaign_id: int, data: dict) -> Prize:
        prize = Prize(
            campaign_id=campaign_id,
            name=data["name"].strip(),
            description=data.get("description", "").strip(),
            image_url=data.get("image_url", "").strip(),
            quantity=int(data["quantity"]),
            remaining_quantity=int(data["quantity"]),
            weight=int(data.get("weight", 10)),
            active=bool(data.get("active", True))
        )
        db.session.add(prize)
        db.session.commit()
        return prize

    @staticmethod
    def update_prize(prize_id: int, data: dict):
        prize = db.session.get(Prize, prize_id)
        if not prize:
            return False, "Prize not found", None

        if "name" in data:
            prize.name = data["name"].strip()
        if "description" in data:
            prize.description = data["description"].strip()
        if "image_url" in data:
            prize.image_url = data["image_url"].strip()
        if "weight" in data:
            prize.weight = int(data["weight"])
        if "active" in data:
            prize.active = bool(data["active"])
        if "quantity" in data:
            new_qty = int(data["quantity"])
            diff = new_qty - prize.quantity
            prize.quantity = new_qty
            prize.remaining_quantity = max(0, prize.remaining_quantity + diff)

        db.session.commit()
        return True, "Prize updated successfully", prize

    @staticmethod
    def delete_prize(prize_id: int):
        prize = db.session.get(Prize, prize_id)
        if not prize:
            return False, "Prize not found"
        # If prize was already won in spins, soft deactivate instead of hard delete
        if prize.spins:
            prize.active = False
            db.session.commit()
            return True, "Prize has existing spins; marked as inactive."
        db.session.delete(prize)
        db.session.commit()
        return True, "Prize deleted successfully."
