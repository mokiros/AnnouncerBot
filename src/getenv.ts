interface ProcessEnv {
	NODE_ENV: 'development' | 'production'
	DISCORD_BOT_TOKEN: string
	DISCORD_GUILD_ID: string
	DISCORD_BOT_ID: string
	GAME_STATS_PLACE: number
	GAME_STATS_UNIVERSE: number
	SUGGESTIONS_CHANNEL_ID: string
	ANNOUNCER_CHANNEL_ID: string
}

const defaultenv: Partial<ProcessEnv> = {}

// prettier-ignore
export default function getenv<EnvKey extends keyof ProcessEnv>(key: EnvKey, required?: true): ProcessEnv[EnvKey]
// prettier-ignore
export default function getenv<EnvKey extends keyof ProcessEnv>(key: EnvKey, required: false): ProcessEnv[EnvKey] | undefined
// prettier-ignore
export default function getenv<EnvKey extends keyof ProcessEnv>(key: EnvKey, required?: boolean): ProcessEnv[EnvKey] | undefined {
	const v = process.env[key] ?? defaultenv[key]
	if (!v && required !== false) {
		throw new Error(`Missing env var ${key}`)
	}
	return v as ProcessEnv[EnvKey]
}
