"use client";

export default function ActionButton({
  children,
  onClick,
  loading,
  variant = "primary",
  disabled,
}) {
  const base =
    "px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-blue-900 text-white hover:bg-blue-800"
      : "bg-gray-100 text-gray-900 hover:bg-gray-200";
  return (
    <button
      onClick={onClick}
      className={`${base} ${styles}`}
      disabled={disabled || loading}
    >
      {loading ? "Menyimpan..." : children}
    </button>
  );
}
