const path = require('path');

const bundle = {
  entry: './js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'bundle.js',
    library: 'CookieControl',
    libraryTarget: 'umd',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env', 'babel-preset-stage-1'],
          },
        },
      },
    ],
  },
};

module.exports = [bundle];
