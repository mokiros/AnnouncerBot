module.exports = {
	apps: [
		{
			name: 'Announcer Bot',
			script: 'dist/index.js',
			node_args: '-r dotenv/config',
		},
	],
}
