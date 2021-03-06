global.Promise = require('bluebird');

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const productionBuild = process.env.NODE_ENV === 'production';
const nodeEnv = productionBuild ? 'production' : 'development';

const sourcePath = path.resolve(__dirname, 'src', 'App');
const publicPath = 'http://localhost:8050/public/assets';
const cssName = productionBuild ? 'styles-[hash].css' : 'styles.css';
const jsName = productionBuild ? 'bundle-[hash].js' : 'bundle.js';

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER : JSON.stringify(true),
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
  new ExtractTextPlugin(cssName),
  new webpack.LoaderOptionsPlugin({
    options: {
      context: __dirname,
    },
  }),
];

if (productionBuild) {
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.OccurenceOrderPlugin());
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  devtool: productionBuild ? 'source-map' : 'eval',
  context: sourcePath,
  entry  : '../client.jsx',
  plugins,
  output: {
    path    : `${__dirname}/public/assets/`,
    filename: jsName,
    publicPath,
  },
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    modules   : [path.resolve(__dirname, 'src', 'modules'), 'node_modules'],
    alias: {
      '~': path.resolve(__dirname, 'src', 'App'),
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  module: {
    rules: [
      {
        test   : /\.(js|jsx)$/,
        exclude: [/node_modules/],
        use    : {
          loader : 'babel-loader',
          options: {
            plugins: [
              'transform-decorators-legacy',
              'react-css-modules',
            ],
          },
        }
      },
      {
        test   : /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use     : [{
            loader : 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[path]___[name]__[local]___[hash:base64:5]'
            }
          },
          { loader: 'postcss-loader' }]
        })
      },
      { test: /\.(jpg|gif|png|woff|woff2|eot|ttf|svg)$/, use: 'url-loader?limit=100000' },
    ],
  },
  devServer: {
    headers           : { 'Access-Control-Allow-Origin': '*' },
    contentBase       : './client',
    historyApiFallback: true,
    port              : 3001,
    compress          : productionBuild,
    inline            : !productionBuild,
    hot               : !productionBuild,
    stats             : {
      assets    : true,
      children  : false,
      chunks    : false,
      hash      : false,
      modules   : false,
      publicPath: false,
      timings   : true,
      version   : false,
      warnings  : true,
      colors    : {
        green: '\u001b[32m',
      },
    },
  },
};
