/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const isTest = process.env.VITEST === 'true'
  const isDevServer = !isBuild && !isTest

  return {
    // During `vite` (dev) we serve the playground page; during `vite build`
    // and Vitest runs we operate from the repo root.
    root: isDevServer ? resolve(__dirname, 'playground') : undefined,

    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      },
      rollupOptions: {
        // Keep the bundle clean: don't bundle any future runtime deps.
        external: [],
      },
    },

    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      globals: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.test.ts'],
      },
    },
  }
})
