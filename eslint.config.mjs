import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Import any plugins you want to use
// import somePlugin from "eslint-plugin-some-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  // Add custom rules
  {
    rules: {
      // "no-unused-vars": "error",
      // "no-console": "warn",
      // Add more rules as needed
    },
  },

  // Add plugins
  {
    extends: [],
    // Optional: target specific files
    // files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    // plugins: {
    //   someplugin: somePlugin
    // },
    // rules: {
    //   "someplugin/rule-name": "error"
    // }
  },
];

export default eslintConfig;
