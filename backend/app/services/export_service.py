import io
from datetime import datetime, timezone
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from app.models.customer import Customer
from app.models.spin import Spin

class ExportService:
    @staticmethod
    def export_customers_excel() -> io.BytesIO:
        wb = Workbook()
        ws = wb.active
        ws.title = "Mobile Hub Customers"

        # Define styles
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        title_font = Font(name="Calibri", size=16, bold=True, color="0F172A")
        sub_font = Font(name="Calibri", size=10, italic=True, color="64748B")
        regular_font = Font(name="Calibri", size=10)
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        # Title Rows
        ws.merge_cells("A1:K1")
        ws["A1"] = "MOBILE HUB – SPIN & WIN CAMPAIGN REPORT"
        ws["A1"].font = title_font
        ws["A1"].alignment = Alignment(horizontal="left", vertical="center")

        ws.merge_cells("A2:K2")
        ws["A2"] = f"Generated on: {datetime.now(timezone.utc).strftime('%d-%b-%Y %H:%M UTC')}"
        ws["A2"].font = sub_font
        ws["A2"].alignment = Alignment(horizontal="left", vertical="center")

        # Headers
        headers = [
            "Customer Name",
            "Mobile",
            "Address",
            "OTP Status",
            "Eligibility Status",
            "Spin Status",
            "Prize",
            "Claim Code",
            "Claim Status",
            "Registration Date",
            "Spin Date"
        ]

        row_num = 4
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=row_num, column=col_num, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border
        ws.row_dimensions[row_num].height = 25

        # Query all customers
        customers = Customer.query.order_by(Customer.created_at.desc()).all()
        row_num = 5

        for c in customers:
            spin = Spin.query.filter_by(customer_id=c.id).first()
            
            otp_status = "Verified" if c.otp_verified else "Pending"
            eligibility_status = "Eligible" if (c.otp_verified and c.social_verified and not spin) else ("Spun" if spin else "Ineligible")
            spin_status = "Spun" if spin else "Not Spun"
            prize_name = spin.prize.name if spin and spin.prize else "N/A"
            claim_code = spin.claim_code if spin else "N/A"
            claim_status = spin.status if spin else "N/A"
            reg_date = c.created_at.strftime("%d-%b-%Y %H:%M") if c.created_at else "N/A"
            spin_date = spin.created_at.strftime("%d-%b-%Y %H:%M") if spin and spin.created_at else "N/A"

            row_values = [
                c.name,
                c.mobile,
                c.address,
                otp_status,
                eligibility_status,
                spin_status,
                prize_name,
                claim_code,
                claim_status,
                reg_date,
                spin_date
            ]

            for col_num, val in enumerate(row_values, 1):
                cell = ws.cell(row=row_num, column=col_num, value=val)
                cell.font = regular_font
                cell.border = thin_border
                if col_num in [2, 4, 5, 6, 8, 9, 10, 11]:
                    cell.alignment = Alignment(horizontal="center")
                else:
                    cell.alignment = Alignment(horizontal="left")
                
                # Highlight Claimed status or active claim codes
                if col_num == 9 and val == "CLAIMED":
                    cell.font = Font(name="Calibri", size=10, bold=True, color="166534")
                elif col_num == 9 and val == "GENERATED":
                    cell.font = Font(name="Calibri", size=10, bold=True, color="854D0E")

            ws.row_dimensions[row_num].height = 20
            row_num += 1

        # Auto-fit column widths using header cells
        for col_idx in range(1, len(headers) + 1):
            col_letter = get_column_letter(col_idx)
            header_val = str(ws.cell(row=4, column=col_idx).value or '')
            max_len = len(header_val)
            for r in range(5, row_num):
                cell_val = str(ws.cell(row=r, column=col_idx).value or '')
                if len(cell_val) > max_len:
                    max_len = len(cell_val)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return output
