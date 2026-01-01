import next from "eslint-config-next";

export default [
  {
    ignores: [".next/**", "node_modules/**"]
  },
  ...next
];
