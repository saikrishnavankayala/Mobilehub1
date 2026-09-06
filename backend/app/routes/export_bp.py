from flask import Blueprint, send_file
from app.services.export_service import ExportService
from app.auth import admin_required

export_bp = Blueprint("export", __name__, url_prefix="/api/admin/export")

@export_bp.route("/customers", methods=["GET"])
@admin_required()
def export_customers():
    excel_stream = ExportService.export_customers_excel()
    return send_file(
        excel_stream,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name="mobile_hub_campaign_report.xlsx"
    )
