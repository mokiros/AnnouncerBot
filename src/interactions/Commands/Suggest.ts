import { MessageEmbed } from 'discord.js'
import DiscordClient from '@client'
import { ReplyEmbed, UserError, ReadLines, config } from '@util'
import Command from './Command'
import path from 'path'
import Button from '../BaseButton'

const Blacklist = ReadLines(path.resolve('txt', 'SuggestionsBlacklist.txt'))

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
		const SuggestionsChannelID = config.get('suggestions_channel')

		// Searching for the channel
		const channel = DiscordClient.channels.cache.get(SuggestionsChannelID)
		if (!channel || !channel.isText()) {
			throw new Error('Suggestions channel not found')
		}

		const suggestion = interaction.options.getString('suggestion', true)

		if (suggestion.length < 10) {
			throw new UserError('Your suggestion is too short.')
		}

		// Check if the suggestion contains any of the blacklisted words
		const suggestion_filtered = suggestion.toLowerCase().trim().split(/\s+/)
		for (const word of Blacklist) {
			if (suggestion_filtered.includes(word)) {
				throw new UserError(`Your suggestion contains blacklisted words.`)
			}
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
			components: [Button.createMessageButtonsRow([['deletesuggestion', interaction.user.id, msg.id]])],
			ephemeral: true,
			fetchReply: false,
		})

		// Adding reactions
		const reactions = config.get('suggestions_reactions', ['👍', '👎'])
		for (const reaction of reactions) {
			await msg.react(reaction)
		}
	},
}

export default SuggestCommand
