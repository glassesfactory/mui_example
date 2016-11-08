'use strict'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpackUglifyJsPlugin from 'webpack-uglify-js-plugin';

const src = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')

export default {
  entry: src + '/App.js',

  output: {
    path: dist,
    filename: 'main.js'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  },

  devServer: {
    port: 3000
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: src + '/index.html',
      filename: 'index.html'
    }),
    new webpackUglifyJsPlugin({
      cacheFolder: path.resolve(__dirname, 'public/cached_uglify/'),
      debug: true,
      minimize: true,
      sourceMap: false,
      output: {
        comments: false
      },
      compressor: {
        warnings: false
      }
    })
  ]
}
