import { MessageEmbed } from 'discord.js'
import DiscordClient from '../client'
import { getGuild } from '../common'
import getenv from '../getenv'
import { ReplyEmbed, UserError } from '../util'
import Command from './Command'

import * as fs from 'fs'
import * as path from 'path'

// Fetching blacklisted words from the file and removing empty strings
const Blacklist = fs
	.readFileSync(path.resolve('txt', 'SuggestionsBlacklist.txt'), 'utf8')
	.split('\n')
	.filter((v) => v !== '')

const SuggestCommand: Command = {
	local: true,
	name: 'suggest',
	description: 'Suggest a feature for the game. Must follow the server rules',
	options: [
		{
			name: 'suggestion',
			description: 'Your suggestion',
			type: 'STRING',
			required: true,
		},
	],
	handler: async (interaction) => {
		const suggestion = interaction.options.getString('suggestion', true)

		if (suggestion.length < 10) {
			throw new UserError('Your suggestion is too short.')
		}

		// Check if the suggestion contains any of the blacklisted words
		const suggestion_filtered = suggestion.toLowerCase().trim()
		for (const word of Blacklist) {
			if (suggestion_filtered.includes(word)) {
				throw new UserError(`Your suggestion contains blacklisted words.`)
			}
		}

		// Searching for the channel
		const channel = DiscordClient.channels.cache.get(getenv('SUGGESTIONS_CHANNEL_ID'))
		if (!channel || !channel.isText()) {
			throw new Error('Suggestions channel not found')
		}

		// Creating embed for the suggestion
		const embed = new MessageEmbed()
			.setTitle(`${interaction.user.username}#${interaction.user.discriminator} suggests:`)
			.setDescription(suggestion)
			.setColor('#0099ff')
			.setThumbnail(interaction.user.displayAvatarURL())
		const msg = await channel.send({
			embeds: [embed],
		})

		// Success message
		interaction.reply({
			embeds: [ReplyEmbed(`Suggestion added successfully: ${msg.url}`, undefined, 0x00ff99)],
			ephemeral: true,
			fetchReply: false,
		})

		// Adding reactions
		await msg.react('👍')
		await msg.react('👎')
	},
}

export default SuggestCommand
