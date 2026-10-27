import next from "eslint-config-next";

// Règles d'accessibilité (RGAA / WCAG) : on réutilise le plugin jsx-a11y déjà
// embarqué par eslint-config-next (aucune dépendance supplémentaire) et on active
// tout son preset "recommended" (next n'en active que 6 règles).
const jsxA11y = next.find((config) => config.plugins?.["jsx-a11y"])?.plugins["jsx-a11y"];
const a11yRules = Object.fromEntries(
  Object.entries(jsxA11y?.configs?.recommended?.rules ?? {}).map(([rule, value]) => [
    rule,
    Array.isArray(value) ? ["warn", ...value.slice(1)] : value === "off" ? "off" : "warn",
  ])
);

const config = [
  {
    ignores: [".next/**", "node_modules/**"]
  },
  ...next,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...a11yRules,
      // <ul role="list"> garde la sémantique de liste dans Safari/VoiceOver quand list-style: none
      "jsx-a11y/no-redundant-roles": ["warn", { nav: ["navigation"], ul: ["list"], ol: ["list"] }],
    },
  },
];

export default config;
