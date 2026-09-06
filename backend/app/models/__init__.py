from app.models.admin import Admin
from app.models.customer import Customer
from app.models.otp import OTP
from app.models.campaign import Campaign
from app.models.prize import Prize
from app.models.spin import Spin, SpinStatus

__all__ = [
    "Admin",
    "Customer",
    "OTP",
    "Campaign",
    "Prize",
    "Spin",
    "SpinStatus",
]
