import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

export default [
  ...nextVitals,
  prettier,
  {
    rules: {
      quotes: "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "import/no-anonymous-default-export": "off",
      "no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
];
