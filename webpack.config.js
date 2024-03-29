var path = require('path');
var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');

module.exports = {
  entry: './src/game.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'www/build'),
    hashFunction: 'sha256'
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './www'),
    },
    devMiddleware: {
      publicPath: '/build/',
    },
    host: '0.0.0.0',
    port: 8080,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.d.ts'],
    alias: {
      phaser: phaser
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
    ]
  }
};
