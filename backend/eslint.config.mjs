import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks"; // Import plugin hooks
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      "react-hooks": reactHooks, // Daftarkan plugin
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // 1. Tetap tampilkan error untuk fungsi/variabel tidak terpakai
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
        },
      ],

      // 2. MATIKAN peringatan missing dependency useEffect
      "react-hooks/exhaustive-deps": "off",

      // 3. Pastikan aturan dasar hooks tetap aktif (opsional tapi disarankan)
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
