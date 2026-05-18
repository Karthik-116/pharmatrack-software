# PharmaTrack — Complete Project Handover File

> **Last Updated:** 2026-05-17
> **Project Path:** `d:\college projects\SE_software_engineering\pharmatrack-monorepo`

---

## 1. Project Overview

**PharmaTrack** is a full-stack web application that demonstrates cryptographic supply chain verification for pharmaceuticals. It uses QR codes with UUID-based tracking to prove a medicine is authentic and has not been tampered with or cloned.

### The Core Idea (One-Liner)
> A manufacturer prints a unique QR on each medicine strip. When a patient scans it for the **first time**, it's authentic. If scanned **again**, it's flagged as counterfeit (replay attack).

### The 3-Step Demo Flow
1. **SECURE BATCH (Manufacturer)** — Select a medicine, generate a batch (1 Parent Box QR + 4 Child Strip QRs). Download them.
2. **TRANSIT HUB (Logistics)** — Scan the Box QR to simulate a warehouse receiving the shipment. The system cascades the location update to all 4 strips inside.
3. **THE PATIENT (Consumer)** — Scan a Strip QR to verify authenticity. First scan = authentic + medicine details. Second scan of the same QR = **COUNTERFEIT ALERT** (replay attack detected).

### Why This Matters (Viva Talking Points)
- **Problem:** Counterfeit medicines kill ~1 million people/year (WHO). There's no easy way for a patient to verify authenticity at the point of purchase.
- **Solution:** Cryptographic one-time-use QR codes. Each strip gets a UUID. The first scan "consumes" it — any clone of that QR will always fail verification.
- **Key Security Feature:** The system also detects "impossible jumps" — if a strip hasn't gone through logistics (status is still CREATED/PACKED), it cannot be verified at the consumer end, catching supply chain bypasses.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | FastAPI (Python) | latest |
| **Database** | SQLite via SQLAlchemy ORM | sqlite3 |
| **API Validation** | Pydantic | v2 |
| **QR Generation (server)** | `qrcode` + `pillow` | latest |
| **RAG Embeddings** | SentenceTransformers (`all-MiniLM-L6-v2`) | latest |
| **LLM Synthesis** | Google Gemini API (`gemini-2.5-flash`) | latest |
| **Frontend Framework** | React | 19.2.4 |
| **Build Tool** | Vite | 8.0.1 |
| **CSS Framework** | Tailwind CSS v4 | 4.2.2 |
| **Animations** | Framer Motion | 12.38.0 |
| **QR Generation (client)** | `qrcode.react` | 4.2.0 |
| **QR Scanning (client)** | `html5-qrcode` | 2.3.8 |
| **Icons** | Lucide React | 0.577.0 |
| **HTTP Client** | Axios | 1.13.6 |

---

## 3. Project File Structure

```
pharmatrack-monorepo/
│
├── backend/
│   ├── main.py                 # FastAPI app — all 3 API endpoints
│   ├── models.py               # SQLAlchemy ORM models (MasterMedicine, Item, TrackingLog)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── database.py             # SQLite engine + session factory
│   ├── seed_medicines.py       # Seeds ~100+ medicines into the database
│   ├── requirements.txt        # Python dependencies
│   ├── pharmatrack_v2.db       # SQLite database file (auto-created)
│   ├── qrcodes/                # Server-side generated QR PNG files (auto-created)
│   └── venv/                   # Python virtual environment
│
├── frontend/
│   ├── index.html              # HTML entry point (loads Syne + Space Mono + Space Grotesk fonts)
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── postcss.config.js       # PostCSS config (loads @tailwindcss/postcss)
│   └── src/
│       ├── main.jsx            # React entry point — renders <App />
│       ├── App.jsx             # Root shell — nav widget + zone transitions + ContourField
│       ├── api.js              # Axios instance — baseURL: http://localhost:8000/api
│       ├── index.css           # Tailwind v4 @theme tokens + keyframes + utilities
│       └── components/
│           ├── ContourField.jsx      # Animated SVG topographic background
│           ├── DualScanner.jsx       # Camera + file-upload QR scanner
│           ├── ManufacturerZone.jsx   # Zone 1 — batch generation + QR gallery
│           ├── LogisticsZone.jsx      # Zone 2 — transit scan + CASCADE reveal
│           └── ConsumerZone.jsx       # Zone 3 — verify (authentic/counterfeit)
│
├── PharmaTrack-Test-Plan.docx  # Formal test plan document
└── .gitignore
```

