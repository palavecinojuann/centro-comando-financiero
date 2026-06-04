import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
  },
  ...[].concat(firebaseRulesPlugin.configs['flat/recommended']).map(config => ({
    ...config,
    files: ['**/*.rules']
  }))
];

