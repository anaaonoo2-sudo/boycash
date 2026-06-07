import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    base: '',
    define: {
      'import.meta.env.VITE_ADMOB_REWARDED_ID': JSON.stringify(env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-3940256099942544/5224354917"),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        external: ['@react-native-async-storage/async-storage'],
      },
    },
    server: {
      hmr: false,
      cors: true,
      watch: null,
    },
  };
});
