import Command from './Command'
import { UserError, ReplyEmbed, isAuthorized, config } from '@util'
import { ConfigurationKey, ConfigurationDefinition, ConfigurationKeys } from '@util/Config'

const ConfigCommand: Command = {
	local: true,
	name: 'config',
	description: 'Setting and getting NON-SECRET configuration values',
	options: [
		{
			name: 'get',
			description: 'Get configuration',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'key',
					description: 'Configuration key. If omitted, all keys will be listed',
					type: 'STRING',
					required: false,
					autocomplete: true,
				},
			],
		},
		{
			name: 'set',
			description: 'Set configuration',
			type: 'SUB_COMMAND_GROUP',
			options: [
				{
					name: 'string',
					description: 'Set a string value',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'key',
							description: 'Configuration key',
							type: 'STRING',
							autocomplete: true,
							required: true,
						},
						{
							name: 'value',
							description: 'Configuration value',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'integer',
					description: 'Set an integer value',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'key',
							description: 'Configuration key',
							type: 'STRING',
							autocomplete: true,
							required: true,
						},
						{
							name: 'value',
							description: 'Configuration value',
							type: 'INTEGER',
							required: true,
						},
					],
				},
				{
					name: 'number',
					description: 'Set a number value',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'key',
							description: 'Configuration key',
							type: 'STRING',
							autocomplete: true,
							required: true,
						},
						{
							name: 'value',
							description: 'Configuration value',
							type: 'NUMBER',
							required: true,
						},
					],
				},
				{
					name: 'boolean',
					description: 'Set a boolean value',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'key',
							description: 'Configuration key',
							type: 'STRING',
							autocomplete: true,
							required: true,
						},
						{
							name: 'value',
							description: 'Configuration value',
							type: 'BOOLEAN',
							required: true,
						},
					],
				},
			],
		},
	],
	defaultPermission: true,
	handler: async (interaction) => {
		if (!isAuthorized(interaction.user.id)) {
			throw new UserError('You are not authorized to use this command.')
		}
		const subcommand = interaction.options.getSubcommand(true)
		if (subcommand === 'get') {
			const key = interaction.options.getString('key', false)
			if (key) {
				if (!ConfigurationKeys.includes(key)) {
					throw new UserError(`Invalid configuration key: ${key}`)
				}
				const value = config.get(key as ConfigurationKey, null)
				return {
					embeds: [ReplyEmbed(`[${ConfigurationDefinition[key]}] \`${key}\`: ${value}`)],
				}
			}
			const str = ConfigurationKeys.reduce((acc, key) => {
				const value = config.get(key as ConfigurationKey, null)
				return acc + `[${ConfigurationDefinition[key]}] \`${key}\`: ${value}\n`
			}, '')
			return {
				embeds: [ReplyEmbed(str, 'Current configuration:')],
			}
		}
		const key = interaction.options.getString('key', true)
		if (!ConfigurationKeys.includes(key)) {
			throw new UserError(`Invalid configuration key: ${key}`)
		}
		const { value } = interaction.options.get('value', true)
		const prev = config.get(key as ConfigurationKey, null)
		config.set(key as ConfigurationKey, value)
		return {
			embeds: [
				ReplyEmbed(
					`Configuration value for \`${key}\` set to: \`${config.get(
						key as ConfigurationKey,
						null,
					)}\`\nPrevious value: \`${prev}\``,
				),
			],
		}
	},
	autocomplete: async (interaction) => {
		const focused = interaction.options.getFocused(true)
		if (focused.name !== 'key') {
			return
		}
		const subcommand = interaction.options.getSubcommand(true)
		let keys = ConfigurationKeys.filter((key) => key.includes(focused.value as string))
		if (subcommand !== 'get') {
			const group = interaction.options.getSubcommandGroup(true)
			if (group === 'set') {
				keys = ConfigurationKeys.filter(
					(key) =>
						ConfigurationDefinition[key] === subcommand ||
						(ConfigurationDefinition[key] === 'csv' && subcommand === 'string'),
				)
			}
		}
		await interaction.respond(
			keys.map((key) => ({
				name: key,
				value: key,
			})),
		)
	},
}

export default ConfigCommand
