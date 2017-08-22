'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');
var ExtractFilePlugin = require('extract-file-loader/Plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = function makeWebpackConfig(options) {
    /**
     * Environment type
     * BUILD is for generating minified builds
     */
    var BUILD = options.environment === 'prod';

    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    var config = {};

    config.entry = options.entry;

    config.resolve = {
        alias: options.alias,
        extensions: ['.js', '.jsx'],
        modules: [
            'node_modules'
        ]
    };

    config.output = {
        // Absolute output directory
        path: options.parameters.path ? options.parameters.path : __dirname + '/../../web/compiled/',

        // Output path from the view of the page
        // Uses webpack-dev-server in development
        publicPath: options.parameters.public_path
            ? options.parameters.public_path
            : (BUILD ? '/compiled/' : 'http://localhost:8080/compiled/'),

        // Filename for entry points
        // Only adds hash in build mode
        filename: BUILD ? '[name].[chunkhash].js' : '[name].bundle.js',

        // Filename for non-entry points
        // Only adds hash in build mode
        chunkFilename: BUILD ? '[name].[chunkhash].js' : '[name].bundle.js'
    };

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (BUILD) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval';
    }

    /**
     * Loaders
     * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */

    // Initialize module
    config.module = {
        rules: [{
            // query string is needed for URLs inside css files, like bootstrap
            enforce: "pre",
            test: /\.(gif|png|jpe?g|svg)(\?.*)?$/i,
            loader: 'image-webpack-loader',
            options: options.parameters.image_loader_options || {
                progressive: true,
                optimizationLevel: 7
            }
        }, {
            // JS LOADER
            // Reference: https://github.com/babel/babel-loader
            // Transpile .js files using babel-loader
            // Compiles ES6 and ES7 into ES5 code
            test: /\.jsx?$/i,
            use: 'babel-loader',
            exclude: /node_modules/
        }, {
            // ASSET LOADER
            // Reference: https://github.com/webpack/file-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output

            // query string is needed for URLs inside css files, like bootstrap
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/i,

            // put original name in the destination filename, too
            loader: 'file-loader',
            options: {
                name: '[name].[hash].[ext]'
            }
        }, {
            // HTML LOADER
            // Reference: https://github.com/webpack/raw-loader
            // Allow loading html through js
            test: /\.html$/i,
            use: 'raw'
        }]
    };

    // CSS LOADER
    // Reference: https://github.com/webpack/css-loader
    // Allow loading css through js
    //
    // Reference: https://github.com/postcss/postcss-loader
    // Postprocess your css with PostCSS plugins
    var cssLoader = {
        test: /\.css$/i,
        // Reference: https://github.com/webpack/extract-text-webpack-plugin
        // Extract css files in production builds
        //
        // Reference: https://github.com/webpack/style-loader
        // Use style-loader in development for hot-loading
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    // translates CSS into CommonJS
                    loader: 'css-loader',
                    options: {
                        sourceMap: !BUILD
                    }
                }, {
                    // translates CSS into CommonJS
                    loader: 'postcss-loader'
                }
            ]
        })
    };

    // Add cssLoader to the loader list
    config.module.rules.push(cssLoader);

    // add less support
    config.module.rules.push({
        test: /\.less$/i,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    // translates CSS into CommonJS
                    loader: 'css-loader',
                    options: {
                        sourceMap: !BUILD
                    }
                }, {
                    // translates CSS into CommonJS
                    loader: 'postcss-loader'
                }, {
                    // compiles Less to CSS
                    loader: 'less-loader',
                    options: {
                        sourceMap: !BUILD
                    }
                }
            ]
        })
    });

    // add sass support
    config.module.rules.push({
        test: /\.scss$/i,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    // translates CSS into CommonJS
                    loader: 'css-loader',
                    options: {
                        sourceMap: !BUILD
                    }
                }, {
                    // translates CSS into CommonJS
                    loader: 'postcss-loader'
                }, {
                    // compiles Sass to CSS
                    loader: 'sass-loader',
                    options: {
                        sourceMap: !BUILD
                    }
                }
            ]
        })
    });

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        new ExtractTextPlugin({
            filename: BUILD ? '[name].[hash].css' : '[name].bundle.css',
            disable: !options.parameters.extract_css
        })
    ];

    var manifestPathParts = options.manifest_path.split('/');
    config.plugins.push(new AssetsPlugin({filename: manifestPathParts.pop(), path: manifestPathParts.join('/')}));

    // needed to use binary files (like images) as entry-points
    // puts file-loader emitted files into manifest
    config.plugins.push(new ExtractFilePlugin());

    if (process.env.WEBPACK_MODE === 'watch' && process.env.TTY_MODE === 'on') {
        config.plugins.push(new DashboardPlugin());
    }

    // Add build specific plugins
    if (BUILD) {
        config.plugins.push(
            // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
            // Only emit files when there are no errors
            new webpack.NoEmitOnErrorsPlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
            // Dedupe modules in the output
            new webpack.optimize.DedupePlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin(),

            new webpack.optimize.OccurenceOrderPlugin(true)
        );
    }

    return config;
};
