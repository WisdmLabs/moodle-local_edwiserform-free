const pkg = require('./package.json');
const {resolve} = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BannerWebpackPlugin = require('banner-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

const PRODUCTION = process.argv.includes('-p');

const bannerTemplate = [
  ` ${pkg.name} - ${pkg.homepage}`,
  ` Version: ${pkg.version}`,
  ` Author: ${pkg.author}`
].join('\n *');

let plugins = [
  new ExtractTextPlugin({
    filename: 'formeo.min.css'
  }),
  new BabiliPlugin({
    removeDebugger: true
  }, {
    comments: false
  }),
  new BannerWebpackPlugin({
      chunks: {
      'main': {
        beforeContent: `/*\n *${bannerTemplate}\n*/\ndefine([], function() {\n\t`,
        afterContent: '\n});',
      }
    }
  })
];

const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css'
});

const devtool = PRODUCTION ? false : 'source-map';

const webpackConfig = {
  context: resolve(__dirname, 'dist/'),
  entry: [
    'babel-regenerator-runtime',
    resolve(__dirname, pkg.config.files.formeo.js)
  ],
  output: {
    path: resolve(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'formbuilder.min.js'
  },
  module: {
    rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.scss$/,
      use: extractSass
      .extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            query: {
              minimize: true,
              sourceMaps: !PRODUCTION
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['last 2 versions'],
                  cascade: true,
                  remove: true
                })
              ]
            }
          },
          {
            loader: 'sass-loader',
            query: {
              sourceMaps: !PRODUCTION
            }
          }
        ]
      })
    }]
  },
  plugins,
  devtool,
  resolve: {
    modules: [
      resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.scss']
  },
  devServer: {
    inline: true,
    contentBase: 'dist/',
    noInfo: true
  }
};

module.exports = webpackConfig;
