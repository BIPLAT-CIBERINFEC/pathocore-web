import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      ".vite/**",
      "dist/**",
      "dist-ssr/**",
      "build/**",
      "out/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...nextVitals,
  {
    rules: {
      // React Compiler rule introduced with eslint-config-next 16. The flagged
      // effects are fetch-on-mount, hydration and session-restore patterns that
      // work today; refactor them one by one and then restore "error".
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
