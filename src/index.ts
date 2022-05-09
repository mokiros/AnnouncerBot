import { ProcessChatCommand, SetupChatCommands } from './Commands'
import { ProcessButtonInteraction } from './Buttons'
import { ReplyEmbed, UserError } from './util'
import getenv from './getenv'
import DiscordClient from './client'

if (getenv('ANNOUNCER_CHANNEL_ID', false)) {
	import('./Announcer')
}

DiscordClient.on('interactionCreate', async (interaction) => {
	try {
		if (interaction.isCommand()) {
			await ProcessChatCommand(interaction)
		} else if (interaction.isButton()) {
			await ProcessButtonInteraction(interaction)
		}
	} catch (err: unknown) {
		let internal = false
		let msg
		if (err instanceof UserError) {
			msg = err.message
		} else {
			msg = 'Internal error. This incident was reported.'
			console.error(err)
			internal = true
		}
		if (interaction.isApplicationCommand() || interaction.isButton() || interaction.isCommand()) {
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
	SetupChatCommands()
	console.log('Bot ready')
})

DiscordClient.login(getenv('DISCORD_BOT_TOKEN'))
