// import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import LayoutAdmin from "./components/layout/LayoutAdmin";
import LayoutCustomer from "./components/layout/LayoutCustomer";
import PageLoader from "./components/PageLoader";
import NotFoundPage from "./components/PageNotFound";
import ProtectedRoute from "./helpers/ProtectedRoute";
import CustomerDetailPage from "./pages/admin/customer/Detail";
import CustomerPage from "./pages/admin/customer/Index";
import Dashboard from "./pages/admin/Dashboard";
import ProfileUserPage from "./pages/admin/profile";
import RentalDetail from "./pages/admin/rental/Detail";
import RentalPage from "./pages/admin/rental/Index";
import CreateUnitPage from "./pages/admin/unit/Create";
import DetailUnit from "./pages/admin/unit/Detail";
import MasterUnit from "./pages/admin/unit/Index";
import UpdateUnitPage from "./pages/admin/unit/Update";
import UpdateVariantUnitPage from "./pages/admin/unit/UpdateVariant";
import CreateUserPage from "./pages/admin/user/Create";
import DetailUserPage from "./pages/admin/user/Detail";
import UserPage from "./pages/admin/user/Index";
import UpdateUserPage from "./pages/admin/user/Update";
import LoginPage from "./pages/auth/Login";
import DashboardCust from "./pages/customer/Dashboard";
import Pesanan from "./pages/customer/Pesanan";
import RentalForm from "./pages/customer/RentalForm";
import Catalog from "./pages/customer/Unit";

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
        {/* CUSTOMER ROUTES - Public Access */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutCustomer />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardCust />} />
          <Route path="unit" element={<Catalog />} />
          <Route path="pesanan" element={<Pesanan />} />
        </Route>

        {/* ADMIN ROUTES - Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutAdmin />
            </ProtectedRoute>
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
          <Route path="menu/customer" element={<CustomerPage />} />
          <Route
            path="menu/customer/:customerId"
            element={<CustomerDetailPage />}
          />
          <Route path="menu/user" element={<UserPage />} />
          <Route path="menu/user/create" element={<CreateUserPage />} />
          <Route path="menu/user/:nik" element={<DetailUserPage />} />
          <Route path="menu/user/update/:nik" element={<UpdateUserPage />} />
          <Route path="menu/rental" element={<RentalPage />} />
          <Route path="menu/rental/:rentId" element={<RentalDetail />} />
          <Route path="menu/profile" element={<ProfileUserPage />} />
        </Route>

        {/* AUTH ROUTE */}
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        {/* RENTAL FORM - Public Access */}
        <Route
          path="rent-form"
          element={
            <ProtectedRoute>
              <RentalForm />
            </ProtectedRoute>
          }
        />

        {/* NOT FOUND */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageLoader>
  );
}
