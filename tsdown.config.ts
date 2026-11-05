import { defineConfig, type UserConfig } from "tsdown";

const build = (env: "production" | "development"): UserConfig => ({
  entry: {
    [env === "production" ? "index" : "index.development"]: "src/index.tsx",
  },
  format: "esm",
  target: "es2020",
  fixedExtension: false,
  dts: env === "production",
  clean: false,
  define: { "process.env.NODE_ENV": JSON.stringify(env) },
  // The single entry keeps its "use client" directive.
  checks: { moduleLevelDirective: false },
});

export default defineConfig([build("production"), build("development")]);
