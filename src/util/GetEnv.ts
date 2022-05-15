import UserError from './UserError'

interface ProcessEnv {
	NODE_ENV: 'development' | 'production'
	DISCORD_BOT_TOKEN: string
	DISCORD_GUILD_ID: string
	AUTHORIZED_IDS: string
	BLOXLINK_API_KEY: string
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
		throw new UserError(`Missing environment variable ${key}`, true)
	}
	return v as ProcessEnv[EnvKey]
}
