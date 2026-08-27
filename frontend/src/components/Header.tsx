import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-brand-700"
  }`;

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, logoutLoading } = useAuth();
  const isAdmin = String(user?.role ?? "").toUpperCase() === "ADMIN";
  const { cart } = useCart();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartItemCount = Array.isArray(cart?.items)
    ? cart.items.reduce((total, item) => total + Number(item.quantity || 0), 0)
    : 0;

  const handleLogout = () => {
    setAccountOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            to="/"
            onClick={closeMobile}
            className="shrink-0 text-xl font-black tracking-tight text-brand-600 transition hover:text-brand-700 sm:text-2xl"
            aria-label="OnlineShop home"
          >
            OnlineShop - Yazeeth
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              aria-label={cartItemCount > 0 ? `Shopping cart, ${cartItemCount} items` : "Shopping cart"}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                🛒
              </span>
              {cartItemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 transition hover:border-brand-200 hover:bg-brand-50 sm:px-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-semibold text-gray-800 lg:inline">
                  {user.name || user.email}
                </span>
                <span aria-hidden="true" className="text-gray-500">
                  {accountOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {accountOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close account menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
                    role="menu"
                  >
                    <div className="mb-1 rounded-xl bg-gray-50 px-3 py-3">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {user.name || "User"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                      role="menuitem"
                    >
                      My Profile
                      <span aria-hidden="true">›</span>
                    </Link>
                    {!isAdmin && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                          role="menuitem"
                        >
                          My Orders
                          <span aria-hidden="true">›</span>
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                          role="menuitem"
                        >
                          My Cart
                          {cartItemCount > 0 && (
                            <span className="rounded-full bg-gray-950 px-2 py-0.5 text-[10px] font-bold text-white">
                              {cartItemCount > 99 ? "99+" : cartItemCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        role="menuitem"
                      >
                        Admin Portal
                        <span aria-hidden="true">↗</span>
                      </Link>
                    )}

                    <div className="my-1 border-t" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      role="menuitem"
                    >
                      {logoutLoading ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-lg text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 md:hidden"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6" aria-label="Mobile navigation">
            <NavLink to="/" onClick={closeMobile} className={navLinkClass}>
              <span className="block rounded-xl px-3 py-3">Home</span>
            </NavLink>
            <NavLink to="/categories" onClick={closeMobile} className={navLinkClass}>
              <span className="block rounded-xl px-3 py-3">Categories</span>
            </NavLink>
            <NavLink to="/products" onClick={closeMobile} className={navLinkClass}>
              <span className="block rounded-xl px-3 py-3">Products</span>
            </NavLink>
            {!isAdmin && (
              <Link
                to="/cart"
                onClick={closeMobile}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="rounded-full bg-brand-600 px-2 py-1 text-xs font-bold text-white">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobile}
                className="rounded-xl bg-brand-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Admin Portal
              </Link>
            )}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-3">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="rounded-xl border px-4 py-3 text-center text-sm font-semibold text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}