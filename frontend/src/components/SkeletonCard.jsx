"use client";

// 💡 KOMPONEN BARU: Skeleton Card untuk Loading
export default function SkeletonCard() {
  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 h-56 flex items-center justify-center">
        <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="border-t border-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  );
}
