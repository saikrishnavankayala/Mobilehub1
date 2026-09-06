import secrets
import string

# Characters that are unambiguous for humans (excludes 0, O, 1, I, L)
SAFE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

def generate_claim_code(prefix: str = "MH-", length: int = 6) -> str:
    """Generate human-readable claim code like MH-X8K29P"""
    random_part = "".join(secrets.choice(SAFE_CHARS) for _ in range(length))
    return f"{prefix}{random_part}"