---

## 4. Database Schema

### Table: `master_medicines`
Pre-seeded reference table of real Indian pharmaceutical products.

| Column | Type | Description |
|--------|------|-------------|
| `product_id` | String (PK) | Unique ID like `DOLO-0`, `AUGMENTIN-625-0` |
| `brand_name` | String | e.g., "Dolo", "Augmentin 625" |
| `generic_name` | String | e.g., "Paracetamol" |
| `composition` | String | e.g., "Paracetamol 250mg" |
| `primary_use` | String | What the medicine treats |
| `dosage_instructions` | Text | How to take it |
| `storage_conditions` | String | Storage requirements |
| `warning_side_effects` | Text | Safety warnings |
| `manufacturer_name` | String | e.g., "Micro Labs", "GSK" |

### Table: `items`
Every QR code (Box or Strip) that has been generated.

| Column | Type | Description |
|--------|------|-------------|
| `item_uuid` | String (PK) | Auto-generated UUID v4 — this IS the QR code value |
| `product_id` | String (FK → master_medicines) | Which medicine this belongs to |
| `item_type` | String | `"BOX"` or `"STRIP"` |
| `parent_uuid` | String (FK → items, nullable) | For strips: the UUID of the parent box |
| `status` | String | One of: `CREATED → PACKED → TRANSIT → DELIVERED → CONSUMED` |
| `current_location` | String (nullable) | Last known location from scanning |
| `scan_count` | Integer (default 0) | How many times a consumer has scanned this |

### Table: `tracking_logs`
Immutable audit trail of every scan event.

| Column | Type | Description |
|--------|------|-------------|
| `log_id` | Integer (PK, auto) | Log entry ID |
| `item_uuid` | String (FK → items) | Which item was scanned |
| `scanned_by` | String | Who scanned it (e.g., "Hub_Alpha_Logistics") |
| `timestamp` | DateTime | When the scan happened (UTC) |
| `location` | String | Where the scan happened |

### Entity Relationships
```
MasterMedicine (1) ←→ (Many) Item
Item (1) ←→ (Many) TrackingLog
Item (1 Box) ←→ (Many Strips) Item  [self-referential via parent_uuid]
```

---

## 5. API Endpoints

**Base URL:** `http://localhost:8000`
**Docs:** `http://localhost:8000/docs` (Swagger UI auto-generated by FastAPI)

### `GET /`
Health check. Returns: `{"message": "PharmaTrack backend is fully operational!"}`

---

### `POST /api/generate_batch`
Creates a new batch: 1 Box + N Strips (default 4).

**Request Body:**
```json
{
  "product_id": "DOLO-0",
  "strip_count": 4
}
```

**Response (200):**
```json
{
  "box_uuid": "a1b2c3d4-...",
  "strip_uuids": [
    "e5f6g7h8-...",
    "i9j0k1l2-...",
    "m3n4o5p6-...",
    "q7r8s9t0-..."
  ]
}
```

**Error (404):** If `product_id` doesn't exist in `master_medicines`.

**What it does internally:**
1. Looks up the medicine by `product_id`
2. Creates 1 `Item` row with `item_type=BOX`, `status=CREATED`
3. Creates 4 `Item` rows with `item_type=STRIP`, `parent_uuid` set to the box's UUID
4. Generates QR PNG files in `backend/qrcodes/batch_XXXXXX/`
5. Returns the UUIDs

---

### `POST /api/scan/transit`
Simulates a warehouse worker scanning the outer Box QR during shipment.

**Request Body:**
```json
{
  "item_uuid": "<box_uuid>",
  "scanned_by": "Hub_Alpha_Logistics",
  "location": "Transit_Warehouse_B"
}
```

**Response (200):**
```json
{"message": "Transit scan successful, cascade update applied."}
```

**What it does internally (CASCADE LOGIC):**
1. Finds the Box item by UUID
2. Updates box `status` → `TRANSIT`, `current_location` → the provided location
3. Creates a `TrackingLog` entry for the box
4. Finds ALL child strips via `parent_uuid`
5. Updates EACH child strip's `status` → `TRANSIT` and `current_location`
6. Creates `TrackingLog` entries for each child
7. **Result:** One box scan updates 5 rows total (1 box + 4 strips)

---

### `POST /api/scan/verify`
The patient scans a Strip QR to verify authenticity.

**Request Body:**
```json
{
  "item_uuid": "<strip_uuid>",
  "scanned_by": "Patient_Device",
  "location": "Consumer_Home"
}
```

