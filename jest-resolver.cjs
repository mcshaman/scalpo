const { resolve } = require('resolve.exports')

// Temporary workaround while waiting for Jest ESM support https://github.com/facebook/jest/issues/9771
module.exports = function (request, options) {
	return options.defaultResolver(request, {
		...options,
		packageFilter: (package) => ({
			...package,
			main: package.main || resolve(package, '.'),
		}),
	})
}
