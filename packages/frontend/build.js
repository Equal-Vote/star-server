// 1: https://www.npmjs.com/package/tsconfig-paths-webpack-plugin
// 2: https://marmelab.com/blog/2021/07/22/cra-webpack-no-eject.html
// 3: https://medium.com/@NiGhTTraX/making-typescript-monorepos-play-nice-with-other-tools-a8d197fdc680
// 4: https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
// 5: https://stackoverflow.com/questions/63589384/importing-typescript-types-outside-of-src-in-react (see comment from winwiz, they also use TsconfigPathsPlugin, but fail to mention that crucial detail)

// rewire is a tool that lets me tweak the webpack config within create-react-app without forking the repo (see link 2)
const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');
const config = defaults.__get__('config');

config.resolve = {
	...config.resolve,
	plugins: [
	]
};
