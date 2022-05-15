import { config, getGameStatsMessage } from '@util'
import Command from './Command'

const ACGStats: Command = {
	local: true,
	name: 'acg',
	description: 'Get stats for ACG',
	handler: async (interaction) => {
		const id = config.get('acg_place_id')
		const p = interaction.deferReply({
			ephemeral: false,
		})
		const message = await getGameStatsMessage(id)
		await p
		return message
	},
}

export default ACGStats
