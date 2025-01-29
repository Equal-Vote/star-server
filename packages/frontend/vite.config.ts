import * as path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
import ViteYaml from '@modyfi/vite-plugin-yaml';

const ENV_PREFIX = "REACT_APP_";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      envCompatible({ prefix: ENV_PREFIX }),
      ViteYaml(),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: env.FRONTEND_PORT ?? 3000,
      proxy: {
        "/API": {
          target: `${env.REACT_APP_BACKEND_URL ?? "http://localhost:5000"}`,
          changeOrigin: true,
          configure: (proxy, options) => {
          },
        },
      },
    },
    preview: {
      port: env.FRONTEND_PORT ?? 3000,
      proxy: {
        "/API": {
          target: `${env.REACT_APP_BACKEND_URL ?? "http://localhost:5000"}`,
          changeOrigin: true,
          configure: (proxy, options) => {
          },
        },
      },
    },
    optimizeDeps: {
      include: ['@equal-vote/star-vote-shared', '@equal-vote/star-vote-shared/**'],
    },
    build: {
      outDir: "build",
        commonjsOptions: {
          include: [/shared/, /node_modules/],
      },
      rollupOptions: {
        plugins: [
        ],
        output:{
          manualChunks(id) {
            if (id.includes('node_modules')) {
                return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
    },
  };
});

