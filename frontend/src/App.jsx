import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/customer/Dashboard";
import Contact from "./pages/customer/Contact";
import Unit from "./pages/customer/Unit";
import { Loader } from "./components/Loader";

export default function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // loader saat pertama kali mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500); // 0.5s simulasi loading
    return () => clearTimeout(timer);
  }, []);

  // loader tiap pindah route
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // 0.5s simulasi loading
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="unit" element={<Unit />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}
