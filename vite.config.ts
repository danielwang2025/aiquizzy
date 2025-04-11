import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer"; // 🧠 可视化分析工具

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({ open: true }), // 构建完自动弹出分析页面
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: true, // ✅ 拆分 CSS
    minify: "terser", // ✅ 更强压缩，默认也可以用 esbuild
    target: "es2015", // ✅ 输出兼容现代浏览器
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ✅ 拆分 node_modules 到 vendor
          if (id.includes("node_modules")) {
            return "vendor";
          }
          // ✅ 你还可以根据文件路径做更细拆分
          if (id.includes("src/pages")) {
            return "pages";
          }
          if (id.includes("src/components")) {
            return "components";
          }
        },
      },
    },
  },
}));
