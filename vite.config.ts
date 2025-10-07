import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // ✅ CRITICAL: Set base path for GitHub Pages
  const basepath = mode === "production"
    ? "/studybuddy-moodflow-main/"  // ← MUST MATCH YOUR REPO NAME EXACTLY
    : "/";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: basepath, // ✅ THIS IS THE FIX — DO NOT FORGET THIS!
  };
});
