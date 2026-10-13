import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const pathResolve = (dir: string) => {
  return resolve(__dirname, ".", dir);
};

const alias: Record<string, string> = {
  "@": pathResolve("./src/"),
};
export default defineConfig({
  resolve: { alias },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/style/variables.scss" as *;`
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash:8].js",
        chunkFileNames: "assets/[name]-[hash:8].js",
        assetFileNames: "assets/[name]-[hash:8][extname]"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      ["/yi"]: {
        // target: "http://yigongbao.hanjor.top/api",
        // target: "http://81.70.104.108:8082/api",
          target: "http://localhost:8081/api",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/yi/, ""),
      },
    },
  },
});
