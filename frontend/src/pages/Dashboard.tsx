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
  onSelectProduct?: (productId: string) => void;
}

interface DashboardStats {
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
}

export default function Dashboard({
  onNavigate,
  onSelectProduct,
}: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    getDashboardStats()
      .then((data) => {
        if (data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
      })
      .finally(() => {
        setIsLoading(false);
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
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-5 border border-white/5 animate-pulse min-h-[120px] flex flex-col justify-between">
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-8 bg-white/10 rounded w-1/2 my-2" />
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Products Processed"
              value={String(stats?.products_processed ?? 0)}
              subtitle={`Across ${stats?.categories_count ?? 0} categories`}
              icon={Package}
            />

            <StatCard
              title="High Confidence"
              value={`${stats?.high_confidence_pct ?? 0}%`}
              subtitle="Fields above 80%"
              icon={CheckCircle2}
            />

            <StatCard
              title="Needs Review"
              value={String(stats?.needs_review_count ?? 0)}
              subtitle="Human verification required"
              icon={AlertTriangle}
            />

            <StatCard
              title="Data Sources"
              value={String(stats?.data_sources_count ?? 0)}
              subtitle="Documents + web sources"
              icon={Database}
            />
          </>
        )}
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
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-5 animate-pulse">
                  <div className="space-y-2 w-1/2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-white/10 rounded-full w-12" />
                </div>
              ))}
            </>
          ) : (
            stats?.recent_products.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct?.(product.id)}
                className="flex items-center justify-between p-5 hover:bg-white/[0.02] cursor-pointer transition hover:bg-white/[0.04]"
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
            ))
          )}
        </div>

      </section>

    </div>
  );
}
