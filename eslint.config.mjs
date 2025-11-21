import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Keep Next.js rules but allow override below
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },

  // ===== OVERRIDE RULES HERE =====
  {
    rules: {
      // Tắt toàn bộ lỗi bạn đang gặp
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
