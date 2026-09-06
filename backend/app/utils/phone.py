import re

def normalize_phone(val: str) -> str:
    """
    Normalizes Indian mobile number to strict 10 digits.
    Handles +91, 91 prefix, leading 0, spaces, and hyphens.
    E.g.:
      '+91 98765-43210' -> '9876543210'
      '919876543210'    -> '9876543210'
      '09876543210'     -> '9876543210'
      '9876543210'      -> '9876543210'
    """
    if not val:
        return ""
    clean = re.sub(r"\D", "", str(val).strip())
    if clean.startswith("91") and len(clean) == 12:
        clean = clean[2:]
    elif clean.startswith("0") and len(clean) == 11:
        clean = clean[1:]
    return clean

def is_valid_indian_mobile(val: str) -> bool:
    """
    Validates that normalized number is exactly 10 digits starting with 6, 7, 8, or 9.
    """
    normalized = normalize_phone(val)
    return bool(re.match(r"^[6-9]\d{9}$", normalized))
