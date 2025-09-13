/* eslint config */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'prettier',
    ],
    ignorePatterns: ['build/**'],
    settings: {
        react: { version: 'detect' },
    },
    env: { browser: true, es2021: true, node: true },
    parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        indent: ['error', 4, { SwitchCase: 1 }],
        '@typescript-eslint/indent': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        quotes: ['error', 'double', { avoidEscape: true }],
    },
    overrides: [
        {
            files: ['src/test/**/*.{ts,tsx}'],
            env: { browser: true, node: true },
            globals: {
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly'
            },
            rules: {
                '@typescript-eslint/no-empty-function': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
};
