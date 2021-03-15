const path = require('path');
const SizePlugin = require('size-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV,
	devtool: 'source-map',
	stats: 'errors-only',
	entry: {
		background: './src/background.ts',
		blocker: './src/blocker.ts',
		popup: './src/index.tsx'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(scss|css)$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.(js|ts|tsx)$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new SizePlugin(),
		new CopyPlugin([
			{
				from: './assets',
				to: 'assets'
			},
			{
				from:
					'./node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
			},
			{
				from: './manifest.json'
			},
			{
				from: './public/*'
			},
			{
				from: './ml/distilbertu_ISOT'
			}
		]),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css'
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
		extensions: ['.ts', '.tsx', '.js']
	}
};
