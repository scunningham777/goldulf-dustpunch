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
        { from: 'assets', to: '../assets' },
        { from: 'src/service-worker.js', to: '../service-worker.js', noErrorOnMissing: true },
        { from: 'src/manifest.json', to: '../manifest.json', noErrorOnMissing: true },
        { from: 'sw-toolbox.js', to: '../sw-toolbox.js', noErrorOnMissing: true }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: '../index.html'
    })
  ]
};