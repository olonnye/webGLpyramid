const path = require("path");

const config = {
  entry: "./dist/index.js",
  output: {
    path: path.resolve(__dirname, "public/javascripts"),
    filename: "bundle.js"
  }
};

module.exports = config;
