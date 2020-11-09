/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

module.exports = {
	context: path.resolve(__dirname),
	entry: "./src/main.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: "/public",
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".js", ".ts"],
		alias: {
			common: path.resolve(PROJECT_ROOT, "src/common"),
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Yamb",
			template: "public/index.html",
		}),
		new MiniCssExtractPlugin(),
	],

	stats: "minimal",
	devServer: {
		stats: "minimal",
		writeToDisk: true,
		proxy: {
			"/api": {
				target: "http://localhost:3000",
			},
		},
	},
};
