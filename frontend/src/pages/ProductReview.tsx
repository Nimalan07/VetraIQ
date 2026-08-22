import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Printer,
  FileText,
  BookOpen,
  ArrowLeft,
  Search,
  ListFilter,
  RefreshCw,
} from "lucide-react";

import ProductFieldComponent from "../components/ProductField";
import ValidationFlags from "../components/ValidationFlags";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { normalizeProduct } from "../api/normalizeProduct";
import { generateCatalogSheet, getAllProducts } from "../api/client";

import type { ProductResponse } from "../types/product";

interface Props {
  product: ProductResponse | null;
  onSelectProduct?: (product: ProductResponse | null) => void;
}

const calculateAvgConfidence = (core: any) => {
  const confidences: number[] = [];
  for (const field of ["product_name", "brand_manufacturer", "category", "sku_part_number", "description"]) {
    const f_conf = core[field]?.confidence;
    if (typeof f_conf === "number") {
      confidences.push(f_conf);
    }
  }
  return confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.95;
};

export default function ProductReview({
  product,
  onSelectProduct,
}: Props) {
  const [activeTab, setActiveTab] = useState<"review" | "sheet">("review");
  const [sheetContent, setSheetContent] = useState<string>("");
  const [isLoadingSheet, setIsLoadingSheet] = useState<boolean>(false);
  const [sheetError, setSheetError] = useState<string>("");

  // Directory states
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "needs_review">("all");

  useEffect(() => {
    // Reset state when product changes
    setSheetContent("");
    setSheetError("");
    setActiveTab("review");
  }, [product]);

  useEffect(() => {
    if (activeTab === "sheet" && !sheetContent && product?.source_reference) {
      setIsLoadingSheet(true);
      setSheetError("");
      generateCatalogSheet(product.source_reference)
        .then(res => {
          if (res.success) {
            setSheetContent(res.markdown);
          } else {
            setSheetError("Could not retrieve catalog sheet from server.");
          }
        })
        .catch(err => {
          console.error(err);
          setSheetError("Failed to connect to the server to generate catalog sheet.");
        })
        .finally(() => {
          setIsLoadingSheet(false);
        });
    }
  }, [activeTab, sheetContent, product]);

  // Fetch all products when directory is active
  useEffect(() => {
    if (!product) {
      setLoadingList(true);
      getAllProducts()
        .then((data) => {
          if (Array.isArray(data)) {
            setProductsList(data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch products:", err);
        })
        .finally(() => {
          setLoadingList(false);
        });
    }
  }, [product]);

  if (!product) {
    const filteredList = productsList.filter((p) => {
      const extra = p.extraction || {};
      const core = extra.core_fields || {};
      
      const name = (core.product_name?.value || p.source_reference || "").toLowerCase();
      const mfg = (core.brand_manufacturer?.value || "").toLowerCase();
      const category = (core.category?.value || "").toLowerCase();
      
      const matchesSearch = 
        name.includes(searchQuery.toLowerCase()) || 
        mfg.includes(searchQuery.toLowerCase()) || 
        category.includes(searchQuery.toLowerCase());
        
      const avgConfidence = calculateAvgConfidence(core);
      const needsReview = extra.validation?.needs_review || avgConfidence < 0.80;
      
      if (filterStatus === "needs_review") {
        return matchesSearch && needsReview;
      }
      if (filterStatus === "verified") {
        return matchesSearch && !needsReview;
      }
      return matchesSearch;
    });

    return (
      <div className="space-y-6">
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Product Catalog Directory</h1>
              <p className="mt-1 text-xs text-gray-500">
                Browse, search, and audit all extracted and enriched catalog entries.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <Search size={15} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-48"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <ListFilter size={15} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#101010] text-white">All Statuses</option>
                  <option value="verified" className="bg-[#101010] text-green-400">Verified</option>
                  <option value="needs_review" className="bg-[#101010] text-yellow-400">Needs Review</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button 
                onClick={() => {
                  setLoadingList(true);
                  getAllProducts()
                    .then(data => Array.isArray(data) && setProductsList(data))
                    .catch(err => console.error(err))
                    .finally(() => setLoadingList(false));
                }}
                className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </section>

        {/* Directory Table */}
        <section className="glass rounded-2xl overflow-hidden border border-white/5">
          {loadingList ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange border-t-transparent" />
              <p className="text-sm text-gray-400">Loading catalog directory...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8">
              <p className="text-sm text-gray-500">No products found matching filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold text-gray-400">
                    <th className="p-4">Product Identity</th>
                    <th className="p-4">Manufacturer</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredList.map((p) => {
                    const extra = p.extraction || {};
                    const core = extra.core_fields || {};
                    const prodName = core.product_name?.value || p.source_reference || "Unknown Product";
                    const mfg = core.brand_manufacturer?.value || "Unknown Manufacturer";
                    const category = core.category?.value || "Industrial Product";
                    
                    const avgConfidence = calculateAvgConfidence(core);
                    const needsReview = extra.validation?.needs_review || avgConfidence < 0.80;
                    
                    // Adapt DB product schema to ProductResponse format for review page when clicked
                    const handleReviewClick = () => {
                      if (onSelectProduct) {
                        onSelectProduct({
                          success: true,
                          product_id: p.id,
                          source_type: p.source_type,
                          source_reference: p.source_reference,
                          extraction: extra
                        });
                      }
                    };

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-medium max-w-xs truncate">
                          <div>
                            <div className="text-white font-medium truncate">{prodName}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5 truncate">{p.source_reference}</div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{mfg}</td>
                        <td className="p-4 text-gray-300">{category}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 font-semibold ${avgConfidence >= 0.90 ? "text-green-400" : avgConfidence >= 0.80 ? "text-blue-400" : "text-yellow-400"}`}>
                            {Math.round(avgConfidence * 100)}%
                          </span>
                        </td>
                        <td className="p-4">
                          {needsReview ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/10">
                              Needs Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/10">
                              Verified
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={handleReviewClick}
                            className="rounded-lg bg-orange px-3 py-1.5 text-xs font-semibold hover:scale-[1.02] active:scale-95 transition"
                          >
                            Review Specs
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  const normalized = normalizeProduct(product);

  const categoryLower = (normalized.category || "").toLowerCase();
  const isSoftwareOrDigital = 
    categoryLower.includes("software") || 
    categoryLower.includes("service") || 
    categoryLower.includes("digital") ||
    categoryLower.includes("platform") ||
    categoryLower.includes("cloud") ||
    categoryLower.includes("app");

  const downloadMarkdown = () => {
    if (!sheetContent) return;
    const blob = new Blob([sheetContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cleanName = (normalized.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    a.download = `${cleanName}_catalog_entry.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!sheetContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${normalized.productName || "Product Catalog Sheet"}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1a1a1a;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            h1 {
              font-size: 28px;
              border-bottom: 2px solid #ea580c;
              padding-bottom: 8px;
              margin-top: 30px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #1a1a1a;
            }
            h2 {
              font-size: 20px;
              color: #ea580c;
              margin-top: 24px;
            }
            h3 {
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 16px;
            }
            hr {
              border: 0;
              border-top: 1px solid #ddd;
              margin: 20px 0;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div id="content"></div>
        </body>
      </html>
    `);

    const sheetElement = document.getElementById("catalog-sheet-content");
    if (sheetElement) {
      printWindow.document.getElementById("content")!.innerHTML = sheetElement.innerHTML;
    }
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="glass relative overflow-hidden rounded-3xl p-7">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange/10 blur-3xl" />
        
        {/* Back Link to Directory */}
        <button
          onClick={() => onSelectProduct?.(null)}
          className="mb-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition"
        >
          <ArrowLeft size={13} />
          Back to Directory
        </button>

        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-orange font-semibold">
              <Sparkles size={14} />
              AI ANALYSIS COMPLETE
            </div>
            <h1 className="text-3xl font-semibold">
              {normalized.productName || "Unknown Product"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {normalized.manufacturer || "Unknown manufacturer"}
              {" · "}
              {normalized.category || "Uncategorized"}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${
                activeTab === "review"
                  ? "bg-orange text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              Specs & Validation
            </button>
            <button
              onClick={() => setActiveTab("sheet")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${
                activeTab === "sheet"
                  ? "bg-orange text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              Clean B2B Catalog Entry
            </button>
          </div>
        </div>
      </section>

      {activeTab === "review" ? (
        <>
          {/* Validation summary */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-gray-500">
                Required fields
              </p>
              <div className="mt-3 flex items-center gap-2">
                {normalized.validation.missingRequiredFields.length ? (
                  <>
                    <AlertTriangle
                      size={18}
                      className="text-yellow-400"
                    />
                    <span className="text-sm text-yellow-400">
                      Needs review
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={18}
                      className="text-green-400"
                    />
                    <span className="text-sm text-green-400">
                      Complete
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-gray-500">
                Validation flags
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {normalized.validation.flags.length}
              </p>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-gray-500">
                Source
              </p>
              <p className="mt-3 truncate text-sm text-gray-300">
                {normalized.sourceReference}
              </p>
            </div>
          </section>

          {/* Core fields */}
          <section className="glass overflow-hidden rounded-2xl">
            <div className="border-b border-white/5 p-5">
              <h2 className="font-semibold">
                Core Product Information
              </h2>
              <p className="mt-1 text-xs text-gray-600">
                Extracted and enriched identity fields
              </p>
            </div>

            <ProductFieldComponent
              label="Product Name"
              field={normalized.fields.productName}
            />
            <ProductFieldComponent
              label="Manufacturer"
              field={normalized.fields.manufacturer}
            />
            <ProductFieldComponent
              label="Category"
              field={normalized.fields.category}
            />
            <ProductFieldComponent
              label="SKU / Part Number"
              field={normalized.fields.sku}
            />
            <ProductFieldComponent
              label="Description"
              field={normalized.fields.description}
            />
            <ProductFieldComponent
              label="Price"
              field={normalized.fields.price}
            />
          </section>

          {/* Technical */}
          {(!isSoftwareOrDigital || (normalized.fields.certifications?.value !== null && normalized.fields.certifications?.confidence > 0)) && (
            <section className="glass overflow-hidden rounded-2xl">
              <div className="border-b border-white/5 p-5">
                <h2 className="font-semibold">
                  Technical Specifications
                </h2>
              </div>

              {!isSoftwareOrDigital && (
                <>
                  <ProductFieldComponent
                    label="Material"
                    field={normalized.fields.material}
                  />
                  <ProductFieldComponent
                    label="Dimensions"
                    field={normalized.fields.dimensions}
                  />
                  <ProductFieldComponent
                    label="Weight"
                    field={normalized.fields.weight}
                  />
                  <ProductFieldComponent
                    label="Voltage / Power Rating"
                    field={normalized.fields.voltagePowerRating}
                  />
                </>
              )}

              {((normalized.fields.certifications?.value !== null && normalized.fields.certifications?.confidence > 0) || !isSoftwareOrDigital) && (
                <ProductFieldComponent
                  label="Certifications / Compliance"
                  field={normalized.fields.certifications}
                />
              )}

              {!isSoftwareOrDigital && (
                <ProductFieldComponent
                  label="Compatible Parts"
                  field={normalized.fields.compatibleParts}
                />
              )}
            </section>
          )}

          {/* Dynamic Category Specifications */}
          {Object.keys(normalized.customAttributes).length > 0 && (
            <section className="glass overflow-hidden rounded-2xl">
              <div className="border-b border-white/5 p-5">
                <h2 className="font-semibold">
                  Dynamic Category Specifications
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Category-specific parameters extracted dynamically by AI
                </p>
              </div>

              {Object.entries(normalized.customAttributes).map(([key, field]) => (
                <ProductFieldComponent
                  key={key}
                  label={key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  field={field as any}
                />
              ))}
            </section>
          )}

          {/* Validation */}
          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 font-semibold">
              Validation & Consistency
            </h2>
            <ValidationFlags
              flags={normalized.validation.flags}
            />
          </section>
        </>
      ) : (
        /* Publication Catalog Sheet view */
        <section className="glass rounded-2xl p-7 relative">
          {isLoadingSheet ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange border-t-transparent" />
              <p className="text-sm text-gray-400">
                Writing clean technical catalog sheet using LLM copywriter...
              </p>
            </div>
          ) : sheetError ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="text-yellow-500" size={32} />
              <p className="text-sm text-gray-400">{sheetError}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-semibold text-white">Clean Catalog Preview</h2>
                  <p className="text-xs text-gray-500">Traceable B2B-ready output</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadMarkdown}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 px-3 py-1.5 text-xs text-white font-medium transition"
                  >
                    <Download size={13} />
                    Save Markdown
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-1.5 rounded-lg bg-orange hover:bg-orange-dark px-3 py-1.5 text-xs text-white font-medium transition"
                  >
                    <Printer size={13} />
                    Export PDF Datasheet
                  </button>
                </div>
              </div>

              {/* Rendered content */}
              <div id="catalog-sheet-content" className="bg-black/20 rounded-xl p-6 border border-white/5">
                <MarkdownRenderer content={sheetContent} />
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
