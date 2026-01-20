import { useState } from "react";

const sizeMap = {
  4: "w-4 h-4",
  6: "w-6 h-6",
  8: "w-8 h-8",
  10: "w-10 h-10",
  12: "w-12 h-12",
  14: "w-14 h-14",
  16: "w-16 h-16",
  20: "w-20 h-20",
  24: "w-24 h-24",
  32: "w-32 h-32",
  full: "w-full h-full",
};

const textSizeMap = {
  4: "text-[10px]",
  6: "text-xs",
  8: "text-sm",
  10: "text-base",
  12: "text-lg",
  14: "text-xl",
  16: "text-2xl",
  20: "text-3xl",
  24: "text-4xl",
  32: "text-5xl",
  full: "text-4xl md:text-5xl lg:text-6xl",
};

const Avatar = ({ image, name, size = 8 }) => {
  const [error, setError] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const initial = name?.[0]?.toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} ${textSizeMap[size]} flex-shrink-0 rounded-full overflow-hidden
			flex items-center justify-center
			bg-blue-900 text-white font-semibold`}
    >
      {!error && image ? (
        <img
          src={`${API_URL}/get-image/${image}`}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          alt={name}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

export default Avatar;
