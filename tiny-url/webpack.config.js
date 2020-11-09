/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: "./src/tiny_url.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ],
    fallback: {
        "url": require.resolve("url/"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "zlib": require.resolve("browserify-zlib"),
        "assert": require.resolve("assert/"),
        "fs": require.resolve("fs")
    }
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: "packed_tiny_url.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs"
  },
};