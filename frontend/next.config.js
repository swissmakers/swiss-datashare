/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
module.exports = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  env: {
    VERSION: version,
  },
};
