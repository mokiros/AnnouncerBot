import { MessageActionRow } from 'discord.js'
import { getGameStatsEmbed } from '../Commands/GameStats'
import Button from './Button'

const RefreshButton = new Button({
	id: 'refreshstats',
	emoji: '🔄',
	style: 'PRIMARY',
})

const RefreshButtonCooldown = 5000

RefreshButton.setHandler(async (interaction) => {
	const embed = await getGameStatsEmbed()
	const button = Button.createMessageButton('refreshstats')
	button.setDisabled(true)
	const row = new MessageActionRow()
	row.addComponents(button)
	await interaction.update({
		embeds: [embed],
		components: [row],
	})
	return new Promise((resolve, reject) => {
		setTimeout(async () => {
			button.setDisabled(false)
			try {
				await interaction.editReply({
					components: [row],
				})
				resolve()
			} catch (err) {
				reject(err)
			}
		}, RefreshButtonCooldown)
	})
}, 0)

export default RefreshButton
