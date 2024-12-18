const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { library } = require('webpack');

module.exports = {
	mode: 'production',
	entry: {
		'monaco-editor': './src/index.js'
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			type: 'module'
		}
	},
	experiments: {
		outputModule: true
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts/'
						}
					}
				]
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()]
	}
};