**Response (200) — Authentic (first scan):**
```json
{
  "verified": true,
  "status_code": "SUCCESS",
  "security": {
    "scan_count": 1,
    "message": "Authentic Product. Digital seal broken."
  },
  "medicine_details": {
    "brand_name": "Dolo",
    "generic_name": "Paracetamol",
    "batch_number": "B-XXXXXX",
    "expiry_date": "2027-12-31",
    "manufacturer": "Micro Labs"
  },
  "usage_instructions": {
    "primary_use": "Fever and pain relief",
    "how_to_use": "Take 1 tablet every 6 hours...",
    "storage": "Store below 30°C...",
    "warnings": "May cause liver damage if overdosed..."
  }
}
```

**Error (403) — Counterfeit (second scan of same QR):**
```json
{"detail": "Alert: Product Already Consumed!"}
```

**Error (403) — Supply chain bypass:**
```json
{"detail": "Alert: Impossible Jump! Product bypassed logistics."}
```

**Error (404) — Unknown QR:**
```json
{"detail": "Product not found. Counterfeit detected."}
```

**Internal logic:**
1. Looks up the Strip by UUID (must be `item_type=STRIP`)
2. If `scan_count > 0` → **COUNTERFEIT** (already consumed)
3. If `status` is still `CREATED` or `PACKED` → **IMPOSSIBLE JUMP** (never went through logistics)
4. Otherwise → increments `scan_count`, sets `status=CONSUMED`, returns medicine details + usage info

---

### `POST /api/chat`
Provides AI Pharmacist consultation grounded in RAG clinical knowledge blocks across the full 20-item medicine catalog.

**Request Body:**
```json
{
  "product_id": "CHESTON-COLD-3",
  "query": "What should I do if I miss a dose?"
}
```

**Response (200):**
```json
{
  "answer": "For the Cheston Cold tablet you scanned...\n\nTake the missed dose as soon as you remember...",
  "product_id": "CHES-PLX",
  "confidence_score": 0.95
}
```

**Internal logic (Dynamic Catalog Mapping & 3-Tier Fallback Architecture):**
1. **Dynamic Catalog Binding:** The frontend `ConsumerZone.jsx` dynamically extracts the verified `product_id` (e.g., `CHESTON-COLD-3`, `DOLO-0`, `AUGMENTIN-625-0`) from the scan verification result, eliminating hardcoded fallbacks.
2. **Identity Mapping:** The backend `chat_endpoint` parses the raw product ID, matches the brand prefix (e.g., `CHESTON`), maps it to the canonical RAG ID (`CHES-PLX`), and retrieves exact clinical metadata (`Cheston Cold`, `Cetirizine + Paracetamol + Phenylephrine`).
3. **Tier 1 (SQLAlchemy pgvector):** Attempts vector similarity search via SQLAlchemy `pgvector` against Supabase `rag_chunks` table using `WHERE product_id = :pid`.
4. **Tier 2 (Supabase REST API):** If direct DB connection fails, falls back to Supabase REST API `rag_chunks?product_id=eq.{pid}`.
5. **Tier 3 (Local JSONL Fallback):** If REST API fails/RLS blocks, falls back to local in-memory cosine similarity against `medicines_data.jsonl`.
6. **Synthesis:** Synthesizes final clinical advice via `gemini-2.5-flash` with strict grounding prompts to guarantee zero hallucination.

---

## 6. Frontend Architecture

### Design System (Tailwind v4 `@theme`)
Defined in `index.css` using the `@theme` directive — no `tailwind.config.js` needed:

| Token | Hex | Tailwind Utility |
|-------|-----|------------------|
| `--color-void` | `#050505` | `bg-void`, `text-void` |
| `--color-bone` | `#F5F0EB` | `bg-bone`, `text-bone` |
| `--color-lime` | `#CDFF00` | `bg-lime`, `text-lime` |
| `--color-crimson` | `#FF003C` | `bg-crimson`, `text-crimson` |
| `--color-sage` | `#D4E4D0` | `bg-sage`, `text-sage` |
| `--color-cream` | `#FFF8F0` | `bg-cream`, `text-cream` |
| `--color-steel` | `#1A1A1A` | `bg-steel` |
| `--color-ash` | `#888888` | `text-ash` |

### Typography
| Role | Font | Utility |
|------|------|---------|
| Display headlines | **Syne** (700–800) | `font-display` |
| UUIDs/technical text | **Space Mono** (400) | `font-mono` |
| Body/labels | **Space Grotesk** (400–600) | `font-body` |

