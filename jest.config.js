module.exports = {
	// preset: 'ts-jest',
	testEnvironment: 'node',
	roots: [
		'<rootDir>'
	],
	testMatch: [
		// '**/tests/**/*.+(ts|tsx|js)',
		'**/?(*.)+(spec|test).+(ts|tsx|js)'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	moduleNameMapper: {
		'^.+\\.(css|less|scss)$': 'identity-obj-proxy'
	}
};
