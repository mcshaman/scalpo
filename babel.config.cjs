// Temporary workaround while waiting for Jest ESM support https://github.com/facebook/jest/issues/9771
module.exports = {
	env: {
		test: {
			plugins: ['@babel/plugin-transform-modules-commonjs'],
		},
	},
}
