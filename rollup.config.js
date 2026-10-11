import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import path from "path";

export default {
  input: "src/EthiopiaDatePicker.tsx",
  output: [
    { file: "dist/index.cjs.js", format: "cjs", exports: "named" },
    { file: "dist/index.esm.js", format: "esm" },
  ],
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    }),
    typescript({ useTsconfigDeclarationDir: true }),
  ],
  external: ["react", "react-dom"],
};
