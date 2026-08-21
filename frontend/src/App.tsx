import { useState } from "react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ProductReview from "./pages/ProductReview";
import Export from "./pages/Export";

import type { ProductResponse } from "./types/product";

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
          />
        );

      case "export":

        return <Export product={product} />;

      case "dashboard":

      default:

        return (
          <Dashboard
            onNavigate={setPage}
          />
        );
    }
  };

  const titles: Record<
    string,
    string
  > = {
    dashboard:
      "Overview",
    upload:
      "Analyze Product",
    products:
      "Product Review",
    review:
      "Product Review",
    export:
      "Export",
  };

  return (
    <Layout
      title={
        titles[page] ||
        "Dashboard"
      }
      active={page}
      onNavigate={setPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
