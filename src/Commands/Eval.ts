import Command from './Command'
import * as vm from 'vm'
import { UserError, ReplyEmbed } from '../util'

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
	permissions: [
		{
			id: '170832420789026817',
			type: 'USER',
			permission: true,
		},
	],
	handler: async (interaction) => {
		if (interaction.user.id !== '170832420789026817') {
			throw new UserError('You do not have permission to run code')
		}
		const code = interaction.options.getString('code', true)
		const ephemeral = interaction.options.getBoolean('hidden', false)
		try {
			const _result = vm.runInThisContext(code, {
				filename: 'eval',
				timeout: 2500,
				displayErrors: true,
			})
			let result = await Promise.resolve(_result)
			if (typeof result === 'object') {
				result = JSON.stringify(result, null, 2)
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
