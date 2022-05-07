import { MessageEmbed } from 'discord.js'
import getenv from '../getenv'
import { getUniverseData, getUniverseIcon } from '../util/rbxapi'
import Command from './Command'

const GameStatsCommand: Command = {
	local: true,
	name: 'gamestats',
	description: 'Show current game stats',
	handler: async (interaction) => {
		const now = Date.now()
		const data = await getUniverseData(getenv('GAME_STATS_UNIVERSE'))
		const icon = await getUniverseIcon(getenv('GAME_STATS_UNIVERSE'))
		const updated = new Date(data.updated)
		const embed = new MessageEmbed()
			.setTitle(`${data.name}`)
			.setURL(`https://www.roblox.com/games/${data.rootPlaceId}`)
			.setDescription(
				'' +
					`**Players active:** ${data.playing.toLocaleString()}\n` +
					`**Visits:** ${data.visits.toLocaleString()}\n` +
					`**Last updated:** <t:${updated.getTime().toString().slice(0, -3)}:R>\n`,
			)
			.setThumbnail(icon)
			.setColor(11512536)
			.setFooter({
				text: `Retrieved data in ${Date.now() - now} ms`,
			})
			.setTimestamp(new Date())
		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		})
	},
}

export default GameStatsCommand