### Navigation
- **No top navbar.** Uses a fixed **bottom-right nav widget** with 3 zone buttons
- Active zone gets a lime left-bar indicator (uses Framer Motion `layoutId`)
- Widget adapts theme when consumer zone is active (white/sage instead of steel/lime)
- Widget can be collapsed by clicking the brand header

### Zone Transitions
- Uses Framer Motion `AnimatePresence` with `clipPath` polygon wipe transitions
- Background color smoothly animates between `#050505` (void) and `#FFF8F0` (cream)

### Component Details

#### `AuthGateway.jsx` (The Umani Ronchi + Lando Norris Editorial Luxury Gateway)
- **Exceptional Kinetic Entry Animation:** Combining the kinetic, modular brutality of Lando Norris's website (`landonorris.com`) with the sophisticated, edge-to-edge organic storytelling of Umani Ronchi's site.
- **Phase 1 (The Hook - Editorial Luxury):** Absolute `--void` black screen with two massive black doors meeting along a subtle vertical center seam (`w-[1px] bg-bone/10`). A towering, edge-to-edge Typographic Monolith lockup (`PHARMA` / `TRACK` in 120px+ display font) and a floating minimalist `[ ENTER VERIFICATION PORTAL ]` glass button hook the user instantly.
- **Phase 2 (The Split):** Clicking `[ ENTER VERIFICATION PORTAL ]` triggers a heavy spring physics sequence (`stiffness: 90, damping: 18`) where the left door snaps to `-100vw` and the right door snaps to `100vw`, physically splitting the monolith in half along the center seam.
- **Phase 3 (The Reveal):** Inside the gap, the background scales up (`0.92` to `1`), revealing the high-contrast Brutalist Login Architecture (`bg-bone`, `text-void`) with flawless responsive spacing, `whitespace-nowrap`, and zero overlap.
- **50/50 Kinetic Split Form (JWT Enabled):** Left column features massive `PHARMATRACK` typography (`Syne 800, 90px+`), an `LN4`-style kinetic sub-headline container with spinning star accents, and live activity tickers. Right column features a clean state toggle (`Login` / `Sign Up`), stark borderless inputs (`Email`, `Password`, `Full Name`), a demo quick-fill button, and brutalist error/success banners (`--crimson` / `--lime`).
- **Production JWT Authentication Loop:** Submitting the form triggers Axios API requests (`/api/auth/login` or `/api/auth/signup`) to the FastAPI backend. On successful login, the JWT access token is stored in `localStorage`, followed by the reverse-swallow cinematic animation where the doors smoothly slam back shut to the center seam (`ease: [0.22, 1, 0.36, 1]`) before firing `onEnterSystem(email)` to reveal the main application.


#### `ContourField.jsx`
- Fixed-position SVG background with animated topographic contour lines
- Two parallax layers drifting at different speeds (50s and 70s CSS animation cycles)
- Accepts `variant` prop: `'dark'` (lime contours) or `'organic'` (sage contours)

#### `DualScanner.jsx`
- Supports **two modes**: Camera (live viewfinder) and File Upload (drag-and-drop or click-to-browse)
- File upload uses `Html5Qrcode.scanFile()` — critical for laptop-based demo evaluations
- Accepts `variant` prop: `'dark'` (lime accents) or `'organic'` (sage accents)
- Sharp-edged brutalist design — no border-radius

#### `ManufacturerZone.jsx`
- **First-Time Operator Banner:** Pulsing top-level alert explaining terminal usage; permanently dismisses after batch generation.
- **Split-Screen Layout:** Left column houses giant "SECURE BATCH" typography, Active Production Target readout, Strip Count slider (2 to 10), and the Compile button. Right column conditionally renders either the Master Ledger Explorer or the Cryptographic Bundle Engine.
- **Master Ledger Explorer:** Tactical search interface displaying the full `MASTER_CATALOG` (9 pre-seeded pharma targets including Dolo, Augmentin, Lipigard, Glycomet, Pan-D, etc.) with real-time text search and category filtering.
- **Cryptographic Bundle Engine:** Renders the Parent Box UUID and a dynamic grid of child strip QRs matching the user's selected strip count. Each QR features direct canvas-to-PNG download capability.

#### `LogisticsZone.jsx`
- Split-screen: left = typography + narrative, right = DualScanner (dark variant)
- On success: full-screen kinetic "CASCADE" text (200px font) slides in + animated timeline strip
- Timeline nodes: MANUFACTURED → IN TRANSIT → WAREHOUSE → DISPENSED

