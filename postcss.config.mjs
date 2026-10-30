import path from "node:path";

const stripBomPlugin = path.resolve("strip-bom-postcss.cjs");

const config = {
  plugins: {
    [stripBomPlugin]: {},
    "@tailwindcss/postcss": {},
  },
};

export default config;
