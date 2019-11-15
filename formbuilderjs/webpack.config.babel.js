const pkg = require('./package.json');
const {resolve} = require('path');
const autoprefixer = require('autoprefixer');
const BannerWebpackPlugin = require('banner-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

const PRODUCTION = process.argv.includes('-p');
const WATCH = process.argv.includes('-watch');

const bannerTemplate = [
  ` ${pkg.name} - ${pkg.homepage}`,
  ` Version: ${pkg.version}`,
  ` Author: ${pkg.author}`
].join('\n *');

let plugins = [];

if (PRODUCTION == true) {
  plugins.push(new BabiliPlugin({
    removeDebugger: true
  }, {
    comments: false
  }));
}

plugins.push(
  new BannerWebpackPlugin({
      chunks: {
      'main': {
        beforeContent: `/*\n *${bannerTemplate}\n*/\ndefine([], function() {\n\t`,
        afterContent: '\n});',
      }
    }
  })
);

// const devtool = PRODUCTION ? false : 'source-map';
const devtool = false;

const webpackConfig = {
  context: resolve(__dirname, 'dist/'),
  watch: WATCH,
  entry: [
    'babel-regenerator-runtime',
    resolve(__dirname, pkg.config.files.formeo.js)
  ],
  output: {
    path: resolve(__dirname, '../amd/build/'),
    publicPath: '/',
    filename: 'formbuilder.js'
  },
  module: {
    rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      options: {
        cache: true,
        quiet: true,
        fix: true
      }
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        cacheDirectory: true
      }
    }
    ]
  },
  plugins,
  devtool,
  resolve: {
    modules: [
      resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js']
  }
};

module.exports = webpackConfig;
