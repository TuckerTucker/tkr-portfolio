import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    postcss: path.resolve(__dirname, '../postcss.config.js'),
  },
  server: {
    port: 61001
  }
});
