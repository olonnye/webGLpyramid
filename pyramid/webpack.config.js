const path = require("path");

const config = {
  entry: "./dist/index.js",
  output: {
    path: path.resolve(__dirname, "public/javascripts"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000, // Convert images < 8kb to base64 strings
              name: "public/images/[hash]-[name].[ext]"
            }
          }
        ]
      }
    ]
  }
};

module.exports = config;
