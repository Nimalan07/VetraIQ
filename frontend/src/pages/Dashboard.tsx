import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowUpRight,
} from "lucide-react";

import StatCard from "../components/StatCard";
import ModeIndicator from "../components/ModeIndicator";

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  onNavigate,
}: Props) {

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
          value="24"
          subtitle="Across 3 categories"
          icon={Package}
        />

        <StatCard
          title="High Confidence"
          value="87%"
          subtitle="Fields above 80%"
          icon={CheckCircle2}
        />

        <StatCard
          title="Needs Review"
          value="6"
          subtitle="Human verification required"
          icon={AlertTriangle}
        />

        <StatCard
          title="Data Sources"
          value="18"
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

          {[
            [
              "General Service Ball Valves",
              "Swagelok",
              "Ball Valve",
              "94%",
            ],
            [
              "EasyPact EZC",
              "Schneider Electric",
              "Circuit Breaker",
              "91%",
            ],
            [
              "SIMOTICS Motor",
              "Siemens",
              "Electric Motor",
              "88%",
            ],
          ].map(
            (
              product,
              index
            ) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 hover:bg-white/[0.02]"
              >

                <div>
                  <p className="text-sm font-medium">
                    {product[0]}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {product[1]} · {product[2]}
                  </p>
                </div>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                  {product[3]}
                </span>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}
