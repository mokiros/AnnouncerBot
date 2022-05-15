import { MessageEmbed } from 'discord.js'
import { UserError } from '@util'
import {
	getAwardedBadges,
	getUniverseBadges,
	getUniverseIdFromPlaceId,
	getUserIdFromUsername,
	getUsernameFromUserId,
} from '@util/RobloxApi'
import Command from './Command'

const GetBadgesCommand: Command = {
	local: true,
	name: 'getbadges',
	description: 'Get badges for a player',
	options: [
		{
			name: 'byid',
			type: 'SUB_COMMAND',
			description: 'Get badges by userId',
			options: [
				{
					name: 'id',
					type: 'INTEGER',
					description: 'Target userId',
					required: true,
				},
				{
					name: 'placeid',
					type: 'INTEGER',
					description: 'Target place',
					required: true,
				},
				{
					name: 'hidden',
					type: 'BOOLEAN',
					description: 'Hide the message from other users',
					required: false,
				},
			],
		},
		{
			name: 'byname',
			type: 'SUB_COMMAND',
			description: 'Get badges by username',
			options: [
				{
					name: 'username',
					type: 'STRING',
					description: 'Target username',
					required: true,
				},
				{
					name: 'placeid',
					type: 'INTEGER',
					description: 'Target place',
					required: true,
				},
				{
					name: 'hidden',
					type: 'BOOLEAN',
					description: 'Hide the message from other users',
					required: false,
				},
			],
		},
	],
	handler: async (interaction) => {
		const hidden = interaction.options.getBoolean('hidden', false)
		const replyPromise = interaction.deferReply({
			ephemeral: hidden ?? false,
			fetchReply: true,
		})
		const sub = interaction.options.getSubcommand(true)
		let userId: number
		let username: string
		if (sub === 'byid') {
			userId = interaction.options.getInteger('id', true)
			username = await getUsernameFromUserId(userId)
		} else if (sub === 'byname') {
			username = interaction.options.getString('username', true)
			userId = await getUserIdFromUsername(username)
		} else {
			throw new UserError('Invalid subcommand')
		}
		const placeId = interaction.options.getInteger('placeid', true)
		const universeId = await getUniverseIdFromPlaceId(placeId)
		const universeBadges = await getUniverseBadges(universeId)
		const awardedBadges = await getAwardedBadges(userId, universeBadges)
		const embed = new MessageEmbed()
		embed.setTitle(`Badges for ${username}:`)
		embed.setDescription(
			awardedBadges
				.map((badge) => {
					const [id, name, awardDate] = badge
					const str = `${awardDate !== null ? '✅' : '❌'} [${name}](https://www.roblox.com/badges/${id})`
					if (awardDate !== null) {
						return str + ` • Awarded <t:${awardDate.getTime().toString().slice(0, -3)}:R>`
					}
					return str
				})
				.join('\n'),
		)
		await replyPromise
		await interaction.editReply({
			content: null,
			embeds: [embed],
		})
	},
}

export default GetBadgesCommand
