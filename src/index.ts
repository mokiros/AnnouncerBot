import { ProcessChatCommand, SetupChatCommands } from './Commands'
import { ProcessButtonInteraction } from './Buttons'
import { UserError } from './util'
import getenv from './getenv'
import DiscordClient from './client'

DiscordClient.on('interactionCreate', async (interaction) => {
	try {
		if (interaction.isCommand()) {
			await ProcessChatCommand(interaction)
		} else if (interaction.isButton()) {
			await ProcessButtonInteraction(interaction)
		}
	} catch (err: unknown) {
		let msg
		if (err instanceof UserError) {
			msg = err.message
		} else {
			msg = 'Internal error'
		}
		if (!(err instanceof UserError)) {
			console.error(err)
		}
		if (interaction.isApplicationCommand() || interaction.isButton() || interaction.isCommand()) {
			await interaction.reply({
				content: 'Error: ' + msg,
				fetchReply: false,
				ephemeral: true,
			})
		}
	}
})

DiscordClient.on('ready', async () => {
	SetupChatCommands()
	console.log('Bot ready')
})

DiscordClient.login(getenv('DISCORD_BOT_TOKEN'))

export default DiscordClient
