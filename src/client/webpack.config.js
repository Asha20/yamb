/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const babelOptions = {
	presets: [
		[
			"@babel/preset-env",
			{ targets: "defaults", useBuiltIns: "usage", corejs: 3 },
		],
		["@babel/preset-typescript"],
	],
	plugins: [
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-transform-runtime",
	],
};

module.exports = function (env, argv) {
	const production = argv.mode === "production";

	return {
		context: path.resolve(__dirname),
		mode: production ? "production" : "development",
		entry: "./src/main.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			publicPath: "/public/",
			filename: production ? "[name].[contenthash].js" : "[name].js",
			chunkFilename: "[name].[chunkhash].js",
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
					loader: "babel-loader",
					exclude: /node_modules/,
					options: babelOptions,
				},
				{
					test: /\.s[ac]ss$/,
					use: [
						MiniCssExtractPlugin.loader,
						"css-loader",
						production && "postcss-loader",
						"sass-loader",
					].filter(Boolean),
				},
			],
		},
		plugins: [
			new DefinePlugin({
				PRODUCTION: JSON.stringify(production),
			}),
			new HtmlWebpackPlugin({
				title: "Yamb",
				template: "public/index.html",
				chunks: "all",
			}),
			new ForkTsCheckerWebpackPlugin({
				typescript: {
					diagnosticOptions: {
						semantic: true,
						syntactic: true,
					},
				},
			}),

			new MiniCssExtractPlugin(),
			production && new CleanWebpackPlugin(),
		].filter(Boolean),

		stats: production ? "normal" : "minimal",

		optimization: !production
			? {}
			: {
					runtimeChunk: "single",
					splitChunks: {
						cacheGroups: {
							vendor: {
								test: /[\\/]node_modules[\\/]/,
								name: "vendors",
								chunks: "all",
							},
						},
					},
			  },
	};
};
