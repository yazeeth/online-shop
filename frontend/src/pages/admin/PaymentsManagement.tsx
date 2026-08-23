import { useEffect, useMemo, useState } from "react";
import { paymentApi } from "../../api/paymentApi";
import type { Payment } from "../../types/payment.types";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await paymentApi.getAllPayments();
        if (mounted) {
          setPayments(response ?? []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load payments");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      mounted = false;
    };
  }, []);

  const statuses = useMemo(() => {
    const values = payments
      .map((payment) => String(payment.status ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(values));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        status === "all" || String(payment.status ?? "") === status;
      const matchesSearch =
        !query ||
        String(payment.id ?? "").toLowerCase().includes(query) ||
        String(payment.orderId ?? "").toLowerCase().includes(query) ||
        String(payment.status ?? "").toLowerCase().includes(query) ||
        String(payment.method ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [payments, search, status]);

  const renderStatusBadge = (statusValue: string | undefined) => {
    const statusLower = (statusValue ?? "").toLowerCase();
    const successStatuses = ["paid", "completed", "success", "succeeded"];
    const isSuccess = successStatuses.includes(statusLower);
    const baseClasses =
      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5";
    if (isSuccess) {
      return (
        <span className={`${baseClasses} bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]`}>
          {statusValue}
        </span>
      );
    }
    if (!statusValue) {
      return (
        <span className={`${baseClasses} bg-[var(--surface)] text-[var(--text-secondary)]`}>
          Unknown
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-[var(--surface)] text-[var(--text-secondary)]`}>
        {statusValue}
      </span>
    );
  };

  return (
    <section className="space-y-5 p-4 sm:p-6 bg-[var(--background)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)] sm:text-2xl">Payments Management</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              Monitor customer payments, transactions, methods, and payment status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex w-fit items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            {search.trim() || status !== "all"
              ? `${filteredPayments.length} matching payments`
              : `${payments.length} payments`}
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payments, orders..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border)] sm:w-72"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border)] sm:w-44"
            >
              <option value="all">All statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Total Payments</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{payments.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Successful</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {payments.filter((payment) => String(payment.status ?? "").toLowerCase() === "paid" || String(payment.status ?? "").toLowerCase() === "completed" || String(payment.status ?? "").toLowerCase() === "success" || String(payment.status ?? "").toLowerCase() === "succeeded").length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Total Amount</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {payments.reduce((total, payment) => total + (payment.amount != null ? Number(payment.amount) || 0 : 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {loading ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading payments...</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Fetching the latest payment transactions.</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">No payments found.</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Try changing the search text or payment status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--surface-secondary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[var(--surface-secondary)]">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--text-primary)]">
                      #{payment.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--text-primary)]">Customer</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">Details unavailable</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {payment.orderId ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {payment.amount != null ? Number(payment.amount).toFixed(2) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {payment.method ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {renderStatusBadge(payment.status)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}