import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { paymentApi } from "../../api/paymentApi";
import { productApi } from "../../api/productApi";
import { userApi } from "../../api/userApi";
import type { Order } from "../../types/order.types";
import type { Product } from "../../types/product.types";
import type { User } from "../../types/user.types";

interface PaymentRecord {
  id: number;
  status?: string;
  amount?: number;
  createdAt?: string;
  order?: {
    id?: string;
  };
}

interface DashboardData {
  products: Product[];
  orders: Order[];
  users: User[];
  payments: PaymentRecord[];
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getOrderTotal(order: Order) {
  const candidate = order as Order & {
    total?: number | string;
    totalAmount?: number | string;
    grandTotal?: number | string;
    items?: Array<{ price?: number | string; quantity?: number | string }>;
  };

  const directTotal = candidate.total ?? candidate.totalAmount ?? candidate.grandTotal;
  if (directTotal !== undefined) return Number(directTotal) || 0;

  return (candidate.items ?? []).reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
}

function statusClass(status?: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700";
    case "PROCESSING":
      return "bg-violet-50 text-violet-700";
    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    products: [],
    orders: [],
    users: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [products, orders, users, payments] = await Promise.all([
          productApi.getAllProducts(),
          orderApi.getAllOrdersAdmin(),
          userApi.getAllUsers(),
          paymentApi.getAllPayments(),
        ]);

        if (mounted) {
          setData({
            products: products ?? [],
            orders: orders ?? [],
            users: users ?? [],
            payments: payments ?? [],
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const revenue = data.orders
      .filter((order) => String((order as Order & { status?: string }).status) !== "CANCELLED")
      .reduce((total, order) => total + getOrderTotal(order), 0);

    const lowStock = data.products.filter((product) => {
      const stock = Number((product as Product & { stock?: number | string }).stock ?? 0);
      return stock <= 5;
    }).length;

    return {
      products: data.products.length,
      orders: data.orders.length,
      users: data.users.length,
      revenue,
      lowStock,
    };
  }, [data]);

  const recentOrders = useMemo(() => {
    return [...data.orders]
      .sort((a, b) => {
        const first = new Date(String((a as Order & { createdAt?: string }).createdAt ?? 0)).getTime();
        const second = new Date(String((b as Order & { createdAt?: string }).createdAt ?? 0)).getTime();
        return second - first;
      })
      .slice(0, 6);
  }, [data.orders]);

  const orderStatusCounts = useMemo(() => {
    return data.orders.reduce<Record<string, number>>((counts, order) => {
      const status = String((order as Order & { status?: string }).status ?? "PENDING");
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {});
  }, [data.orders]);

  const lowStockProducts = useMemo(() => {
    return data.products
      .map((product) => ({
        product,
        stock: Number((product as Product & { stock?: number | string }).stock ?? 0),
      }))
      .filter(({ stock }) => stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }, [data.products]);

return (
    <main className="min-h-full bg-[var(--background)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-7 shadow-xl shadow-black/20 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                Administration
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Store Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] font-medium">
                Monitor your store, manage orders and products, and keep track of customers and payments.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex w-fit items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-secondary)] px-4 py-2.5 text-sm font-bold text-[var(--text-accent)] transition hover:border-[var(--brand-accent)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            >
              Back to Store
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-900/70 bg-red-950/50 px-5 py-4 text-sm font-medium text-red-300">
            {error}
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Overview</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Your store at a glance.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Products",
                value: stats.products,
                description: "Products in catalog",
                href: "/admin/products",
              },
              {
                label: "Orders",
                value: stats.orders,
                description: "Orders received",
                href: "/admin/orders",
              },
              {
                label: "Customers",
                value: stats.users,
                description: "Registered users",
                href: "/admin/users",
              },
              {
                label: "Revenue",
                value: formatCurrency(stats.revenue),
                description: "Non-cancelled orders",
                href: "/admin/orders",
              },
            ].map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-secondary)] p-6 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:bg-[var(--surface)] hover:shadow-xl"
              >
                <p className="text-sm font-semibold text-[var(--text-accent)]">{stat.label}</p>
                <p className="mt-3 truncate text-3xl font-black tracking-tight text-[var(--text-primary)] drop-shadow-sm">
                  {loading ? "—" : stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">{stat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg shadow-black/15">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Recent Orders</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Latest activity from your store.</p>
              </div>
              <Link
                to="/admin/orders"
                className="text-sm font-bold text-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
              >
                Manage Orders →
              </Link>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-[var(--text-secondary)] font-medium">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[var(--text-secondary)] font-medium">
                No orders have been placed yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentOrders.map((order) => {
                  const orderWithMeta = order as Order & {
                    id?: string | number;
                    status?: string;
                    createdAt?: string;
                    user?: { name?: string; email?: string };
                  };
                  const status = orderWithMeta.status ?? "PENDING";

                  return (
                    <Link
                      key={String(orderWithMeta.id)}
                      to="/admin/orders"
                      className="block px-6 py-5 transition hover:bg-[var(--surface-secondary)]/70"
                    >
                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-6">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                            Order #{String(orderWithMeta.id).slice(-8)}
                          </p>
                          <p className="mt-1 truncate text-xs text-[var(--text-secondary)] font-medium">
                            {orderWithMeta.user?.name || orderWithMeta.user?.email || "Customer"}
                          </p>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                          {formatDate(orderWithMeta.createdAt)}
                        </p>

                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClass(status)}`}
                          >
                            {statusLabels[status] ?? status}
                          </span>
                          <span className="text-sm font-black text-[var(--text-primary)]">
                            {formatCurrency(getOrderTotal(order))}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-lg shadow-black/15">
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Order Status</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Current order distribution.</p>

            <div className="mt-6 space-y-5">
              {Object.entries(orderStatusCounts).length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)] font-medium">No order data available.</p>
              ) : (
                Object.entries(orderStatusCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const percentage = data.orders.length
                      ? Math.round((count / data.orders.length) * 100)
                      : 0;

                    return (
                      <div key={status}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-[var(--text-primary)]">
                            {statusLabels[status] ?? status}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">
                            {count} · {percentage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--surface-secondary)]">
                          <div
                            className="h-2 rounded-full bg-[var(--brand-accent)] transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg shadow-black/15">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Inventory</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Products that need attention.</p>
              </div>
              <span className="rounded-full border border-red-800 bg-red-950/70 px-3 py-1 text-xs font-black text-red-200">
                {loading ? "—" : `${stats.lowStock} low`}
              </span>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-sm text-[var(--text-secondary)] font-medium">Loading inventory...</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="px-6 py-8 text-sm font-semibold text-emerald-400">
                ✓ All products have healthy stock levels.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {lowStockProducts.map(({ product, stock }) => (
                  <Link
                    key={String((product as Product & { id?: string | number }).id)}
                    to="/admin/products"
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[var(--surface-secondary)]/70"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {String((product as Product & { name?: string }).name ?? "Product")}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium">Needs restocking</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-red-800 bg-red-950/70 px-3 py-1 text-xs font-black text-red-200">
                      {stock} left
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg shadow-black/15">
            <div className="border-b border-[var(--border)] px-6 py-5">
              <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Quick Actions</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">Jump directly to common tasks.</p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {[
                ["Products", "Manage your catalog", "/admin/products"],
                ["Categories", "Manage product categories", "/admin/categories"],
                ["Orders", "Review customer orders", "/admin/orders"],
                ["Users", "Manage customers and roles", "/admin/users"],
                ["Payments", "Review payment activity", "/admin/payments"],
              ].map(([label, description, href]) => (
                <Link
                  key={href}
                  to={href}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-secondary)] p-4 transition hover:border-[var(--brand-accent)] hover:bg-[var(--surface)] hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
                    <span className="text-[var(--brand-accent)]">→</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] font-medium">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}