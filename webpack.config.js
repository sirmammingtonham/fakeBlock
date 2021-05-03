const path = require('path');
const SizePlugin = require('size-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
	devtool: 'inline-cheap-module-source-map',
	stats: 'errors-only',
	entry: {
		background: './src/background.ts',
		blocker: './src/blocker.ts',
		popup: './src/components/popup.tsx',
		results: './src/components/result.tsx'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(scss|css)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[local]'
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							// Prefer `dart-sass`
							implementation: require('sass')
						}
					}
				]
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
			}
		]),
		new CleanWebpackPlugin()
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	}
};