#### `ConsumerZone.jsx`
- **Scanning state:** Cream background, pastel blur circles, DualScanner in organic variant
- **Authentic result:** Two-column editorial layout — left = huge medicine name + batch/expiry, right = usage instructions (primary use, dosage, warnings, storage)
- **Counterfeit result:** Background flash-cuts to black, giant "COUNTERFEIT" text with CSS glitch animation (RGB split text-shadow + position jitter), red flashing border frame, "Replay Attack Detected" label

---

## 7. Available Product IDs in the Database

The `seed_medicines.py` script seeds 20 unique base medicine brands across 200 total product variations/batches. All 20 base medicines are fully exposed in the frontend Master Ledger Explorer:

| product_id | Brand Name | Generic Name | Manufacturer | Category |
|-----------|------------|--------------|--------------|----------|
| `DOLO-0` | Dolo | Paracetamol | Micro Labs | Antipyretic |
| `CROCIN-ADVANCE-1` | Crocin Advance | Paracetamol | GSK | Antipyretic |
| `COMBIFLAM-2` | Combiflam | Ibuprofen + Paracetamol | Sanofi | Analgesic |
| `ULTRACET-3` | Ultracet | Tramadol + Paracetamol | Dr. Reddy | Analgesic |
| `AUGMENTIN-625-0` | Augmentin 625 | Amoxicillin + Clavulanate | GSK | Antibiotic |
| `AZITHRAL-500-1` | Azithral 500 | Azithromycin | Alembic | Antibiotic |
| `MONOCEF-O-2` | Monocef-O | Cefpodoxime | Aristo | Antibiotic |
| `ACIVIR-3` | Acivir | Acyclovir | Cipla | Antiviral |
| `TELMIKIND-H-0` | Telmikind-H | Telmisartan + Hydrochlorothiazide | Mankind | Cardiovascular |
| `GLYCOMET-GP-2-1` | Glycomet-GP 2 | Glimepiride + Metformin | USV | Antidiabetic |
| `CONCOR-5-2` | Concor 5 | Bisoprolol | Merck | Cardiovascular |
| `ATORVA-20-3` | Atorva 20 | Atorvastatin | Zydus | Lipid-Lowering |
| `PAN-D-0` | Pan-D | Pantoprazole + Domperidone | Alkem | Gastrointestinal |
| `OMEE-1` | Omee | Omeprazole | Alkem | Gastrointestinal |
| `GELUSIL-2` | Gelusil | Magnesium Hydroxide + Aluminium Hydroxide | Pfizer | Antacid |
| `RIFAGUT-3` | Rifagut | Rifaximin | Sun Pharma | Gastrointestinal |
| `ALLEGRA-120-0` | Allegra 120 | Fexofenadine | Sanofi | Antihistamine |
| `MONTAIR-LC-1` | Montair-LC | Montelukast + Levocetirizine | Cipla | Asthma / Allergy |
| `ASTHALIN-2` | Asthalin | Salbutamol | Cipla | Bronchodilator |
| `CHESTON-COLD-3` | Cheston Cold | Cetirizine + Paracetamol + Phenylephrine | Cipla | Cold & Flu |

These 20 form the complete interactive catalog for Secure Batch generation, matching the exact base records seeded in the SQLite database.

---

## 8. Security Logic Explained

### One-Time QR Verification (Anti-Counterfeiting)
1. Each strip gets a unique UUID when generated
2. `scan_count` starts at 0
3. First consumer scan: `scan_count` becomes 1, `status` becomes `CONSUMED` → **AUTHENTIC**
4. Any subsequent scan: `scan_count > 0` → **COUNTERFEIT / REPLAY ATTACK**
5. Even if someone photocopies or screenshots the QR, the second scan fails

### Impossible Jump Detection (Supply Chain Integrity)
1. A freshly generated strip has `status = CREATED`
2. It must go through `TRANSIT` (via the logistics scan) before consumer verification
3. If a consumer tries to verify a strip that's still `CREATED` or `PACKED`, the API returns 403: "Product bypassed logistics"
4. This catches scenarios where strips are stolen directly from the factory

### Cascade Update (Box → Strips)
1. At the logistics hub, only the outer Box QR is scanned (not individual strips)
2. The API finds all strips with `parent_uuid = box_uuid`
3. All children are updated to `TRANSIT` in one transaction
4. This simulates real-world logistics where you scan the outer carton, not each pill

