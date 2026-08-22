import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowUpRight,
} from "lucide-react";

import { useState, useEffect } from "react";
import { getDashboardStats } from "../api/client";
import StatCard from "../components/StatCard";
import ModeIndicator from "../components/ModeIndicator";

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  onNavigate,
}: Props) {
  const [stats, setStats] = useState<{
    products_processed: number;
    categories_count: number;
    high_confidence_pct: number;
    needs_review_count: number;
    data_sources_count: number;
    recent_products: Array<{
      id: string;
      name: string;
      manufacturer: string;
      category: string;
      confidence: string;
    }>;
  }>({
    products_processed: 24,
    categories_count: 3,
    high_confidence_pct: 87,
    needs_review_count: 6,
    data_sources_count: 18,
    recent_products: [
      { id: "1", name: "General Service Ball Valves", manufacturer: "Swagelok", category: "Ball Valve", confidence: "94%" },
      { id: "2", name: "EasyPact EZC", manufacturer: "Schneider Electric", category: "Circuit Breaker", confidence: "91%" },
      { id: "3", name: "SIMOTICS Motor", manufacturer: "Siemens", category: "Electric Motor", confidence: "88%" }
    ]
  });

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        if (data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
      });
  }, []);

  return (
    <div className="space-y-8">

      {/* Hero */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101010] p-8">

        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-orange/10 blur-3xl" />

        <div className="relative">

          <div className="mb-4 flex items-center gap-3">
            <ModeIndicator demo={false} />
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
            Turn industrial documents
            <span className="text-orange">
              {" "}into intelligent data.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500">
            Extract, enrich, validate and review
            product specifications with
            explainable AI.
          </p>

          <button
            onClick={() =>
              onNavigate("upload")
            }
            className="mt-7 flex items-center gap-2 rounded-xl orange-gradient px-5 py-3 text-sm font-semibold shadow-orange transition hover:scale-[1.02]"
          >
            Analyze Product
            <ArrowUpRight size={16} />
          </button>

        </div>

      </section>

      {/* Stats */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Products Processed"
          value={String(stats.products_processed)}
          subtitle={`Across ${stats.categories_count} categories`}
          icon={Package}
        />

        <StatCard
          title="High Confidence"
          value={`${stats.high_confidence_pct}%`}
          subtitle="Fields above 80%"
          icon={CheckCircle2}
        />

        <StatCard
          title="Needs Review"
          value={String(stats.needs_review_count)}
          subtitle="Human verification required"
          icon={AlertTriangle}
        />

        <StatCard
          title="Data Sources"
          value={String(stats.data_sources_count)}
          subtitle="Documents + web sources"
          icon={Database}
        />

      </section>

      {/* Recent activity */}

      <section className="glass rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div>
            <h2 className="font-semibold">
              Recent Products
            </h2>

            <p className="mt-1 text-xs text-gray-600">
              Latest processed industrial products
            </p>
          </div>

          <button
            onClick={() =>
              onNavigate("products")
            }
            className="text-xs text-orange hover:underline"
          >
            View all
          </button>

        </div>

        <div className="divide-y divide-white/5">

          {stats.recent_products.map(
            (
              product
            ) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-5 hover:bg-white/[0.02]"
              >

                <div>
                  <p className="text-sm font-medium">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {product.manufacturer} · {product.category}
                  </p>
                </div>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                  {product.confidence}
                </span>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}
