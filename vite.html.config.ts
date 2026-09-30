import { defineConfig, mergeConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import base from './vite.config';

/** Builds the whole game into one self-contained HTML file (dist-html/shardbound.html). */
export default mergeConfig(
  base,
  defineConfig({
    plugins: [viteSingleFile()],
    base: './',
    build: { outDir: 'dist-html', emptyOutDir: true },
  }),
);
