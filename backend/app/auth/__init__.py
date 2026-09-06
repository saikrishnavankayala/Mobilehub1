from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify({"success": False, "message": "Admin authorization required."}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def customer_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "customer":
                return jsonify({"success": False, "message": "Customer authorization required."}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
