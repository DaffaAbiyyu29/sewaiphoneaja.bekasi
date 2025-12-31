// import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/customer/LandingPage";
import LandingPage2 from "./pages/customer/Dashboard";
import Pesanan from "./pages/customer/Pesanan";
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
import RentalPage from "./pages/admin/rental";
import RentalDetail from "./pages/admin/rental/Detail";
import CustomerPage from "./pages/admin/customer/Index";
import CustomerDetailPage from "./pages/admin/customer/Detail";
import UserPage from "./pages/admin/user/Index";
import CreateUserPage from "./pages/admin/user/Create";
import DetailUserPage from "./pages/admin/user/Detail";
import UpdateUserPage from "./pages/admin/user/Update";
import ProfileUserPage from "./pages/admin/profile";

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
          <Route path="pesanan" element={<Pesanan />} />
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
          <Route path="menu/customer" element={<CustomerPage />} />
          <Route path="menu/customer/:customerId" element={<CustomerDetailPage />} />
          <Route path="menu/user" element={<UserPage />} />
          <Route path="menu/user/create" element={<CreateUserPage />} />
          <Route path="menu/user/:nik" element={<DetailUserPage />} />
          <Route path="menu/user/update/:nik" element={<UpdateUserPage />} />
          <Route path="menu/rental" element={<RentalPage />} />
          <Route path="menu/rental/:rentId" element={<RentalDetail />} />
          <Route path="menu/profile" element={<ProfileUserPage />} />
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
