// src/components/GalleryUnit.jsx
import React from "react";
import { useMemo } from "react";

/**
 * Komponen untuk menampilkan galeri gambar unit, termasuk gambar utama dan navigasi thumbnail.
 *
 * @param {{
 * unit: object,
 * selectedVariant: object,
 * mainImage: { id: string | null, src: string | null },
 * setMainImage: (imgObj: { id: string | null, src: string | null }) => void,
 * API_URL: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function GalleryUnit({
  unit,
  selectedVariant,
  mainImage,
  setMainImage,
  API_URL,
}) {
  const [thumbStartIndex, setThumbStartIndex] = React.useState(0);
  const maxThumbs = 6;

  // Gabungkan foto unit utama dan foto varian menjadi satu daftar
  const detailImages = useMemo(() => {
    return [
      { id: "unit-photo", src: unit.photo || null, isVariant: false },
      ...(unit.variants?.map((v, i) => ({
        id: `variant-${i}`,
        src: v.photo || null,
        isVariant: true,
        variantIndex: i,
        variantCode: v.variant_unit_code,
      })) || []),
    ];
  }, [unit]);

  // Sinkronisasi Main Image saat selectedVariant berubah
  React.useEffect(() => {
    if (unit && unit.variants?.length > 0) {
      const variantImage = detailImages.find(
        (img) =>
          img.isVariant &&
          img.variantCode === selectedVariant?.variant_unit_code
      );
      if (variantImage) {
        setMainImage(variantImage);
        // Atur thumbStartIndex agar gambar varian yang baru terpilih terlihat
        const globalIndex = detailImages.findIndex(
          (img) => img.id === variantImage.id
        );
        if (globalIndex !== -1) {
          if (globalIndex < thumbStartIndex) {
            setThumbStartIndex(globalIndex);
          } else if (globalIndex >= thumbStartIndex + maxThumbs) {
            setThumbStartIndex(globalIndex - maxThumbs + 1);
          }
        }
      }
    } else if (unit) {
      // Jika tidak ada varian, pastikan gambar utama unit yang terpilih
      setMainImage({ id: "unit-photo", src: unit.photo || null });
    }
  }, [selectedVariant, unit, detailImages, setMainImage]);

  const visibleThumbs = detailImages.slice(
    thumbStartIndex,
    thumbStartIndex + maxThumbs
  );

  const handlePrevThumbs = () =>
    setThumbStartIndex((prev) => Math.max(0, prev - maxThumbs));

  const handleNextThumbs = () =>
    setThumbStartIndex((prev) =>
      Math.min(
        prev + maxThumbs,
        detailImages.length > maxThumbs ? detailImages.length - maxThumbs : prev
      )
    );

  const handleClickThumb = (imgObj, globalIndex) => {
    setMainImage(imgObj);
    // Auto-scroll logic (optional, but good for UX)
    if (globalIndex < thumbStartIndex) {
      setThumbStartIndex(globalIndex);
    } else if (globalIndex >= thumbStartIndex + maxThumbs) {
      setThumbStartIndex(globalIndex - maxThumbs + 1);
    }
  };

  // Pastikan mainImage default jika belum disetel (misalnya saat modal baru dibuka)
  React.useEffect(() => {
    if (!mainImage.src && detailImages.length > 0) {
      setMainImage(detailImages[0]);
    }
  }, [mainImage.src, detailImages, setMainImage]);

  if (detailImages.length === 0) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Image Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner mb-4">
        <div className="flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
          {mainImage.src ? (
            <img
              src={`${API_URL}/get-image/${mainImage.src}`}
              alt={unit.unit_name}
              className="object-contain max-h-[300px] lg:max-h-[500px] w-full rounded-xl transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] lg:h-[500px] w-full bg-white rounded-xl border-2 border-dashed border-gray-300">
              <svg
                className="w-16 h-16 text-gray-300 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-400 text-sm font-medium">
                No Image Available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {detailImages.length > 1 && (
        <div className="flex items-center gap-3">
          {thumbStartIndex > 0 && (
            <button
              onClick={handlePrevThumbs}
              className="flex-shrink-0 p-2 bg-blue-900 rounded-lg text-white hover:bg-blue-800 transition-colors shadow-md"
              aria-label="Previous thumbnails"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div className="flex-1 flex gap-2 overflow-hidden p-3">
            {visibleThumbs.map((imgObj, idx) => {
              const globalIndex = detailImages.findIndex(
                (item) => item.id === imgObj.id
              );
              const isActive = mainImage.id === imgObj.id;

              return (
                <button
                  key={imgObj.id}
                  onClick={() => handleClickThumb(imgObj, globalIndex)}
                  className={`flex-shrink-0 w-20 h-20 border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "border-blue-900 ring-2 ring-blue-900 ring-offset-2 shadow-lg scale-105"
                      : "border-gray-300 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  {imgObj.src ? (
                    <img
                      src={`${API_URL}/get-image/${imgObj.src}`}
                      alt={`Thumbnail ${globalIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {thumbStartIndex + maxThumbs < detailImages.length && (
            <button
              onClick={handleNextThumbs}
              className="flex-shrink-0 p-2 bg-blue-900 rounded-lg text-white hover:bg-blue-800 transition-colors shadow-md"
              aria-label="Next thumbnails"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
