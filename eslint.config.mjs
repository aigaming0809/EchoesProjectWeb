import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Card artwork is loaded from a user-managed folder or an external CDN with
      // runtime fallbacks, so plain <img> is intentional here.
      "@next/next/no-img-element": "off",
    },
  },
]);
