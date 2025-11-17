// import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/customer/LandingPage";
import LandingPage2 from "./pages/customer/Dashboard";
import Contact from "./pages/customer/Contact";
import Catalog from "./pages/customer/Unit";
import { Loader } from "./components/Loader";
import LoginPage from "./pages/auth/Login";
import LayoutCustomer from "./components/layout/LayoutCustomer";
import LayoutAdmin from "./components/layout/LayoutAdmin";
import Dashboard from "./pages/admin/Dashboard";
import AdminAuth from "./helpers/ValidateToken";
import MasterUnit from "./pages/admin/unit/Index";
import DetailUnit from "./pages/admin/unit/Detail";
import NotFoundPage from "./components/PageNotFound";
import PageLoader from "./components/PageLoader";
import CreateUnitPage from "./pages/admin/unit/Create";
import UpdateUnitPage from "./pages/admin/unit/Update";
import UpdateVariantUnitPage from "./pages/admin/unit/UpdateVariant";
import RentalForm from "./pages/customer/RentalForm";

export default function App() {
  // const [loading, setLoading] = useState(true);

  // // loader saat pertama kali mount
  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 1500); // 0.5s simulasi loading
  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return <Loader />;
  // }

  return (
    <PageLoader>
      <Routes>
        <Route path="/" element={<LayoutCustomer />}>
          <Route index element={<LandingPage2 />} />
          <Route path="unit" element={<Catalog />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route
          path="/"
          element={
            <AdminAuth>
              <LayoutAdmin />
            </AdminAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu/unit" element={<MasterUnit />} />
          <Route path="menu/unit/create" element={<CreateUnitPage />} />
          <Route
            path="menu/unit/update/:unitCode"
            element={<UpdateUnitPage />}
          />
          <Route
            path="menu/unit/variant/update/:variantUnitCode"
            element={<UpdateVariantUnitPage />}
          />
          <Route path="menu/unit/:unitCode" element={<DetailUnit />} />
        </Route>

        <Route
          path="/login"
          element={
            <AdminAuth>
              <LoginPage />
            </AdminAuth>
          }
        />

        <Route path="rent-form" element={<RentalForm />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageLoader>
  );
}
