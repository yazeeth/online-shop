import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import Profile from "../pages/Profile";
import Categories from "../pages/Categories";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";
import AdminDashboard from "../pages/admin/Dashboard.tsx";
import OrdersManagement from "../pages/admin/OrdersManagement";
import PaymentsManagement from "../pages/admin/PaymentsManagement";
import ProductsManagement from "../pages/admin/ProductsManagement";
import CategoriesManagement from "../pages/admin/CategoriesManagement";
import UsersManagement from "../pages/admin/UsersManagement";
import type { ReactNode } from "react";

function CustomerOnly({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const isAdmin = String(user?.role ?? "").toUpperCase() === "ADMIN";

  if (isAdmin) {
    return <Home />;
  }

  return <>{children}</>;
}

// Customer and admin application routes.
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "products/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: (
          <CustomerOnly>
            <Cart />
          </CustomerOnly>
        ),
      },
      {
        path: "checkout",
        element: (
          <CustomerOnly>
            <Checkout />
          </CustomerOnly>
        ),
      },
      {
        path: "orders",
        element: (
          <CustomerOnly>
            <Orders />
          </CustomerOnly>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <CustomerOnly>
            <OrderDetails />
          </CustomerOnly>
        ),
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "products",
            element: <ProductsManagement />,
          },
          {
            path: "categories",
            element: <CategoriesManagement />,
          },
          {
            path: "orders",
            element: <OrdersManagement />,
          },
          {
            path: "users",
            element: <UsersManagement />,
          },
          {
            path: "payments",
            element: <PaymentsManagement />,
          },
        ],
      },
    ],
  },
]);

export default router;