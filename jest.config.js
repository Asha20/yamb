module.exports = {
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			packageJson: "package.json",
		},
	},
};
