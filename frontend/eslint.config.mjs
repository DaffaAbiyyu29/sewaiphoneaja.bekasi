import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Mengabaikan folder hasil build agar tidak di-scan
  {
    ignores: ["dist", "node_modules", "build"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect", // Otomatis mendeteksi versi React yang Anda gunakan
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // 1. Menggunakan aturan rekomendasi dari plugin
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 2. MATIKAN: Peringatan missing dependency useEffect (sesuai request awal)
      "react-hooks/exhaustive-deps": "off",

      // 3. MATIKAN: Validasi prop-types agar komponen seperti Tooltip tidak error
      "react/prop-types": "off",

      // 4. MATIKAN: Aturan lama yang mewajibkan import React di setiap file JSX
      "react/react-in-jsx-scope": "off",

      // 5. AKTIFKAN: Deteksi variabel typo atau tidak terdefinisi (seperti rolesx)
      "no-undef": "error",

      // 6. AKTIFKAN: Deteksi variabel/fungsi yang dibuat tapi tidak dipakai
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          varsIgnorePattern: "^_", // Abaikan jika nama variabel diawali underscore (misal: _data)
          caughtErrors: "none",
        },
      ],

      // 7. AKTIFKAN: Aturan dasar hooks agar penggunaan hook tetap benar secara struktur
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
