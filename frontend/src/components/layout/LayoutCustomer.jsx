import { Outlet, Link } from "react-router-dom";
import Header from "../customer/Header";
import Footer from "../customer/Footer";

export default function LayoutCustomer() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
