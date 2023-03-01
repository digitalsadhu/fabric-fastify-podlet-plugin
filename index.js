// @ts-nocheck

import { parse } from "node:path";
import { readFile } from "node:fs/promises";
import fs from "fs";
import postcss from "postcss";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import atImport from "postcss-import";
import presetEnv from "postcss-preset-env";
import { breakpoints as customMedia } from "@fabric-ds/css/colors.js";
import tailwindConfig from "@fabric-ds/css/tailwind-config";

const CWD = process.cwd();

async function buildCSS() {
  const from = new URL("./styles.css", import.meta.url).pathname;
  const css = fs.readFileSync(from, "utf-8");
  const plugins = [
    atImport,
    tailwind({
      ...tailwindConfig,
      purge: {
        enabled: true,
        // set this to point at your source files. These will be scanned for Tailwind class usage.
        // The CSS for any classes found will be included in the build
        content: [
          `${CWD}/content.js`,
          `${CWD}/content.ts`,
          `${CWD}/fallback.js`,
          `${CWD}/fallback.ts`,
          `${CWD}/src/**/*.js`,
          `${CWD}/src/**/*.ts`,
        ],
        // You can add classes that should never be purged here. Probably won't need to do this though.
        safelist: [],
      },
    }),
    presetEnv({
      stage: 0,
      // browsers: 'extends @finn-no/browserslist-config',
      importFrom: { customMedia },
      features: {
        "focus-visible-pseudo-class": false,
      },
    }),
    autoprefixer,
    cssnano({ preset: "default" }),
  ];
  const result = await postcss(plugins).process(css, { from });
  // this line first ensures that Tailwind classnames with : are properly escaped
  // and then maps prefixes correctly.
  return result.css.replaceAll("\\", "\\\\").replaceAll("--tw-", "--f-");
}
console.log('loading plugin')
// Exporting this function will get picked up by Podium and plugged into the build
export default () => ({
  name: "esbuild-fabric-css",
  setup(build) {
    build.onLoad({ filter: /(content|fallback)\.(ts|js)$/ }, async (args) => {
      const { ext } = parse(args.path);
      const input = await readFile(args.path, "utf8");
      if (!input.includes('@fabric-css')) {
        // if theres no @fabric-css placeholder, theres no point in continuing
        return;
      }
      const css = await buildCSS();
      const contents = `${input.replace("@fabric-css", css)}`;
      return {
        contents,
        loader: ext.replace('.', ''),
      };
    });
  },
});
