import Command from './Command'
import * as vm from 'vm'
import { UserError, ReplyEmbed } from '../util'
import { isAuthorized } from '../util'

const EvalCommand: Command = {
	local: true,
	name: 'eval',
	description: "Run code in the bot's environment",
	options: [
		{
			name: 'code',
			description: 'The code to run',
			type: 'STRING',
			required: true,
		},
		{
			name: 'hidden',
			description: 'Whether to hide the result from other users',
			type: 'BOOLEAN',
			required: false,
		},
	],
	defaultPermission: false,
	handler: async (interaction) => {
		if (!isAuthorized(interaction.user.id)) {
			throw new UserError('You do not have permission to run code')
		}
		const code = interaction.options.getString('code', true)
		const ephemeral = interaction.options.getBoolean('hidden', false)
		try {
			const context = vm.createContext({
				...global,
				interaction,
				client: interaction.client,
				guild: interaction.guild,
			})
			const _result = vm.runInContext(code, context, {
				filename: 'eval',
				timeout: 2500,
				displayErrors: true,
			})
			let result = await Promise.resolve(_result)
			if (typeof result === 'object') {
				result =
					'```json\n' +
					JSON.stringify(result, null, 2).replaceAll('\\', '\\\\').replaceAll('`', '\\`') +
					'\n```'
				if (result.length > 2000) {
					result = String(result)
				}
			} else {
				result = String(result)
			}
			await interaction.reply({
				ephemeral: ephemeral ?? false,
				fetchReply: false,
				embeds: [ReplyEmbed(result, 'Eval', 0x00ff00)],
			})
		} catch (err) {
			let msg
			if (err instanceof Error) {
				msg = err.message
			} else {
				msg = String(err)
			}
			await interaction.reply({
				ephemeral: ephemeral ?? false,
				fetchReply: false,
				embeds: [ReplyEmbed(`Error: ${msg}`, 'Eval', 0xff0000)],
			})
		}
	},
}

export default EvalCommand
