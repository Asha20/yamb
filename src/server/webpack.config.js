/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const nodeExternals = require("webpack-node-externals");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
function root(...pathNames) {
	return path.resolve(PROJECT_ROOT, ...pathNames);
}

module.exports = {
	target: "node",
	node: {
		__dirname: false,
		__filename: false,
	},
	devtool: "source-map",
	context: path.resolve(__dirname),
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
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},

	externals: [nodeExternals()],

	stats: "minimal",
};
