module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 13,
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'use-isnan': 'error',
    'valid-jsdoc': [
      'error',
      {
        'prefer': {
          'arg': 'param',
          'argument': 'param',
          'return': 'returns'
        },
        'requireReturn': false,
        'requireParamDescription': true,
        'requireReturnDescription': true,
        'requireReturnType': true
      }
    ],
    'no-const-assign': 'error',
    'no-dupe-args': 'error',
    'no-dupe-else-if': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': [
      'error',
      {
        'skipStrings': true,
        'skipComments': true,
        'skipRegExps': true
      }
    ],
    'no-loss-of-precision': 'error',
    'no-self-assign': 'error',
    'no-unreachable': 'error',
    'valid-typeof': 'error',
    'curly': [
      'error',
      'multi-line'
    ],
    'multiline-comment-style': [
      'error',
      'starred-block'
    ],
    'no-confusing-arrow': [
      'error',
      {
        'allowParens': true
      }
    ],
    'no-prototype-builtins': 'off',
    'no-extra-semi': 'error',
    'no-extra-parens': 'error',
    'no-extra-boolean-cast': 'error',
    'no-multi-spaces': 'error',
    'no-unneeded-ternary': 'error',
    'no-lonely-if': 'error',
    'array-bracket-spacing': [
      'error',
      'never'
    ],
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'arrow-spacing': [
      'error',
      {
        'before': true,
        'after': true
      }
    ],
    'brace-style': [
      'error',
      '1tbs',
      {
        'allowSingleLine': true
      }
    ],
    'block-spacing': [
      'error',
      'always'
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    'comma-spacing': [
      'error',
      {
        'before': false,
        'after': true
      }
    ],
    'comma-style': [
      'error',
      'last'
    ],
    'computed-property-spacing': [
      'error',
      'never'
    ],
    'func-call-spacing': [
      'error',
      'never'
    ],
    'implicit-arrow-linebreak': [
      'error',
      'beside'
    ],
    'key-spacing': [
      'error',
      {
        'mode': 'strict'
      }
    ],
    'keyword-spacing': [
      'error',
      {
        'before': true,
        'after': true
      }
    ],
    'lines-around-comment': [
      'error',
      {
        'beforeBlockComment': true,
        'beforeLineComment': true,
        'allowBlockStart': true,
        'allowBlockEnd': true,
        'allowObjectStart': true,
        'allowObjectEnd': true,
        'allowArrayStart': true,
        'allowArrayEnd': true
      }
    ],
    'nonblock-statement-body-position': [
      'error',
      'beside'
    ],
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'object-property-newline': 'error',
    'rest-spread-spacing': [
      'error',
      'never'
    ],
    'semi-spacing': [
      'error',
      {
        'before': false,
        'after': true
      }
    ],
    'semi-style': [
      'error',
      'last'
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'switch-colon-spacing': [
      'error',
      {
        'after': true,
        'before': false
      }
    ],
    'wrap-regex': 'error',
    'wrap-iife': [
      'error',
      'inside'
    ]
  }
};
