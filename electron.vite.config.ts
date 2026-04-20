import obfuscator from 'vite-plugin-javascript-obfuscator';
import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(),
    obfuscator({
      include: ['src/**/*.ts', 'src/**/*.tsx'], // Target your source files
      apply: 'build', // CRITICAL: Only scramble the final .exe, not your local dev environment!
      debugger: false,
      options: {
        compact: true,
        controlFlowFlattening: true, 
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true, 
        deadCodeInjectionThreshold: 0.2,
        stringArray: true, 
        stringArrayEncoding: ['base64'],
        disableConsoleOutput: true // Hides your console.logs from testers
      }
    })
  ]
  }
})