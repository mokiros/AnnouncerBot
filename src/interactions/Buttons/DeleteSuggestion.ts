import DiscordClient from '@client'
import { config, UserError } from '@util'
import Button from '../BaseButton'

const DeleteSuggestionButton = new Button({
	id: 'deletesuggestion',
	text: 'Delete suggestion',
	style: 'DANGER',
})

DeleteSuggestionButton.setHandler(async (interaction, [userid, messageid]) => {
	const uid = interaction.user.id
	if (uid !== userid) {
		throw new UserError("You can't delete someone else's suggestion.")
	}
	const channelid = config.get('suggestions_channel')
	const channel = await DiscordClient.channels.fetch(channelid)
	if (!channel?.isText()) {
		throw new UserError('Suggestions channel not found.')
	}
	await channel.messages.delete(messageid)
	await interaction.update({
		content: 'Suggestion deleted.',
		embeds: [],
		components: [],
	})
}, 2)
