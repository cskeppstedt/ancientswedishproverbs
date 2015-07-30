var path = require('path'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer-core'),
    prod = (process.env.NODE_ENV === 'production');

module.exports = {
  devtool: 'source-map',

  entry: {
    'app': [
      'webpack-dev-server/client?http://localhost:8080/assets/',
      './web/client.js'
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
      { test: /\.js/, exclude: /node_modules/, loaders: [
          'babel-loader',
          'jsx-webpack-loader?ignoreDocblock&jsx=h&docblockUnknownTags'
        ]
      },
      { test: /\.styl$/, loader: 'style-loader!css-loader!postcss-loader!stylus-loader' }
    ]
  },
  postcss: [autoprefixer({})]
};
