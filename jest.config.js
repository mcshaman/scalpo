// Temporary workaround while waiting for Jest ESM support https://github.com/facebook/jest/issues/9771
export default {
	resolver: '<rootDir>/jest-resolver.cjs',
	transformIgnorePatterns: ['node_modules/(?!(lowdb)/)'],
}
