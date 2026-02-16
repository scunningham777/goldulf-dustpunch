const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/game.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'www/build'),
    clean: true
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
    extensions: ['.ts', '.js'],
    alias: {
      phaser: path.join(__dirname, '/node_modules/phaser/dist/phaser.js')
    }
  },
  module: {
    rules: [
      { 
        test: /\.ts$/, 
        loader: 'ts-loader', 
        exclude: /node_modules/ 
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'assets'), to: path.resolve(__dirname, 'www', 'assets') },
        { from: path.resolve(__dirname, 'src', 'service-worker.js'), to: path.resolve(__dirname, 'www', 'service-worker.js'), noErrorOnMissing: true },
        { from: path.resolve(__dirname, 'src', 'manifest.json'), to: path.resolve(__dirname, 'www', 'manifest.json'), noErrorOnMissing: true },
        { from: path.resolve(__dirname, 'sw-toolbox.js'), to: path.resolve(__dirname, 'www', 'sw-toolbox.js'), noErrorOnMissing: true }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: '../index.html'
    })
  ]
};