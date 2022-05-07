interface ProcessEnv {
	NODE_ENV: 'development' | 'production'
	DISCORD_BOT_TOKEN: string
	DISCORD_GUILD_ID: string
	DISCORD_BOT_ID: string
	GAME_STATS_UNIVERSE: string
	SUGGESTIONS_CHANNEL_ID: string
	ANNOUNCER_CHANNEL_ID: string
}

const defaultenv: Partial<ProcessEnv> = {}

export default function getenv<EnvKey extends keyof ProcessEnv>(key: EnvKey): ProcessEnv[EnvKey] {
	const v = process.env[key] ?? defaultenv[key]
	if (!v) {
		throw new Error(`Missing env var ${key}`)
	}
	return v as ProcessEnv[EnvKey]
}
