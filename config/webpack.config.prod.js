"use strict";

const autoprefixer = require("autoprefixer");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const cssnano = require("cssnano");

const paths = require("./paths");
const getClientEnvironment = require("./env");
const customerConfig = require("./get-customer-config");

let {
  publicPath = "./",
  publicUrl = "",
  output = {},
  babelOptions = {},
  entryName = "app",
  optimization = {},
  entry = {
    [entryName]: [require.resolve("./polyfills"), paths.appIndexJs],
  },
  plugins = [],
  target = "web",
} = customerConfig;
// console.log(customerConfig)

// const publicPath = paths.servedPath;
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === "true";
// const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified["process.env"].NODE_ENV !== '"production"') {
  throw new Error("Production builds must have NODE_ENV=production.");
}
module.exports = {
  target,
  mode: "production",
  bail: true,
  devtool: shouldUseSourceMap ? "source-map" : false,
  performance: {
    hints: "warning",
  },
  entry: entry,
  output: {
    path: paths.appBuild,
    filename: "static/js/[name].js",
    publicPath: publicPath,
    // devtoolModuleFilenameTemplate: info =>
    //   path
    //     .relative(paths.appSrc, info.absoluteResourcePath)
    //     .replace(/\\/g, '/'),
    ...output,
  },
  resolve: {
    modules: ["node_modules", paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: [".web.js", ".js", ".json", ".web.jsx", ".jsx"],
    alias: {
      "react-native": "react-native-web",
    },
    plugins: [new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: "pre",
        include: paths.appSrc,
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
          {
            test: /\.(js|jsx)$/,
            include: paths.workspacePath,
            include: paths.workspacePath,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-react"],
                plugins: ["@babel/plugin-proposal-class-properties"],
                ...babelOptions,
              },
            },
          },
          {
            test: /\.css$|\.scss$/,
            use: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1,
                  sourceMap: shouldUseSourceMap,
                },
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: "postcss",
                  plugins: () => [
                    require("postcss-flexbugs-fixes"),
                    autoprefixer({
                      browsers: [
                        ">1%",
                        "last 4 versions",
                        "Firefox ESR",
                        "not ie < 9", // React doesn't support IE8 anyway
                      ],
                      flexbox: "no-2009",
                    }),
                    cssnano(),
                  ],
                },
              },
              require.resolve("sass-loader"),
            ],
            // loader: ExtractTextPlugin.extract(
            //   Object.assign(
            //     {
            //       fallback: require.resolve('style-loader'),
            //       use: [
            //         {
            //           loader: require.resolve('css-loader'),
            //           options: {
            //             importLoaders: 1,
            //             minimize: true,
            //             sourceMap: shouldUseSourceMap,
            //           },
            //         },
            //         {
            //           loader: require.resolve('postcss-loader'),
            //           options: {
            //             // Necessary for external CSS imports to work
            //             // https://github.com/facebookincubator/create-react-app/issues/2677
            //             ident: 'postcss',
            //             plugins: () => [
            //               require('postcss-flexbugs-fixes'),
            //               autoprefixer({
            //                 browsers: [
            //                   '>1%',
            //                   'last 4 versions',
            //                   'Firefox ESR',
            //                   'not ie < 9', // React doesn't support IE8 anyway
            //                 ],
            //                 flexbox: 'no-2009',
            //               }),
            //             ],
            //           },
            //         },
            //         require.resolve('sass-loader'),
            //       ],
            //     },
            //     extractTextPluginOptions
            //   )
            // ),
            // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
          },
          {
            loader: require.resolve("file-loader"),
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false,
          },
        },
      }),
    ],
    ...optimization,
    // runtimeChunk: false,
    // splitChunks: {
    //   cacheGroups: {
    //     default: false,
    //     commons: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: 'vendor_app',
    //       chunks: 'all',
    //       minChunks: 2
    //     }
    //   }
    // }
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      hash: true,
      // templateParameters: {
      //   title: 'uke admin web seed',
      // },
      template: paths.deployEntryHtml,
      filename: "index.html",
      minify: {
        removeComments: true,
        collapseWhitespace: false,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new webpack.DefinePlugin(env.stringified),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
    }),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: "service-worker.js",
      logger(message) {
        if (message.indexOf("Total precache size is") === 0) {
          return;
        }
        if (message.indexOf("Skipping static resource") === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: publicUrl + "/index.html",
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ...plugins,
  ],
  // node: {
  //   dgram: 'empty',
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty',
  // },
};
