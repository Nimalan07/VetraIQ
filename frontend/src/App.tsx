import { useState } from "react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ProductReview from "./pages/ProductReview";
import Export from "./pages/Export";

import type { ProductResponse } from "./types/product";
import { getProductById } from "./api/client";

function App() {

  const [page, setPage] =
    useState("dashboard");

  const [product, setProduct] =
    useState<ProductResponse | null>(
      null
    );

  const handleProductComplete = (
    processedProduct: ProductResponse
  ) => {
    console.log(
      "Processed:",
      processedProduct
    );
    setProduct(processedProduct);
    setPage("products");
  };

  const handleSelectProductById = async (id: string) => {
    try {
      const response = await getProductById(id);
      if (response) {
        setProduct(response);
        setPage("products");
      }
    } catch (err) {
      console.error("Failed to load product by ID:", err);
    }
  };

  const renderPage = () => {
    switch (page) {
      case "upload":
        return (
          <Upload
            onComplete={
              handleProductComplete
            }
          />
        );

      case "products":
      case "review":
        return (
          <ProductReview
            product={product}
            onSelectProduct={setProduct}
          />
        );

      case "export":
        return <Export product={product} />;

      case "dashboard":
      default:
        return (
          <Dashboard
            onNavigate={(targetPage) => {
              if (targetPage === "products") {
                setProduct(null);
              }
              setPage(targetPage);
            }}
            onSelectProduct={handleSelectProductById}
          />
        );
    }
  };

  const titles: Record<
    string,
    string
  > = {
    dashboard: "Overview",
    upload: "Analyze Product",
    products: product ? "Product Review" : "Product Directory",
    review: "Product Review",
    export: "Export",
  };

  return (
    <Layout
      title={
        titles[page] ||
        "Dashboard"
      }
      active={page}
      onNavigate={(targetPage) => {
        if (targetPage === "products") {
          setProduct(null);
        }
        setPage(targetPage);
      }}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
