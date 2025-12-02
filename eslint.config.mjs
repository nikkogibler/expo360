import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore files and directories
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "src/app/admin/**",
      "src/components/AdminDashboard.tsx",
      "src/components/BuildWizard.tsx",
      "src/components/BuildWizardSimplified.tsx",
      "src/components/ClientLeadForm.tsx",
      "src/components/ImageStandardizer.tsx",
      "src/components/MainLeadForm.tsx",
      "src/components/SafeImage.tsx",
      "src/context/**",
      "src/utils/navigation.ts",
    ]
  },
  // Override for specific rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    }
  }
];

export default eslintConfig;
