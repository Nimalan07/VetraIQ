import {
  FileJson,
  FileSpreadsheet,
  FileText,
  Download,
} from "lucide-react";
import { normalizeProduct } from "../api/normalizeProduct";
import type { ProductResponse } from "../types/product";

interface Props {
  product: ProductResponse | null;
}

export default function Export({ product }: Props) {
  const norm = product ? normalizeProduct(product) : null;
  
  // Categorize product type to filter properties
  const categoryLower = (norm?.category || "").toLowerCase();
  const isSoftwareOrDigital = 
    categoryLower.includes("software") || 
    categoryLower.includes("service") || 
    categoryLower.includes("digital") ||
    categoryLower.includes("platform") ||
    categoryLower.includes("cloud") ||
    categoryLower.includes("app");

  const exportData = (format: "json" | "csv") => {
    const data = (() => {
      if (!norm) {
        // High quality fallback dataset for demo fallback
        return {
          product_name: "General Service Ball Valves, GB Series",
          manufacturer: "Swagelok",
          category: "Ball Valve",
          sku_part_number: "Not available",
          description: "Not available",
          price: "Not available",
          material: "316/316L, Alloy 2507, Alloy 625, Alloy 825, 6-Moly, Alloy C-276",
          dimensions: "Not available",
          weight: "Not available",
          voltage_power_rating: "Not available",
          certifications: "API 607, NACE MR0175/ISO 15156",
          compatible_parts: "Not available",
        };
      }

      // Base fields always present
      const baseFields: Record<string, string> = {
        product_name: norm.productName || "Unknown Product",
        manufacturer: norm.manufacturer || "Unknown manufacturer",
        category: norm.category || "Uncategorized",
        sku_part_number: norm.sku || "Not available",
        description: norm.description || "Not available",
        price: norm.price || "Not available",
      };

      // Physical fields only present if NOT software
      const physicalFields: Record<string, string> = !isSoftwareOrDigital ? {
        material: Array.isArray(norm.material) ? norm.material.join(", ") : (norm.material || "Not available"),
        dimensions: norm.dimensions || "Not available",
        weight: norm.weight || "Not available",
        voltage_power_rating: norm.voltagePowerRating || "Not available",
        compatible_parts: norm.compatibleParts || "Not available",
      } : {};

      // Certifications row (conditional for software if populated)
      const certificationsField: Record<string, string> = (!isSoftwareOrDigital || (norm.certifications && norm.certifications.length > 0)) ? {
        certifications: Array.isArray(norm.certifications) ? norm.certifications.join(", ") : (norm.certifications || "Not available"),
      } : {};

      // Dynamic Category Attributes (adds any dynamically AI-extracted custom parameters as dynamic columns)
      const customFields: Record<string, string> = {};
      Object.entries(norm.customAttributes).forEach(([key, attr]: [string, any]) => {
        customFields[key] = String(attr?.value !== null ? attr.value : "Not available");
      });

      return {
        ...baseFields,
        ...physicalFields,
        ...certificationsField,
        ...customFields,
      };
    })();

    const content =
      format === "json"
        ? JSON.stringify(data, null, 2)
        : Object.keys(data).join(",") +
          "\n" +
          Object.values(data)
            .map(val => {
              const strVal = String(val);
              if (strVal.includes(",") || strVal.includes('"') || strVal.includes("\n")) {
                return `"${strVal.replace(/"/g, '""')}"`;
              }
              return strVal;
            })
            .join(",");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanName = (norm?.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    link.download = `${cleanName}_export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!norm) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate specifications table rows dynamically
    const specsRows = [
      `<tr><td><strong>Product Name</strong></td><td>${norm.productName || "Not available"}</td></tr>`,
      `<tr><td><strong>Manufacturer</strong></td><td>${norm.manufacturer || "Not available"}</td></tr>`,
      `<tr><td><strong>Category</strong></td><td>${norm.category || "Not available"}</td></tr>`,
      `<tr><td><strong>SKU / Part Number</strong></td><td>${norm.sku || "Not available"}</td></tr>`,
      `<tr><td><strong>Description</strong></td><td>${norm.description || "Not available"}</td></tr>`,
      `<tr><td><strong>Price</strong></td><td>${norm.price || "Not available"}</td></tr>`,
    ];

    if (!isSoftwareOrDigital) {
      specsRows.push(
        `<tr><td><strong>Material</strong></td><td>${Array.isArray(norm.material) ? norm.material.join(", ") : (norm.material || "Not available")}</td></tr>`,
        `<tr><td><strong>Dimensions</strong></td><td>${norm.dimensions || "Not available"}</td></tr>`,
        `<tr><td><strong>Weight</strong></td><td>${norm.weight || "Not available"}</td></tr>`,
        `<tr><td><strong>Voltage / Power Rating</strong></td><td>${norm.voltagePowerRating || "Not available"}</td></tr>`,
        `<tr><td><strong>Compatible Parts</strong></td><td>${norm.compatibleParts || "Not available"}</td></tr>`
      );
    }

    if (!isSoftwareOrDigital || (norm.certifications && norm.certifications.length > 0)) {
      specsRows.push(
        `<tr><td><strong>Certifications / Compliance</strong></td><td>${Array.isArray(norm.certifications) ? norm.certifications.join(", ") : (norm.certifications || "Not available")}</td></tr>`
      );
    }

    // Add custom specifications
    Object.entries(norm.customAttributes).forEach(([key, attr]: [string, any]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const value = String(attr?.value !== null ? attr.value : "Not available");
      specsRows.push(`<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`);
    });

    const flagsList = norm.validation.flags.length > 0
      ? norm.validation.flags.map(f => `<li>${f}</li>`).join("")
      : "<li>No validation issues detected. Product catalog record is clean.</li>";

    printWindow.document.write(`
      <html>
        <head>
          <title>${norm.productName || "Product Report"}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            .header-bar {
              background: linear-gradient(135deg, #1f2937, #111827);
              color: #ffffff;
              padding: 24px;
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .header-bar h1 {
              margin: 0;
              font-size: 24px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-bar p {
              margin: 8px 0 0 0;
              font-size: 14px;
              color: #9ca3af;
            }
            h2 {
              font-size: 18px;
              color: #ea580c;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
              margin-top: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px 12px;
              text-align: left;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            ul {
              padding-left: 20px;
              font-size: 13px;
            }
            li {
              margin-bottom: 6px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <h1>VetraIQ Product Intelligence Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} · Source: ${norm.sourceReference || "Direct Input"}</p>
          </div>

          <h2>Product Technical Catalog Sheet</h2>
          <table>
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="width: 30%;">Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${specsRows.join("")}
            </tbody>
          </table>

          <h2>Validation & Quality Control</h2>
          <ul>
            ${flagsList}
          </ul>

          <div class="footer">
            VetraIQ Platform © 2026. All rights reserved. Confidential catalog data sheet.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-orange">
          Data Export
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          Export your catalog
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Download validated product information in a format ready for B2B publication or database ingestion.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* JSON Card */}
        <button
          onClick={() => exportData("json")}
          disabled={!norm}
          className={`glass group rounded-2xl p-7 text-left transition ${
            norm ? "hover:border-orange/30 cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <FileJson />
          </div>
          <h2 className="font-semibold text-white">JSON Record</h2>
          <p className="mt-2 text-sm text-gray-600">
            Structured B2B product data schema with full traceability.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-orange">
            {norm ? "Download JSON" : "Select product first"}
            {norm && <Download size={14} />}
          </div>
        </button>

        {/* CSV Card */}
        <button
          onClick={() => exportData("csv")}
          disabled={!norm}
          className={`glass group rounded-2xl p-7 text-left transition ${
            norm ? "hover:border-orange/30 cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <FileSpreadsheet />
          </div>
          <h2 className="font-semibold text-white">CSV Spreadsheet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Adapts columns dynamically (Hardware vs. Software) with custom fields.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-orange">
            {norm ? "Download CSV" : "Select product first"}
            {norm && <Download size={14} />}
          </div>
        </button>

        {/* PDF Card */}
        <button
          onClick={exportPDF}
          disabled={!norm}
          className={`glass group rounded-2xl p-7 text-left transition ${
            norm ? "hover:border-orange/30 cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <FileText />
          </div>
          <h2 className="font-semibold text-white">PDF Catalog Sheet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Printable publication-ready technical datasheet report.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-orange">
            {norm ? "Generate PDF" : "Select product first"}
            {norm && <Download size={14} />}
          </div>
        </button>
      </div>
    </div>
  );
}
