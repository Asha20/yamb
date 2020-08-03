const path = require("path");
const nodeExternals = require("webpack-node-externals");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

module.exports = {
	target: "node",
	node: {
		__dirname: false,
		__filename: false,
	},
	context: path.resolve(__dirname),
	entry: "./src/server.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "server.js",
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
		],
	},

	externals: [nodeExternals()],

	stats: "minimal",
};
