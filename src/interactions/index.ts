import DiscordClient from '@client'
import { ReplyEmbed, UserError } from '@util'
import { ButtonInteraction } from 'discord.js'
import Button, { LoadButtons } from './BaseButton'
import { LoadCommands, ProcessChatCommand, SetupChatCommands } from './BaseCommand'

function ProcessButtonInteraction(interaction: ButtonInteraction) {
	return Button.process(interaction)
}

DiscordClient.on('interactionCreate', async (interaction) => {
	try {
		let processor
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			processor = ProcessChatCommand
		} else if (interaction.isButton()) {
			processor = ProcessButtonInteraction
		}
		if (!processor) {
			return
		}
		const reply = await processor(interaction as never)
		if (reply && interaction.isRepliable()) {
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply(reply)
			} else {
				await interaction.reply(reply)
			}
		}
	} catch (err: unknown) {
		let internal = false
		let msg
		if (err instanceof UserError) {
			msg = err.message
			internal = err.public
		} else {
			msg = 'Internal error. This incident was reported.'
			console.error(err)
			internal = true
		}
		if (interaction.isRepliable()) {
			const embed = ReplyEmbed(msg, 'An error occurred:', 0xff0000)
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({
					content: null,
					embeds: [embed],
				})
			} else {
				await interaction.reply({
					embeds: [embed],
					fetchReply: false,
					ephemeral: !internal,
				})
			}
		}
	}
})
DiscordClient.on('ready', async () => {
	LoadButtons()
	LoadCommands()
	await SetupChatCommands()
})
