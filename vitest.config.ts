import { defineConfig } from 'vitest/config'
import path from 'path'
import { execSync } from 'child_process'

const getAppVersion = () => {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim().replace(/^v/, '')
  } catch {
    return '0.0.0'
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    {
      name: 'pwa-virtual-module',
      resolveId(id: string) {
        if (id === 'virtual:pwa-register/react') {
          return '\0virtual:pwa-register/react'
        }
      },
      load(id: string) {
        if (id === '\0virtual:pwa-register/react') {
          return 'export const useRegisterSW = () => ({ needRefresh: [false], updateServiceWorker: (cb) => { cb?.(); return undefined } })'
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
