import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ScrollToTop />
      <Header />
      <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-7xl px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;