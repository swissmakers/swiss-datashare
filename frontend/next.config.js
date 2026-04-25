/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

const rootPackageJsonPath = path.resolve(__dirname, "../package.json");
const frontendPackageJsonPath = path.resolve(__dirname, "./package.json");
const versionSourcePath = fs.existsSync(rootPackageJsonPath)
  ? rootPackageJsonPath
  : frontendPackageJsonPath;
const { version } = require(versionSourcePath);

module.exports = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  env: {
    VERSION: version,
  },
};
