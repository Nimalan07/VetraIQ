import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  Sparkles,
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

export default function Upload({
  onComplete,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [csvLimit, setCsvLimit] = useState<number>(10);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      // Branch 1: Catalog CSV Processing
      if (file.name.toLowerCase().endsWith(".csv")) {
        setProgress("Parsing input catalog CSV...");
        console.log("Start bulk CSV conversion. Limit:", csvLimit);
        
        const blob = await processBulkCsv(file, csvLimit);
        setProgress("Mapping dynamically to official 252-column submission schema...");
        
        // Download the E2E processed CSV blob
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "unihack_submission_export.csv";
        a.click();
        URL.revokeObjectURL(url);
        
        setProgress("Conversion complete! Compliance-verified 252-column CSV downloaded.");
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

      {/* Pipeline Preview */}
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
    </div>
  );
}
