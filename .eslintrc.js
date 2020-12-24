module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'rules': {
        'indent': [
            'error',
            4,
            { 'SwitchCase': 1 }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single',
            { 'allowTemplateLiterals': true }
        ],
        'semi': [
            'error',
            'always'
        ],
        'block-spacing': [
            'error',
            'always'
        ],
        'keyword-spacing': [
            'error'
        ],
        'key-spacing': [
            'error'
        ],
        'no-irregular-whitespace': [
            'error'
        ],
        'no-multi-str': [
            'error'
        ],
        'no-trailing-spaces': [
            'error'
        ],
        'no-cond-assign': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-this-alias': 'off'
    }
};
