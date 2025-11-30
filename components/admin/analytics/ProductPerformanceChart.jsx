"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { RiDownload2Line } from "react-icons/ri";

/**
 * ProductPerformanceChart.jsx
 * Props: none
 * Usage: <ProductPerformanceChart />
 */

export default function ProductPerformanceChart() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";

  const [range, setRange] = useState("30"); // default
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]); // contains {id,name,sales,revenue,image}
  const [error, setError] = useState(null);

  const RANGE_LABELS = useMemo(
    () => ({
      "7": "Last 7 Days",
      "30": "Last 30 Days",
      "90": "Last 90 Days",
      all: "All Time",
    }),
    []
  );

  // Redirect non-admin after auth resolves
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  // Fetch data when auth/admin + range changes
  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/products/performance?range=${encodeURIComponent(range)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch performance data");
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const arr = Array.isArray(json.data) ? json.data : [];
        const normalized = arr
          .map((d) => ({
            // id: d.id || d._id || d.productId || null,
            name: String(d.name || d.product || "Unknown"),
            sales: Number(d.sales || d.units || d.totalUnits || 0),
            revenue: Number(d.revenue || d.totalRevenue || 0),
            image: d.image || d.thumbnail || (d.images?.[0] ?? null),
            _id: d._id || d.productId || null,
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 10);
        setProducts(normalized);
      })
      .catch((err) => {
        console.error("Product performance fetch error:", err);
        if (mounted) setError(err.message || "Failed to load data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [status, isAdmin, range]);

  // CSV export (includes revenue and range label)
  const handleExportCSV = () => {
    if (!products || products.length === 0) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const filename = `product_sales_report_${dateStr}.csv`;

    const header = ["Product Name", "Total Sales", "Revenue", "Range"];
    const rows = products.map((p) => [
      escapeCsv(p.name),
      p.sales,
      formatCurrency(p.revenue),
      `"${RANGE_LABELS[range] || range}"`,
    ]);

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function escapeCsv(value) {
    if (value == null) return '""';
    const s = String(value).replace(/"/g, '""');
    return `"${s}"`;
  }

  function formatCurrency(num) {
    // ₦ formatting with thousand separators; change symbol if needed
    if (isNaN(num)) return "₦0";
    return "₦" + Number(num).toLocaleString();
  }

  const COLORS = [
    "#f97316",
    "#fb923c",
    "#f59e0b",
    "#f97316",
    "#fb7185",
    "#60a5fa",
    "#34d399",
    "#a78bfa",
    "#f472b6",
    "#94a3b8",
  ];

  // custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded shadow-lg text-sm w-56">
        <div className="flex items-start gap-3">
          {d.image ? (
            // image preview
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.image} alt={d.name} className="w-14 h-14 object-cover rounded" />
          ) : (
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400">
              📦
            </div>
          )}
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-100">{d.name}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Sales: <span className="font-medium">{d.sales}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Revenue: <span className="font-medium">{formatCurrency(d.revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // handle bar click -> go to product detail admin page
  const handleBarClick = (data, index) => {
    const id = data && (data.id || data._id);
    if (!id) return;
    router.push(`/admin/products/${id}`);
  };

  // Render
  if (status === "loading") {
    return (
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  if (status === "authenticated" && !isAdmin) {
    // we redirect in effect; return null while redirecting
    return null;
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            📊 Top 10 Product Sales Performance
          </h2> */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing top 10 products — {RANGE_LABELS[range] || "Custom"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border px-3 py-1 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm"
          >
            <RiDownload2Line className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-sm">Error: {error}</div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No data available for this range.</div>
        ) : (
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={products}
                margin={{ top: 20, right: 24, left: 12, bottom: 20 }}
                onClick={({ activePayload }) => {
                  // do nothing here — we handle per-bar click via Bar onClick
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={220} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sales"
                  barSize={18}
                  onClick={(e, idx) => {
                    // e is the payload object (data), idx is index
                    handleBarClick(e, idx);
                  }}
                >
                  {products.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
