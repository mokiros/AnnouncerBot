import { UserError, getGameStatsMessage } from '../../util'
import Button from '../BaseButton'

const RefreshButton = new Button({
	id: 'refreshstats',
	emoji: '<:Refresh:971778482755477576>',
	style: 'PRIMARY',
})

RefreshButton.setHandler(async (interaction, [id]) => {
	const placeId = parseInt(id)
	if (!placeId || isNaN(placeId)) {
		throw new UserError('Invalid place id')
	}
	const defer = interaction.deferUpdate()
	const message = await getGameStatsMessage(placeId)
	await defer
	await interaction.editReply(message)
}, 1)

export default RefreshButton
