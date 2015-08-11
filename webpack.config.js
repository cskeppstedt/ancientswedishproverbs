var path = require('path'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer-core'),
    prod = (process.env.NODE_ENV === 'production'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',

  entry: {
    'app': [
      'webpack-dev-server/client?http://localhost:8080/assets/',
      './web/app.client.js'
    ],
    'vendor': [
      '@cycle/core',
      '@cycle/dom',
      'socket.io-client'
    ]
  },

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'web/public'),
    publicPath: 'http://localhost:8080/assets'
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('app.css'),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    /*new webpack.optimize.UglifyJsPlugin({ minimize: true })*/
  ],

  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules']
  },

  resolveLoader: {
    // Abs. path with loaders
    root: path.join(__dirname, '/node_modules'),
    alias: {}
  },

  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          'jsx-webpack-loader?ignoreDocblock&jsx=h&docblockUnknownTags'
        ]
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css!autoprefixer-loader!sass')
      }
    ]
  }
};
