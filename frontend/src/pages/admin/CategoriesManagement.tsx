

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { categoryApi } from "../../api/categoryApi";

interface Category {
    id: number;
    name: string;
}

const CategoriesManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await categoryApi.getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setSuccess("");
            setError("Category name is required");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");
            await categoryApi.createCategory({ name: trimmedName });
            setName("");
            setSuccess("Category created successfully");
            await loadCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create category");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (category: Category) => {
        setError("");
        setSuccess("");
        setCategoryToDelete(category);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setDeletingId(categoryToDelete.id);
            setError("");
            setSuccess("");
            await categoryApi.deleteCategory(categoryToDelete.id);
            setSuccess(`Category "${categoryToDelete.name}" deleted successfully`);
            setCategoryToDelete(null);
            await loadCategories();
        } catch (err: any) {
            setCategoryToDelete(null);
            setError(
                err.response?.data?.message ||
                "Unable to delete category"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-8" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                            Admin &gt; Catalog
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: "var(--text-primary)" }}>
                            Categories
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                            Create and manage product categories.
                        </p>
                    </div>
                    <Link
                        to="/admin"
                        className="inline-flex w-fit items-center rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                        }}
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {(error || success) && (
                    <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-md">
                        <div
                            className="rounded-xl border px-4 py-3 shadow-2xl backdrop-blur"
                            style={
                                error
                                    ? {
                                          borderColor: "rgba(239, 68, 68, 0.4)",
                                          background: "var(--surface)",
                                          color: "#dc2626",
                                      }
                                    : {
                                          borderColor: "rgba(16, 185, 129, 0.4)",
                                          background: "var(--surface)",
                                          color: "#059669",
                                      }
                            }
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 text-sm font-medium">{error || success}</div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setSuccess("");
                                    }}
                                    className="shrink-0 rounded-md px-2 py-1 text-xs opacity-70 transition hover:bg-black/5 hover:opacity-100"
                                    aria-label="Close notification"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div
                        className="rounded-2xl border p-5 shadow-md"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Categories</p>
                        <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{categories.length}</p>
                    </div>
                    <div
                        className="rounded-2xl border p-5 shadow-md"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Search Results</p>
                        <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{filteredCategories.length}</p>
                    </div>
                </div>

                <div
                    className="mb-6 rounded-2xl border p-5 shadow-md"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                    <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Create Category</h2>
                    <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Category name"
                            className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none shadow-inner transition focus:ring-2 focus:ring-blue-500/20"
                            style={{
                                background: "var(--background)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl border px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                                background: "var(--brand-primary)",
                                borderColor: "var(--brand-primary)",
                            }}
                        >
                            {submitting ? "Creating..." : "Create Category"}
                        </button>
                    </form>
                </div>

                <div
                    className="overflow-hidden rounded-2xl border shadow-md"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                    <div
                        className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
                        style={{ borderColor: "var(--border)" }}
                    >
                        <div>
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Category List</h2>
                            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                Categories can only be deleted when they have no active products.
                            </p>
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search categories"
                            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none shadow-inner transition focus:ring-2 focus:ring-blue-500/20 sm:w-64"
                            style={{
                                background: "var(--background)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                            }}
                        />
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                            Loading categories...
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                            No categories found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr className="border-b" style={{ background: "var(--surface-secondary)", borderColor: "var(--border)" }}>
                                        <th className="px-5 py-4 font-medium" style={{ color: "var(--text-secondary)" }}>ID</th>
                                        <th className="px-5 py-4 font-medium" style={{ color: "var(--text-secondary)" }}>Category</th>
                                        <th className="px-5 py-4 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="border-b transition hover:bg-black/[0.03] last:border-0"
                                            style={{ borderColor: "var(--border)" }}
                                        >
                                            <td className="px-5 py-4" style={{ color: "var(--text-muted)" }}>#{category.id}</td>
                                            <td className="px-5 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{category.name}</td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDelete(category)}
                                                    disabled={deletingId === category.id}
                                                    className="rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                                    style={{
                                                        background: "#dc2626",
                                                        borderColor: "#dc2626",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    {deletingId === category.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {categoryToDelete && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-category-title"
                        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
                            ⚠
                        </div>
                        <h2 id="delete-category-title" className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                            Delete category?
                        </h2>
                        <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                            You are about to delete <span className="font-semibold text-red-600">{categoryToDelete.name}</span>.
                            Categories with active products cannot be deleted.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setCategoryToDelete(null)}
                                disabled={deletingId !== null}
                                className="rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    background: "var(--surface-secondary)",
                                    borderColor: "var(--border)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deletingId !== null}
                                className="rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    background: "#dc2626",
                                    borderColor: "#7c1313",
                                    color: "#ffffff",
                                }}
                            >
                                {deletingId !== null ? "Deleting..." : "Delete Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManagement;