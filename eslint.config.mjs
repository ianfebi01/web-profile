import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: [
        ...nextCoreWebVitals,
        ...compat.extends("plugin:@typescript-eslint/recommended"),
        ...compat.extends("plugin:react/recommended")
    ],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {},
        ecmaVersion: "latest",
        sourceType: "script",

        parserOptions: {
            ecmaFeatures: {},
        },
    },

    rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",

        "key-spacing": ["error", {
            align: "colon",
            beforeColon: true,
            afterColon: true,
        }],

        "brace-style": "error",
        indent: ["error", 2],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "space-in-parens": ["error", "always"],

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: "var",
            next: "return",
        }],

        "newline-before-return": "error",
        "object-curly-spacing": ["error", "always"],
        "no-console": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
            maxEOF: 0,
        }],

        "@typescript-eslint/type-annotation-spacing": "error",
        "react/react-in-jsx-scope": "off",

        "react/jsx-max-props-per-line": [1, {
            maximum: 1,
        }],

        "react/jsx-closing-bracket-location": 1,
    },
}]);