---

## 9. Database Details

- **Engine:** SQLite (file-based, no server needed)
- **Database file:** `backend/pharmatrack_v2.db`
- **Connection string:** `sqlite:///./pharmatrack_v2.db`
- **ORM:** SQLAlchemy with `declarative_base()`
- **Session management:** `get_db()` dependency injection in FastAPI
- Tables are auto-created on startup via `Base.metadata.create_all(bind=engine)`
- If you delete `pharmatrack_v2.db` and re-run the seed script, you get a clean database

---

## 10. Key Design Decisions & Why

| Decision | Reasoning |
|----------|-----------|
| SQLite instead of PostgreSQL | Zero-config for demo. No DB server to install. |
| UUID v4 for QR values | Cryptographically random, impossible to guess next ID |
| `scan_count` field | Simple but effective replay attack detection |
| Parent-child Box→Strip model | Mirrors real pharma packaging hierarchy |
| Cascade on box scan | Real logistics: you scan the outer carton, not each strip |
| Tailwind v4 `@theme` directive | No `tailwind.config.js` needed — cleaner setup |
| `html5-qrcode` for scanning | Works with both camera AND static file upload |
| `qrcode.react` for generation | Renders QR as HTML5 Canvas — downloadable as PNG |
| Framer Motion for transitions | `AnimatePresence`, `clipPath`, spring physics |
| Bottom-right nav widget | Brutalist/editorial aesthetic — not a generic SaaS navbar |

---

## 11. Known Limitations & Future Scope

| Limitation | Potential Fix |
|-----------|--------------|
| SQLite is single-threaded | Migrate to PostgreSQL for production |
| Expiry date is hardcoded (`2027-12-31`) | Add `expiry_date` field to `MasterMedicine` model |
| No user authentication | Add JWT-based auth for manufacturer/logistics roles |
| No real GPS location | Integrate browser Geolocation API |
| CORS is `allow_origins=["*"]` | Restrict to frontend domain in production |
| QR PNGs are saved to disk but not served | Add a `/qrcodes/<filename>` static file route |
| Only 4 medicines in the frontend UI | All ~100+ are in the DB — just expand the `MEDICINES` array |

---

## 12. How to Run the Project

### Prerequisites
- **Python 3.9+** installed
- **Node.js 18+** and **npm** installed
- A terminal (PowerShell on Windows, Terminal on Mac/Linux)

### Step 1: Start the Backend

```bash
# Navigate to the backend directory
cd "d:\college projects\SE_software_engineering\pharmatrack-monorepo\backend"

# Create and activate virtual environment (first time only)
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies (first time only)
pip install -r requirements.txt

# Seed the database with medicines (first time only, or after deleting the .db file)
python seed_medicines.py

# Start the FastAPI server
uvicorn main:app --reload
```

**Backend will be running at:** `http://localhost:8000`
**API docs at:** `http://localhost:8000/docs`

### Step 2: Start the Frontend

```bash
# Open a NEW terminal window
cd "d:\college projects\SE_software_engineering\pharmatrack-monorepo\frontend"

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

**Frontend will be running at:** `http://localhost:5173`

### Step 3: Run the Demo Flow

1. Open `http://localhost:5173` in your browser
2. **Zone 1 (SECURE BATCH):** Select a medicine → Click "GENERATE BATCH" → Download the Box QR and a Strip QR
3. **Zone 2 (TRANSIT HUB):** Click "02 TRANSIT HUB" in the nav widget → Upload the **Box QR image** → See "CASCADE" success
4. **Zone 3 (THE PATIENT):** Click "03 THE PATIENT" → Upload a **Strip QR image** → See authentic result with medicine details
5. **Counterfeit Test:** Upload the **same Strip QR image again** → See the red COUNTERFEIT glitch alert

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Medicine not found" error | Run `python seed_medicines.py` to seed the database |
| Frontend can't connect to backend | Make sure backend is running on port 8000 |
| "CORS error" in console | Backend already has `allow_origins=["*"]` — restart uvicorn |
| Camera not working | Use File Upload mode instead (works on all laptops) |
| QR scan says "Product not found" | Make sure you're scanning a QR generated by THIS system |
| Build fails | Run `npm install` first, then `npm run build` |
| Database is corrupted | Delete `pharmatrack_v2.db`, re-run `python seed_medicines.py` and `uvicorn main:app --reload` |

---

*End of Handover File.*
