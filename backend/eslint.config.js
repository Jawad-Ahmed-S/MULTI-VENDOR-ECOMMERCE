import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // Enables import/export syntax support
      globals: {
        ...globals.node,    // Enables Node.js globals like process, console
      },
    },
    rules: {
      "no-unused-vars": "warn",      // Warns you if you import/create a variable but don't use it
      "no-undef": "error",          // Errors right away if you use an undefined variable
      "eqeqeq": "error",            // Requires === instead of ==
    },
  },
];
