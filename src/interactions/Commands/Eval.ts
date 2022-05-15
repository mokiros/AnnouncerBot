import Command from './Command'
import * as vm from 'vm'
import { UserError, ReplyEmbed, isAuthorized } from '@util'

const EvalCommand: Command = {
	local: false,
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
	defaultPermission: true,
	handler: async (interaction) => {
		if (!isAuthorized(interaction.user.id)) {
			throw new UserError('You do not have permission to run code')
		}
		const code = interaction.options.getString('code', true)
		const ephemeral = interaction.options.getBoolean('hidden', false)
		try {
			const context = vm.createContext({
				...global,
				process,
				require,
				interaction,
				client: interaction.client,
				guild: interaction.guild,
			})
			const _result = await vm.runInContext(code, context, {
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
				if (result.length > 4000) {
					result = result.substring(0, 4000) + '\n...\n```'
				}
			} else {
				result = String(result)
			}
			return {
				ephemeral: ephemeral ?? false,
				fetchReply: false,
				embeds: [ReplyEmbed(result, 'Eval', 0x00ff00)],
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err)
			return {
				ephemeral: ephemeral ?? false,
				fetchReply: false,
				embeds: [ReplyEmbed(`Error: ${msg}`, 'Eval', 0xff0000)],
			}
		}
	},
}

export default EvalCommand
