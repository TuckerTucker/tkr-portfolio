/**
 * Example Webpack Configuration with TKR Logging Plugin
 *
 * This example shows how to integrate the TkrLoggingPlugin into
 * a typical React application webpack configuration.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TkrLoggingPlugin = require('./index.js');

module.exports = {
  mode: process.env.NODE_ENV || 'development',

  entry: {
    main: './src/index.js',
    admin: './src/admin.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          // Optional: Use the TKR logging loader for module-level injection
          {
            loader: './loader.js',
            options: {
              enabled: process.env.NODE_ENV === 'development',
              autoInit: false, // Let HTML injection handle init
              debugMode: process.env.DEBUG === 'true'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    // Main application HTML
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      chunks: ['main'],
      inject: 'body'
    }),

    // Admin panel HTML
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: 'public/admin.html',
      chunks: ['admin'],
      inject: 'body'
    }),

    // TKR Logging Plugin - Must come after HtmlWebpackPlugin
    new TkrLoggingPlugin({
      // Basic configuration
      enabled: process.env.NODE_ENV === 'development',
      clientUrl: 'http://localhost:42003/api/logging-client.js',

      // Inject into both chunks
      chunks: ['main', 'admin'],

      // Script loading options
      injectAsync: true,
      defer: true,

      // Enable debug mode if needed
      debug: process.env.DEBUG_LOGGING === 'true'
    })
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  // Development optimizations
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        }
      }
    }
  }
};

// Alternative configuration for single-page apps
const spaConfig = {
  mode: process.env.NODE_ENV || 'development',

  entry: './src/index.js',

  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: 'body'
    }),

    // Simple configuration for single entry point
    new TkrLoggingPlugin()
  ]
};

// Alternative configuration with validation
const validatedConfig = {
  mode: process.env.NODE_ENV || 'development',

  entry: './src/index.js',

  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),

    // Using the factory method with validation
    TkrLoggingPlugin.create({
      enabled: process.env.NODE_ENV === 'development',
      clientUrl: process.env.TKR_LOGGING_CLIENT_URL || 'http://localhost:42003/api/logging-client.js',
      chunks: ['main'],
      debug: process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true'
    })
  ]
};

// Export based on environment or use case
module.exports = module.exports; // Full featured config

// Uncomment for alternative configurations:
// module.exports = spaConfig;
// module.exports = validatedConfig;