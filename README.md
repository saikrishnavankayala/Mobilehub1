# MOBILE HUB – SPIN & WIN

### Production-Ready Full-Stack Web Application for Promotional Campaigns

Mobile Hub – Spin & Win is an enterprise-grade promotional web application designed for mobile stores to run viral marketing campaigns. Customers register with their 10-digit Indian mobile number, verify via cryptographic OTP, complete social media engagements, and receive exactly **ONE guaranteed spin** to win authentic store vouchers, power banks, earphones, and mobile accessories.

---

## Architecture Overview

```text
Customer Browser (React + TypeScript + Tailwind CSS)
                       │
             HTTPS REST Calls (Axios)
                       ▼
       Flask Application Factory (Python 3.12+)
   ├── Blueprints: auth, customer, campaign, spin, admin, claim, export
   ├── Service Layer: SpinService, OTPService, ClaimService, AdminService
   ├── Auth & Security: Flask-JWT-Extended, Marshmallow Validation
                       │
         Database Transactions & Row Locks
                       ▼
            PostgreSQL (or Local SQLite)
   ├── UNIQUE(customer_id, campaign_id) on Spins Table
   ├── Row-level locking (with_for_update) on Prize inventory
   └── UNIQUE(claim_code) for instant redemption verification
```

---

## Tech Stack

### Backend
- **Python 3.12+**
- **Flask** (Application Factory pattern with Blueprints)
- **Flask-SQLAlchemy** (ORM with row locking & constraints)
- **Flask-Migrate** (Alembic schema migrations)
- **PostgreSQL** (with psycopg2-binary, auto-fallback to SQLite for dev)
- **Flask-JWT-Extended** (Role-based customer & admin tokens)
- **Flask-CORS** (Secure origin filtering)
- **Marshmallow** (Strict input schemas & Indian mobile regex)
- **bcrypt** (Salted password hashing)
- **openpyxl** (Excel spreadsheet report generation)
- **pytest** (13 comprehensive automated unit & integration tests)

### Frontend
- **React 18** with **TypeScript**
- **Vite** (Ultra-fast bundler)
- **Tailwind CSS** (Custom theme with glassmorphism & neon accents)
- **Lucide React** (Modern iconography)
- **HTML5 Canvas** (Custom high-fidelity physics-eased animated Spin Wheel)
- **Web Audio API** (Segment ticker synthesizer)
- **canvas-confetti** (Celebratory particle bursts)
- **Axios** (JWT interceptors & error handlers)
- **React Router v6** (Protected admin and customer public layouts)

---

## Directory Structure

```text
mobile-hub/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/ (Navbar, Footer)
│   │   │   ├── customer/ (RegistrationModal, OTPModal, SocialTasksModal, EligibilityCard)
│   │   │   ├── wheel/ (SpinWheelCanvas)
│   │   │   └── result/ (ResultModal)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── SpinPage.tsx
│   │   │   ├── AdminLoginPage.tsx
│   │   │   └── admin/ (AdminDashboardPage, AdminCustomersPage, AdminPrizesPage, AdminCampaignPage, AdminClaimsPage)
│   │   ├── layouts/ (PublicLayout, AdminLayout)
│   │   ├── context/ (CustomerContext.tsx, AdminContext.tsx)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   └── router/ (AppRouter.tsx)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── __init__.py (Application Factory)
│   │   ├── config.py (Dev, Test, Prod configs)
│   │   ├── extensions.py (db, migrate, jwt, cors)
│   │   ├── models/ (Admin, Customer, OTP, Campaign, Prize, Spin)
│   │   ├── schemas/ (Marshmallow schemas)
│   │   ├── routes/ (auth, customer, campaign, spin, prize, admin, claim, export)
│   │   ├── services/ (spin, otp, customer, campaign, eligibility, prize, claim, admin, export)
│   │   ├── auth/ (Role-based JWT decorators)
│   │   └── utils/ (claim_code generator, API response standardizers)
│   ├── tests/ (13 pytest test suites)
│   ├── migrations/ (Flask-Migrate alembic directory)
│   ├── seed.py (Admin, Campaign, and Prize development seeder)
│   ├── run.py (Flask entrypoint)
│   ├── requirements.txt
│   └── .env.example
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Seed development Admin, Campaign, and Prizes
python seed.py

# Run development server (runs on http://127.0.0.1:5000)
python run.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

The frontend automatically proxies all `/api/*` calls to the Flask backend running on port 5000.

---

## Default Credentials

### Admin Portal
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@mobilehub.com`
- **Password**: `Admin@123`

### Development Mock OTP
When running in `development` or with `OTP_PROVIDER=mock`, the 6-digit OTP is automatically logged to the terminal console and shown in the UI modal hint banner for rapid testing.

---

## Running Automated Tests

Run the complete test suite verifying Registration, OTP verification, Rate Limiting, Eligibility, Spin Concurrency, Single-Spin Enforcement, Claim Verification, and Excel Export:

```bash
# From workspace root:
$env:PYTHONPATH="backend"
backend/venv/Scripts/pytest backend/tests -v
```

All 13 tests pass with 100% success rate:
- `test_valid_registration`
- `test_invalid_mobile_digits`
- `test_missing_name_or_address`
- `test_otp_send_and_verify`
- `test_otp_max_attempts`
- `test_otp_expiration`
- `test_full_spin_flow`
- `test_inventory_decrements_and_stockout`
- `test_claim_lookup_and_redemption`
- `test_invalid_claim_code`
- `test_admin_auth_and_dashboard`
- `test_admin_prize_crud`
- `test_excel_export`

---

## Running with Docker Compose

Deploy the complete stack (PostgreSQL 16, Flask Gunicorn backend, and Nginx frontend) with one command:

```bash
docker-compose up --build
```

- Public Campaign: `http://localhost:5173`
- Admin Portal: `http://localhost:5173/admin/login`
- Backend Health Check: `http://localhost:5000/api/health`

---

## Key Business Rules Enforced

1. **One Spin Per Mobile Number**:
   - Database level: `UNIQUE(customer_id, campaign_id)` constraint on `spins` table.
   - Transactional check prevents race conditions and concurrent requests from giving two prizes to the same user.
2. **Server-Side Weighted Probability**:
   - Client cannot select or tamper with the winning prize.
   - Only active prizes with `remaining_quantity > 0` and `weight > 0` are considered.
3. **Atomic Inventory Reservation**:
   - Row-level lock (`with_for_update()`) prevents negative stock under high concurrency.
4. **Claim Code Security**:
   - Generates unambiguous codes in format `MH-XXXXXX` (e.g. `MH-X8K29P`).
   - Claim status tracking: `GENERATED` -> `CLAIMED`. Re-redemption is strictly prevented.
5. **Excel Export**:
   - Generates styled `.xlsx` reports via `openpyxl` with auto-fit columns, borders, and timestamped statuses.
