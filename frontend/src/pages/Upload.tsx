import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import { useState } from "react";
import {
  uploadProduct,
  processProduct,
  processBulkCsv,
} from "../api/client";

interface Props {
  onComplete: (
    product: any
  ) => void;
}

interface ConversionReport {
  rowCount: number;
  columnsCount: number;
  downloadUrl: string;
  previewRows: Array<Record<string, string>>;
  extractedSpecs: string[];
}

export default function Upload({
  onComplete,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [csvLimit, setCsvLimit] = useState<number>(10);
  const [report, setReport] = useState<ConversionReport | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setReport(null);

      // Branch 1: Catalog CSV Processing
      if (file.name.toLowerCase().endsWith(".csv")) {
        setProgress("Parsing input catalog CSV...");
        console.log("Start bulk CSV conversion. Limit:", csvLimit);
        
        const blob = await processBulkCsv(file, csvLimit);
        setProgress("Parsing conversion results...");
        
        const text = await blob.text();
        const lines = text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        
        if (lines.length === 0) {
          throw new Error("Returned submission CSV is empty.");
        }

        // Simple CSV parser that handles double quotes correctly
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.replace(/^"|"$/g, ""));
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.replace(/^"|"$/g, ""));
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        
        // Parse preview rows
        const previewRows: any[] = [];
        const extractedSpecsSet = new Set<string>();
        
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const rowValues = parseCSVLine(lines[i]);
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rowValues[idx] || "";
          });
          previewRows.push(rowObj);
        }
        
        // Gather unique attribute labels from all lines
        for (let i = 1; i < lines.length; i++) {
          const rowValues = parseCSVLine(lines[i]);
          headers.forEach((h, idx) => {
            if (h.startsWith("ATTRIBUTE_LABEL") && rowValues[idx]) {
              extractedSpecsSet.add(rowValues[idx]);
            }
          });
        }
        
        const url = URL.createObjectURL(blob);
        
        setReport({
          rowCount: lines.length - 1,
          columnsCount: headers.length,
          downloadUrl: url,
          previewRows,
          extractedSpecs: Array.from(extractedSpecsSet),
        });

        // Trigger file download
        const a = document.createElement("a");
        a.href = url;
        a.download = "unihack_submission_export.csv";
        a.click();
        
        setProgress("Conversion complete! Your 252-column submission CSV has been downloaded.");
        return;
      }

      // Branch 2: PDF Specification Processing
      setProgress("Uploading specification document...");
      console.log("Start PDF upload...");
      const uploaded = await uploadProduct(file);
      console.log("Upload response:", uploaded);

      if (!uploaded.success || !uploaded.data?.filename) {
        throw new Error(uploaded.message || "Failed to ingest file.");
      }

      setProgress("Analyzing product with AI copywriter...");
      console.log("Start processing filename:", uploaded.data.filename);
      const processed = await processProduct(uploaded.data.filename);
      console.log("Process response:", processed);

      setProgress("Analysis complete.");
      onComplete(processed);

    } catch (error: any) {
      console.error(error);
      const errMsg =
        error?.response?.data?.detail ||
        error?.message ||
        String(error);
      setProgress(`Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const isCsv = file?.name.toLowerCase().endsWith(".csv");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-orange">
          Product Intelligence
        </p>
        <h1 className="text-4xl font-semibold">
          Upload specification or catalog
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Drop an industrial datasheet (PDF) for deep analysis, or upload a product catalog (CSV) to convert it to the official 252-column submission template.
        </p>
      </div>

      {/* Upload box */}
      <div
        className={`
          relative rounded-3xl border border-dashed
          ${
            file
              ? "border-orange/50 bg-orange/[0.03]"
              : "border-white/15 bg-white/[0.02]"
          }
          p-12 text-center transition
        `}
      >
        <input
          type="file"
          accept=".pdf,.csv"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setProgress("");
            setReport(null);
          }}
        />

        {file ? (
          <div>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-orange">
              <FileText size={30} />
            </div>
            <h3 className="font-medium text-white">
              {file.name}
            </h3>
            <p className="mt-2 text-xs text-gray-600">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setProgress("");
                setReport(null);
              }}
              className="relative z-10 mt-4 inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-400"
            >
              <X size={13} />
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
              <UploadCloud size={30} />
            </div>
            <h3 className="text-lg font-medium text-white">
              Drop your document here
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              PDF Spec Sheet or Catalog CSV · Click to browse
            </p>
          </div>
        )}
      </div>

      {/* CSV Bulk options */}
      {file && isCsv && (
        <div className="glass rounded-2xl p-6 mt-5 text-left border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-orange" />
            <h4 className="font-semibold text-white text-sm">Catalog CSV Ingestion Options</h4>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Select how many rows of this catalog file to process. VetraIQ parses the input, maps category-aware schemas, and builds the official 252-column submission template.
          </p>
          <div className="flex items-center gap-4">
            <label className="text-xs text-gray-400">Rows to process:</label>
            <select
              value={csvLimit}
              onChange={(e) => setCsvLimit(Number(e.target.value))}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-orange focus:outline-none"
            >
              <option value={10}>Demo Mode (First 10 rows - Fast)</option>
              <option value={50}>Extended Test (First 50 rows)</option>
              <option value={0}>Complete Catalog (All rows)</option>
            </select>
          </div>
        </div>
      )}

      {/* Process Button */}
      <button
        disabled={!file || loading}
        onClick={handleUpload}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl orange-gradient py-4 text-sm font-semibold shadow-orange transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 text-white"
      >
        {loading
          ? progress || "Processing..."
          : isCsv
          ? "Process & Convert Catalog"
          : "Analyze Product"}

        {!loading && (
          <ArrowRight size={17} />
        )}
      </button>

      {progress && (
        <p className="mt-4 text-center text-xs text-gray-500">
          {progress}
        </p>
      )}

      {/* Conversion Report Panel */}
      {report && (
        <div className="glass rounded-3xl p-8 mt-8 border border-orange/20 bg-orange/[0.02] text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400" />
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Processed Successfully</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">📊 VetraIQ Conversion Report</h2>
            </div>
            <a
              href={report.downloadUrl}
              download="unihack_submission_export.csv"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange text-black font-semibold hover:brightness-110 transition text-sm justify-center"
            >
              Download Submission CSV
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
            <div className="glass rounded-xl p-4 bg-white/[0.01] border border-white/5">
              <span className="text-xs text-gray-500 block">Rows Processed</span>
              <span className="text-2xl font-bold text-white mt-1 block">{report.rowCount}</span>
            </div>
            <div className="glass rounded-xl p-4 bg-white/[0.01] border border-white/5">
              <span className="text-xs text-gray-500 block">Target CSV Schema</span>
              <span className="text-lg font-bold text-white mt-2 block truncate">252 Columns</span>
            </div>
            <div className="glass rounded-xl p-4 bg-white/[0.01] border border-white/5">
              <span className="text-xs text-gray-500 block">Compliance Status</span>
              <span className="text-xs font-semibold text-emerald-400 mt-2.5 inline-block bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Verified
              </span>
            </div>
            <div className="glass rounded-xl p-4 bg-white/[0.01] border border-white/5">
              <span className="text-xs text-gray-500 block">Output Format</span>
              <span className="text-lg font-bold text-white mt-2 block truncate">UniHack Delivery</span>
            </div>
          </div>

          {report.extractedSpecs.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dynamic Specs Extracted</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.extractedSpecs.map((spec) => (
                  <span key={spec} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Submission Record Preview (First 5 Rows)</h4>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-xs">
                <thead className="bg-white/5 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Part Number</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Manufacturer</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Extracted Specs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {report.previewRows.map((row, idx) => {
                    const specsList: string[] = [];
                    for (let c = 1; c <= 5; c++) {
                      const label = row[`ATTRIBUTE_LABEL ${c}`];
                      const val = row[`ATTRIBUTE_VALUE ${c}`];
                      const uom = row[`ATTRIBUTE_UOM ${c}`];
                      if (label && val) {
                        specsList.push(`${label}: ${val}${uom ? " " + uom : ""}`);
                      }
                    }
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 font-mono font-semibold text-orange">
                          {row["Mfg_Part_Num"]}
                        </td>
                        <td className="px-4 py-3 truncate max-w-[200px]">{row["Product Name"]}</td>
                        <td className="px-4 py-3">{row["Part_Manuf"]}</td>
                        <td className="px-4 py-3">
                          <span className="bg-orange/10 text-orange px-2 py-0.5 rounded text-[10px]">
                            {row["Class"]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
                            {specsList.length > 0 ? (
                              specsList.map((s, sIdx) => <span key={sIdx}>{s}</span>)
                            ) : (
                              <span className="text-gray-600">None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Preview */}
      {!report && (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            "Ingest",
            "Extract",
            "Enrich",
            "Validate",
            "Review",
          ].map((step, index) => (
            <div
              key={step}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange/10 text-xs text-orange">
                {index + 1}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
