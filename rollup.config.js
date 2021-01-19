import run from '@rollup/plugin-run';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const isDev = process.env.NODE_ENV !== 'production';

export default {
  input: 'src/start.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    isDev && run(),
    typescript(),
    commonjs(),
    json(),
    esbuild({
      include: /\.[jt]sx?$/, // default, inferred from `loaders` option
      exclude: /node_modules/,
      minify: process.env.NODE_ENV === 'production',
      target: 'es2015',
      // Like @rollup/plugin-replace
      define: {
        __PROD__: process.env.NODE_ENV
      },
      tsconfig: 'tsconfig.json',
      // Add extra loaders
      loaders: {
        // Add .json files support
        // require @rollup/plugin-commonjs
        '.json': 'json',
      }
    }),
  ],
};