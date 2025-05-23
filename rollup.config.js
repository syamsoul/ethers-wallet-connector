import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs({
      transformMixedEsModules: true
    }),
    json()
  ],
  external: ['ws'] // Mark WebSocket as external
};