/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

module.exports = function (env) {
	return {
		context: path.resolve(__dirname),
		mode: env.production ? "production" : "development",
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
					test: /\.s[ac]ss$/,
					use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
				},
			],
		},
		plugins: [
			new DefinePlugin({
				PRODUCTION: JSON.stringify(env.production),
			}),
			new HtmlWebpackPlugin({
				title: "Yamb",
				template: "public/index.html",
			}),
			new MiniCssExtractPlugin(),
			env.production && new CleanWebpackPlugin(),
		].filter(Boolean),

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
};
