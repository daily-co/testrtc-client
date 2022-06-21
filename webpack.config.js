const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(html)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
        },
      },
      {
        test: /\.(css|png|svg|jpg|jpeg|gif|ico)$/,
        loader: "file-loader",
        options: {
          name: (f) => {
            const dirName = path.relative(
              path.join(__dirname, "src"),
              path.dirname(f)
            );
            return `${dirName}/[name].[ext]`;
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};