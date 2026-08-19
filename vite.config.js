import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function readBuildEnv(env, ...keys) {
  for (const key of keys) {
    const value = env[key] || process.env[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY', 'VITE_API_KEY')),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN', 'VITE_AUTH_DOMAIN')),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID', 'VITE_PROJECT_ID')),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET', 'VITE_STORAGE_BUCKET')),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID', 'VITE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGINGSENDERID')),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID', 'VITE_APP_ID')),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(readBuildEnv(env, 'VITE_FIREBASE_MEASUREMENT_ID', 'FIREBASE_MEASUREMENT_ID', 'VITE_MEASUREMENT_ID')),
    },
    build: {
      outDir: 'dist',
    },
  }
})
