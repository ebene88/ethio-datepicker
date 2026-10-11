import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      banner: '"use client";',
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      banner: '"use client";',
      sourcemap: true,
    },
  ],
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    }),
    postcss({
      extract: "index.css",
      minimize: true,
    }),
    typescript({
      include: ["src/**/*"],
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
  ],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react-hook-form",
  ],
};
