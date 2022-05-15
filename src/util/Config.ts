import path from 'path'
import fs from 'fs/promises'
import { constants } from 'fs'
import { UserError } from '.'

// Allowed configuration types:
// string, csv, number, integer, boolean
const definition = {
	acg_place_id: 'integer',
	suggestions_channel: 'string',
	suggestions_reactions: 'csv',
	announcer_channel: 'string',
	announcer_chance: 'number',
	gamestats_cooldown: 'number',
	completionist_badge_ids: 'csv',
	completionist_role_id: 'string',
} as const
export const ConfigurationDefinition = definition as Record<string, 'string' | 'csv' | 'number' | 'integer' | 'boolean'>
export const ConfigurationKeys = Object.keys(definition)

type _ct = typeof definition
// prettier-ignore
export type ConfigurationValueTypes = {
	[key in keyof _ct]:
		  _ct[key] extends 'string' ? string
		: _ct[key] extends 'csv' ? string[]
		: _ct[key] extends 'number' | 'integer' ? number
		: _ct[key] extends 'boolean' ? boolean
		: never
}
export type ConfigurationKey = keyof ConfigurationValueTypes

class ConfigurationSingleton {
	public readonly config = new Map<string, unknown>()

	public constructor(private readonly file_path: string) {
		this.loadFromFile()
	}

	private async loadFromFile() {
		try {
			await fs.access(this.file_path, constants.F_OK)
		} catch (err) {
			await fs.writeFile(this.file_path, '{}')
			return
		}
		const file_content = await fs.readFile(this.file_path, 'utf8')
		const config = JSON.parse(file_content)
		for (const key in config) {
			this.config.set(key, config[key])
		}
	}

	private async saveToFile() {
		await fs.writeFile(this.file_path, JSON.stringify(Object.fromEntries(this.config), null, 4))
	}

	public get<K extends ConfigurationKey>(key: K, _default: ConfigurationValueTypes[K]): ConfigurationValueTypes[K]
	public get<K extends ConfigurationKey>(key: K, _default: null): ConfigurationValueTypes[K] | undefined
	public get<K extends ConfigurationKey>(key: K): ConfigurationValueTypes[K]
	public get<K extends ConfigurationKey>(
		key: K,
		_default?: ConfigurationValueTypes[K],
	): ConfigurationValueTypes[K] | undefined {
		let value = this.config.get(key)
		if (value === undefined) {
			if (_default === undefined) {
				throw new UserError(`Configuration key ${key} not found.`)
			} else if (_default === null) {
				return undefined
			}
			value = _default
		}
		const type = definition[key]
		if (type === 'csv') {
			if (!Array.isArray(value)) {
				throw new UserError(`Configuration key ${key} must be an array.`)
			}
		} else if (typeof value !== type) {
			throw new UserError(`Configuration key ${key} must be a ${type}.`)
		}
		return value as ConfigurationValueTypes[K]
	}

	public set(key: ConfigurationKey, value: unknown) {
		const type = definition[key]
		if (type === 'csv') {
			if (typeof value !== 'string') {
				throw new UserError(`Configuration key ${key} must be a string.`)
			}
			this.config.set(
				key,
				value.split(',').map((v) => v.trim()),
			)
		} else {
			if (typeof value !== type) {
				throw new UserError(`Configuration key ${key} must be a ${type}.`)
			}
			this.config.set(key, value)
		}
		this.saveToFile()
	}
}

const config = new ConfigurationSingleton(path.resolve('config.json'))

export default config
