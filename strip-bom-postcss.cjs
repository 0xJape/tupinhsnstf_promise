module.exports = function stripBom() {
  return {
    postcssPlugin: "strip-bom",
    Once(root) {
      root.source.input.hasBOM = false;
    },
  };
};
module.exports.postcss = true;
