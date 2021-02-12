const path = require("path");
const SizePlugin = require("size-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	devtool: "source-map",
	stats: "errors-only",
	entry: {
		background: "./source/background",
		options: "./source/options"
	},
	output: {
		path: path.join(__dirname, "distribution"),
		filename: "[name].js"
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			},
			{
				test: /\.(js|ts|tsx)$/,
				loader: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new SizePlugin(),
		new CopyWebpackPlugin([
			{
				from: "**/*",
				context: "source",
				ignore: ["*.js"]
			},
			{
				from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js"
			}
		]),
		new MiniCssExtractPlugin({
			filename: "content.css"
		})
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: false,
					compress: false,
					output: {
						beautify: true,
						indent_level: 2 // eslint-disable-line camelcase
					}
				}
			})
		]
	},
	resolve: {
		extensions: ['.ts', '.js']
	}	
};
