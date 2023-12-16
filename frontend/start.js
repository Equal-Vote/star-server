// See build.js for more context, but I additionally used this script as a reference for rewire on start.js
// https://github.com/facebook/sapling/blob/25c93ffd88c5120a1ed6b4b31640aade877fd918/addons/isl/start.js#L10

const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/start.js');
const configFactory = defaults.__get__('configFactory');
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

defaults.__set__('configFactory', env => {
	const config = configFactory(env);

	config.resolve = {
		...config.resolve,
		plugins: [
			new TsconfigPathsPlugin()
		]
	};

	return config;
})


