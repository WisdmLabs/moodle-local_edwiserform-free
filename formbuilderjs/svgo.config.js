module.exports = {
  plugins: [
    { name: "cleanupAttrs", params: { active: true } },
    { name: "removeDimensions", params: { active: true } },
    { name: "removeTitle", params: { active: true } },
    { name: "removeUselessDefs", params: { active: true } },
    { name: "mergePaths", params: { active: true } },
    { name: "removeStyleElement", params: { active: true } },
    { name: "removeNonInheritableGroupAttrs", params: { active: true } },
  ],
};
