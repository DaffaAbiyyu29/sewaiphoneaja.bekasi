// components/PageLoader.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader } from "./Loader";

export default function PageLoader({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500); // durasi animasi loader
    return () => clearTimeout(timer);
  }, [location.pathname]); // jalan setiap path berubah

  if (loading) return <Loader />;

  return children;
}
<<<<<<< HEAD
=======

//testing push and git
>>>>>>> repoB/main
