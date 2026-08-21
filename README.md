# VetraIQ — AI-Powered Adaptive Industrial Product Intelligence & Catalog Automation

VetraIQ automatically converts unstructured industrial documents, manufacturer catalogs, and datasheets into clean, category-aware, and validated B2B product records. It implements truth-first AI extraction with source traceability, performs multi-level data validation, and generates tailored catalog sheets across multiple formats (JSON, CSV, PDF).

---

## 🎯 One-Sentence Pitch
> **VetraIQ automatically converts unstructured industrial documents and catalogs into structured, validated product records with confidence scores and source traceability, while flagging uncertain information for human review.**

---

## 🏗️ Technical Architecture & Pipeline

```text
       PDF / CSV Input (Datasheets & Catalog Rows)
                          │
                          ▼
                     INGESTION (PyMuPDF / pandas)
                          │
                          ▼
                     AI EXTRACTION (Groq LLM)
                          │
                          ▼
                     WEB ENRICHMENT (DuckDuckGo Search)
                          │
                          ▼
                     VALIDATION & DUPLICATE CHECKS
                          │
                          ▼
                     HUMAN-IN-THE-LOOP REVIEW
                          │
                          ▼
                ADAPTIVE CATEGORY SCHEMAS
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
          HARDWARE                  SOFTWARE
     (Physical specs table)   (Digital spec properties)
             │                         │
             └────────────┬────────────┘
                          ▼
                    EXPORTER LAYER
             ┌────────────┴────────────┐
             ▼                         ▼
       VetraIQ Export            UniHack Export
     (Adaptive JSON/PDF)       (EXACT 252 COLUMNS)
```

---

## ✨ Core Innovations & Key Differentiators

### 1. Schema Adaptability (No Rigid Templates)
Instead of forcing every product into a single database format, VetraIQ adapts its database schema dynamically based on the product category:
* **Hardware Products** (e.g., Valves, MCCBs, Motors) include physical attributes like *Material*, *Dimensions*, *Weight*, *Voltage/Power*, and *Compatible Parts*.
* **Software Products** (e.g., Queue Management Systems, Enterprise SaaS) dynamically omit physical attributes and instead surface software-specific technical specs (e.g., *API Integrations*, *Deployment Models*, *Security Compliance*).
* **Dynamic Custom Attributes**: Newly discovered category parameters are extracted by AI and dynamically appended as unique columns in the exported CSV.

### 2. "Knows When It Doesn't Know" (Truth-First Extraction)
Rather than fabricating or hallucinating missing fields (such as a missing SKU or Part Number), VetraIQ:
* Lowers confidence ratings to `0%`.
* Renders the status as `Not available`.
* Tags the item with a `Required field missing` validation flag.
* Surfaces it on the Review Panel for human approval.

### 3. Compliance-Verified Exporters
* **UniHack Official Submission Exporter**: Generates the exact 252-column output required for submission, preserving header order, names, and shape by mapping dynamic category attributes directly into `ATTRIBUTE_LABEL X`, `ATTRIBUTE_VALUE X`, and `ATTRIBUTE_UOM X` (up to 50 columns) while automatically parsing value metrics and units.
* **JSON**: Deep-nested, validated product data schema with source-page citations (e.g., `document:p1`).
* **PDF Catalog Sheets**: Generates clean, client-facing technical B2B datasheets via programmatically styled, isolated print frames.

---

## 🛠️ Technology Stack
* **Backend**: Python 3.11+, FastAPI, SQLAlchemy (SQLite database), PyMuPDF, Groq API (Llama 3 70B).
* **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Vite.
* **Testing**: pytest (unit and E2E integration tests).

---

## 🚀 Installation & Quick Start

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Create a `.env` file in the `backend` folder:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   DEMO_MODE=true
   ```
   > **Note:** Set `DEMO_MODE=true` for live judging to ensure immediate, zero-latency golden outputs for the Swagelok, Schneider Electric, and Siemens demo PDFs. Set to `false` for live AI processing of any custom PDF files.
5. Start the backend server:
   ```bash
   run_local.bat
   ```

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

### 3. Running Tests
Verify backend health and integration behavior:
```bash
cd backend
python -m pytest -v
```
All 11 tests should return green.
