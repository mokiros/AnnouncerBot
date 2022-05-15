import { MessageActionRow, MessageEmbed } from 'discord.js'
import { getUniverseData, getUniverseIcon, getUniverseIdFromPlaceId } from './RobloxApi'
import Button from '../interactions/BaseButton'
import { config } from '@util'

interface GameStatsMessage {
	embeds: MessageEmbed[]
	components: MessageActionRow[]
}

const idCache = new Map<number, number>()
const updateCache = new Map<number, number>()
const messageCache = new Map<number, GameStatsMessage>()

async function getUniverseId(placeId: number) {
	let id = idCache.get(placeId)
	if (id) {
		return id
	}
	id = await getUniverseIdFromPlaceId(placeId)
	idCache.set(placeId, id)
	return id
}

export default async function getGameStatsMessage(placeId: number): Promise<GameStatsMessage> {
	const universeId = await getUniverseId(placeId)
	const now = Date.now()
	const lastUpdate = updateCache.get(universeId)
	if (lastUpdate && now - lastUpdate < config.get('gamestats_cooldown', 10000)) {
		return messageCache.get(universeId)!
	}
	const data = await getUniverseData(universeId)
	const icon = await getUniverseIcon(universeId)
	const updated = new Date(data.updated)
	const nowAfter = Date.now()
	const description = [
		['Players active', data.playing.toLocaleString()],
		['Visits', data.visits.toLocaleString()],
		['Updated', `<t:${updated.getTime().toString().slice(0, -3)}:R>`],
	]
	const embed = new MessageEmbed()
		.setTitle(`${data.name}`)
		.setURL(`https://www.roblox.com/games/${data.rootPlaceId}`)
		.setDescription(description.reduce((acc, [key, value]) => `${acc}**${key}**: ${value}\n`, ''))
		.setThumbnail(icon)
		.setColor(11512536)
		.setFooter({
			text: `Retrieved data in ${nowAfter - now} ms`,
		})
		.setTimestamp(new Date())
	const message = {
		embeds: [embed],
		components: [Button.createMessageButtonsRow([['refreshstats', placeId]])],
	}
	messageCache.set(universeId, message)
	updateCache.set(universeId, nowAfter)
	return message
}
