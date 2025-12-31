import { useState } from "react";

const sizeMap = {
  6: "w-6 h-6",
  8: "w-8 h-8",
  10: "w-10 h-10",
  12: "w-12 h-12",
};

const Avatar = ({ image, name, size = 8 }) => {
  const [error, setError] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const initial = name?.[0]?.toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} flex-shrink-0 rounded-full overflow-hidden
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
