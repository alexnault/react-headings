import { build } from "esbuild";

const builds = [
  { outfile: "dist/index.js", env: "production" },
  { outfile: "dist/index.development.js", env: "development" },
];

await Promise.all(
  builds.map(({ outfile, env }) =>
    build({
      entryPoints: ["src/index.tsx"],
      outfile,
      bundle: true,
      packages: "external",
      format: "esm",
      target: "es2020",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": JSON.stringify(env) },
      minifySyntax: true,
    }),
  ),
);
