import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV !== "production" ? "/test/" : "/forms/BasicForm/",
  cacheDir: "/tmp/.vite",
  server: {
    host: true,
    port: 8081,
    base: "/test/",
    fs: {
      strict: false,
      allow: ["."],
    },
    hmr: {
      host: "presalescalax.ucontactcloud.com/test/ws",
    },
  },
});
