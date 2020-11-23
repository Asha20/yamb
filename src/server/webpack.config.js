/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
function root(...pathNames) {
	return path.resolve(PROJECT_ROOT, ...pathNames);
}

const babelOptions = {
	presets: ["@babel/preset-env", "@babel/preset-typescript"],
	plugins: ["@babel/plugin-proposal-class-properties"],
};

module.exports = function (env, argv) {
	const production = argv.mode === "production";

	return {
		target: "node",
		node: {
			__dirname: false,
			__filename: false,
		},
		devtool: "source-map",
		context: path.resolve(__dirname),
		mode: production ? "production" : "development",
		entry: "./src/server.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "server.js",
			devtoolModuleFilenameTemplate: "file:///[absolute-resource-path]",
		},
		resolve: {
			extensions: [".js", ".ts"],
			alias: {
				common: root("src/common"),
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
			],
		},

		plugins: [
			new ForkTsCheckerWebpackPlugin(),
			production && new CleanWebpackPlugin(),
		].filter(Boolean),

		externals: [nodeExternals()],

		stats: production ? "normal" : "minimal",
	};
};
