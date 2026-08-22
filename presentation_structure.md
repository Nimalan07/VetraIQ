# VetraIQ — Final 8-Slide Pitch Deck

This pitch deck structure is designed for a strict 5-minute hackathon presentation, focusing on the core narrative of **AI-assisted product enrichment + normalization + validation + delivery-ready export**.

---

## 🎨 Presentation Theme & Design Guidelines
*   **Colors**: Sleek dark theme (pure black background `#090909`, white text, vibrant orange accent `#FF6B00` for highlights/branding, soft green `#10B981` for successful validation symbols).
*   **Typography**: Clean, modern sans-serif (e.g., Inter, Outfit, or Manrope).
*   **Visual Assets**: Always use actual app screenshots from the live dashboard and export screens rather than generic stock imagery.

---

## Slide 1 — Title Slide
### **VetraIQ: AI-Powered Industrial Product Intelligence**
> **Tagline**: Turning raw, fragmented industrial product data into structured, validated, and delivery-ready catalog data.

*   **Hackathon Track**: UniHack 2026 | AI-Powered Product Intelligence
*   **Live App Demo**: [vetra-iq-11.vercel.app](https://vetra-iq-11.vercel.app)
*   **Backend Live API**: `https://vetraiq.onrender.com`
*   **Visual Elements**: Large VetraIQ logo icon, central screenshot of the Dashboard, live link QR code, and a link to the GitHub repository.

---

## Slide 2 — The Problem
### **Industrial Product Data Is Messy**
Industrial distributors receive product sheets and catalogs from multiple sources, but they are rarely ready for digital commerce.

*   **The Raw Data Problem**: Incomplete descriptions, missing specs, non-standardized units, and flat tables.
    *   *Raw Input*: `"3M 775L Stikit Film P150 - Cubitron II 50 Disc/Box"`
*   **Visual Comparison**:
    *   **Before**: Messy text strings, missing attributes, and unparsed units (e.g., `5"`, `P150`).
    *   **After (Structured)**: Brand: `3M` | Product: `Stikit Film Disc` | Diameter: `5 in` | Grit: `P150` | Pack Size: `50 disc/box`.
*   **Business Impact**: Manual cleanup delays publishing, causes inconsistent catalogs, and limits online search/filtering.

---

## Slide 3 — The Solution
### **Meet VetraIQ: The AI-Powered Product Enrichment Pipeline**
VetraIQ takes raw industrial product information and converts it into structured, normalized, and validated product records.

*   **01 — Ingest**: Support for PDF datasheets and bulk CSV catalog files.
*   **02 — Extract**: Category-aware parsing of product specs and metadata.
*   **03 — Classify**: Dynamic classification of product categories (Department ➔ Class ➔ Fine).
*   **04 — Normalize**: Standardizing values, character casings, and unit symbols.
*   **05 — Validate**: Checking results against formatting rules, list-of-value constraints, and schema limits.
*   **06 — Export**: Instant generation of structured CSVs and review-ready PDF sheets.
*   **Visual Accent**: Screenshot of the main Dashboard highlighting processing stats (*Products Processed*, *High Confidence*, *Needs Review*, *Data Sources*).

---

## Slide 4 — How VetraIQ Works
### **From Raw Data to Product Intelligence**
A clean, horizontal diagram demonstrating the flow:

```text
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  RAW INPUT   │ ──>  │  INGESTION   │ ──>  │AI EXTRACTION │ ──>  │ CLASSIFICATION│
│  PDF / CSV   │      │ Parse / OCR  │      │ Product Data │      │   Category   │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                         │
┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│    EXPORT    │ <──  │  VALIDATION  │ <──  │NORMALIZATION │ <───────────┘
│  CSV / PDF   │      │ Rules / LOV  │      │ UOM / Values │
└──────────────┘      └──────────────┘      └──────────────┘
```
*   **Technology Foundation**:
    *   *Frontend*: React + TypeScript + Tailwind CSS (hosted on Vercel)
    *   *Backend*: FastAPI + Python + SQLite database (hosted on Render)
    *   *Pipeline*: Robust LLM-based extraction coupled with strict rule-based verification.

---

## Slide 5 — The Intelligence
### **Category-Aware Product Understanding**
Different products require different specifications. Instead of using 50 generic columns, VetraIQ dynamically identifies and extracts category-specific attributes.

*   **🔧 Hardware / Industrial Product (e.g., Sanding Disc)**:
    *   *Material* ➔ Cubitron II
    *   *Dimensions* ➔ 5 in
    *   *Grit* ➔ P150
    *   *Pack Size* ➔ 50 disc/box
*   **💻 Software / Digital Product (e.g., Catalog Software)**:
    *   *Deployment Model* ➔ Cloud
    *   *Supported Platform* ➔ Web
    *   *License Type* ➔ Subscription
    *   *Integration* ➔ REST API

---

## Slide 6 — Validation + Human Review
### **AI Output Is Not Enough. It Must Be Trustworthy.**
Raw LLM outputs cannot be blindly trusted. VetraIQ integrates a strict verification and human-in-the-loop audit layer:

*   **The Validation Suite**:
    *   *Schema Check*: Verifies all required delivery headers are intact.
    *   *UOM Normalization*: Auto-formats measurements (e.g., normalizes `5"` or `5 inches` to `5 in`).
    *   *LOV Constraints*: Validates field values against controlled vocabularies.
    *   *Description Audits*: Checks length and casing restrictions on mobile, invoice, and short descriptions.
*   **Confidence Routing**:
    *   *High Confidence* ➔ Accept automatically.
    *   *Low Confidence* ➔ Flag for human verification in the review directory.

---

## Slide 7 — Delivery & Export
### **From AI Output to Business-Ready Catalog**
One unified database record powering multiple commercial delivery formats.

*   **📊 Structured Data (Official Submission)**:
    *   Exports the official **252-column UniHack delivery CSV**.
    *   Includes standardized manufacturer names, brands, descriptions, warranty info, and 50 structured attribute slots.
*   **📄 Product Catalog Sheet (Review & Sales)**:
    *   Generates a high-fidelity **PDF Catalog Sheet** showcasing product identity, categorized specs, and validation compliance logs.
*   **Visual Accent**: Screenshot of the Export page highlighting the download cards for CSV and PDF.

---

## Slide 8 — Impact & Demo Flow
### **Making Industrial Product Data Ready for Commerce**

*   **The Shift**:
    *   *Before*: Manual catalog typing, inconsistent schemas, invalid units, and slow validation cycles.
    *   *After*: Automated ingestion, category-aware specs, standard units, and a clean human-in-the-loop directory.
*   **Live Demo Flow**:
    ```text
    Upload PDF/CSV ➔ AI Extraction ➔ Category Mapping ➔ UOM Validation ➔ Review Record ➔ Export CSV/PDF
    ```
*   **Call to Action**: Try the live pipeline with our preloaded datasets.
    *   *Web App*: `vetra-iq-11.vercel.app`
    *   *GitHub Repository*: `github.com/Nimalan07/VetraIQ`
