module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  root: true,
  rules: {
    'no-var': 'error',
    'no-console': 1,
    'prettier/prettier': 2,
    '@typescript-eslint/no-unused-vars': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-duplicate-imports': 'error',
    'prefer-const': 'warn',
    semi: ['error', 'always'],
    '@typescript-eslint/comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        enums: 'always-multiline',
        functions: 'never',
      },
    ],
    '@typescript-eslint/comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'jsx-quotes': ['error', 'prefer-double'],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'arrow-body-style': ['error', 'as-needed'],
  },
};
