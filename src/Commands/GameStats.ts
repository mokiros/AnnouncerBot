import { MessageEmbed } from 'discord.js'
import Button from '../Buttons/Button'
import getenv from '../getenv'
import { getUniverseData, getUniverseIcon, getUniverseIdFromPlaceId } from '../util/RobloxApi'
import Command from './Command'

let UniverseId = getenv('GAME_STATS_UNIVERSE')!
if (!UniverseId) {
	getUniverseIdFromPlaceId(getenv('GAME_STATS_PLACE')).then((id) => {
		UniverseId = id
	})
}

export async function getGameStatsEmbed() {
	const now = Date.now()
	const data = await getUniverseData(UniverseId)
	const icon = await getUniverseIcon(UniverseId)
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
	return embed
}

const GameStatsCommand: Command = {
	local: true,
	name: 'gamestats',
	description: 'Show current game stats',
	handler: async (interaction) => {
		const embed = await getGameStatsEmbed()
		const buttonRow = Button.createMessageButtonsRow(['refreshstats'])
		await interaction.reply({
			embeds: [embed],
			components: [buttonRow],
			ephemeral: false,
			fetchReply: false,
		})
	},
}

export default GameStatsCommand
