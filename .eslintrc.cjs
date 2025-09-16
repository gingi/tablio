module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/stylistic",
        "plugin:jsx-a11y/recommended",
        "prettier",
    ],
    ignorePatterns: ["build/**"],
    settings: {
        react: { version: "detect" },
    },
    env: { browser: true, es2021: true, node: true },
    parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: "latest", sourceType: "module" },
    rules: {
        // React specifics
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        // Formatting / style
        indent: ["error", 4, { SwitchCase: 1 }],
        "@typescript-eslint/indent": "off",
        quotes: ["error", "double", { avoidEscape: true }],
        // Unused vars (TS-aware)
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        // Accessibility enhancements (keep mostly warnings initially)
        "jsx-a11y/control-has-associated-label": "warn",
        "jsx-a11y/anchor-is-valid": "warn",
        "jsx-a11y/aria-role": "warn",
        "jsx-a11y/no-autofocus": "warn",
        // Ensure interactive elements are keyboard accessible
        "jsx-a11y/no-static-element-interactions": "off", // opt-in later if needed
        "jsx-a11y/click-events-have-key-events": "warn",
    },
    overrides: [
        {
            files: ["src/test/**/*.{ts,tsx}"],
            env: { browser: true, node: true },
            globals: {
                describe: "readonly",
                test: "readonly",
                it: "readonly",
                expect: "readonly",
                vi: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly"
            },
            rules: {
                "@typescript-eslint/no-empty-function": "off",
                "@typescript-eslint/no-explicit-any": "off",
            },
        },
    ],
};
