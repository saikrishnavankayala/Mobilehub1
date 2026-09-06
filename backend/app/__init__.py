import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors
from app.utils.response import error_response

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    if config_name == "production":
        missing_secrets = [
            key for key in ("SECRET_KEY", "JWT_SECRET_KEY")
            if not os.getenv(key)
        ]
        if missing_secrets:
            raise RuntimeError(
                "Production requires these environment variables: "
                + ", ".join(missing_secrets)
            )

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS
    cors_origins = app.config.get("CORS_ORIGINS", ["*"])
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # Register Blueprints
    from app.routes.auth_bp import auth_bp
    from app.routes.customer_bp import customer_bp
    from app.routes.campaign_bp import campaign_bp
    from app.routes.spin_bp import spin_bp
    from app.routes.prize_bp import prize_bp
    from app.routes.admin_bp import admin_bp
    from app.routes.claim_bp import claim_bp
    from app.routes.export_bp import export_bp
    from app.routes.social_bp import social_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(campaign_bp)
    app.register_blueprint(spin_bp)
    app.register_blueprint(prize_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(claim_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(social_bp)

    # Keep the original plural routes used by the UI and support the documented
    # singular public API paths without duplicating route logic.
    app.register_blueprint(customer_bp, url_prefix="/api/customer", name="customer_compat")
    app.register_blueprint(prize_bp, url_prefix="/api/prize", name="prize_compat")
    app.register_blueprint(claim_bp, url_prefix="/api/claim", name="claim_compat")
    app.register_blueprint(social_bp, url_prefix="/api/social", name="social_compat")

    # JWT Error Callbacks
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_response("Token has expired. Please log in again.", 401)

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return error_response(f"Invalid authentication token: {error_string}", 401)

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return error_response("Authorization token is missing. Please provide a valid Bearer token.", 401)

    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request_error(e):
        return error_response("Bad request. Please check submitted data.", 400)

    @app.errorhandler(404)
    def not_found_error(e):
        return error_response("The requested resource was not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed_error(e):
        return error_response("HTTP method not allowed for this endpoint.", 405)

    @app.errorhandler(500)
    def internal_server_error(e):
        return error_response("An unexpected server error occurred. Please try again later.", 500)

    # Healthcheck Route
    @app.route("/api/health", methods=["GET"])
    def healthcheck():
        return jsonify({
            "status": "healthy",
            "app": "Mobile Hub Spin & Win API",
            "version": "1.0.0"
        })

    # Security Headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

    return app
