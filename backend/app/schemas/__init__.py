import re
from marshmallow import Schema, fields, validate, validates, ValidationError

INDIAN_MOBILE_REGEX = re.compile(r"^[6-9]\d{9}$")

class CustomerRegistrationSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100, error="Name must be between 2 and 100 characters."))
    mobile = fields.String(required=True)
    address = fields.String(required=True, validate=validate.Length(min=3, max=500, error="Address must be at least 3 characters."))

    @validates("mobile")
    def validate_mobile(self, value, **kwargs):
        clean_mobile = value.strip().replace("+91", "").replace("-", "").replace(" ", "")
        if not INDIAN_MOBILE_REGEX.match(clean_mobile):
            raise ValidationError("Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")

class SendOTPSchema(Schema):
    mobile = fields.String(required=True)

    @validates("mobile")
    def validate_mobile(self, value, **kwargs):
        clean_mobile = value.strip().replace("+91", "").replace("-", "").replace(" ", "")
        if not INDIAN_MOBILE_REGEX.match(clean_mobile):
            raise ValidationError("Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")

class VerifyOTPSchema(Schema):
    mobile = fields.String(required=True)
    otp = fields.String(required=True, validate=validate.Length(equal=6, error="OTP must be exactly 6 digits."))

    @validates("otp")
    def validate_otp(self, value, **kwargs):
        if not value.isdigit():
            raise ValidationError("OTP must contain digits only.")

class AdminLoginSchema(Schema):
    email = fields.Email(required=True, error_messages={"invalid": "Invalid email address format."})
    password = fields.String(required=True, validate=validate.Length(min=6, error="Password must be at least 6 characters."))

class PrizeSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=150))
    description = fields.String(load_default="")
    image_url = fields.String(load_default="")
    quantity = fields.Integer(required=True, validate=validate.Range(min=0, error="Quantity must be >= 0."))
    weight = fields.Integer(load_default=10, validate=validate.Range(min=0, error="Weight must be >= 0."))
    active = fields.Boolean(load_default=True)

class CampaignUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=150))
    description = fields.String()
    start_date = fields.DateTime(allow_none=True)
    end_date = fields.DateTime(allow_none=True)
    instagram_url = fields.String()
    facebook_url = fields.String()
    whatsapp_url = fields.String()
    store_name = fields.String()
    store_address = fields.String()
    store_phone = fields.String()
    terms_conditions = fields.String()
    privacy_policy = fields.String()
    active = fields.Boolean()
    max_spins_per_mobile = fields.Integer(validate=validate.Range(min=1, error="Max spins must be >= 1."))
