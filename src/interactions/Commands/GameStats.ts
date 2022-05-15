import { getGameStatsMessage } from '@util'
import Command from './Command'

const GameStatsCommand: Command = {
	local: true,
	name: 'stats',
	description: 'Shows stats for specified place',
	options: [
		{
			name: 'placeid',
			description: 'The place id to get stats for',
			type: 'INTEGER',
			required: true,
		},
	],
	handler: async (interaction) => {
		const id = interaction.options.getInteger('placeid', true)
		const p = interaction.deferReply({
			ephemeral: false,
		})
		const message = await getGameStatsMessage(id)
		await p
		return message
	},
}

export default GameStatsCommand
