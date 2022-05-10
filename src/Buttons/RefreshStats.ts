import { MessageActionRow } from 'discord.js'
import { getGameStatsEmbed } from '../Commands/GameStats'
import Button from './Button'

const RefreshButton = new Button({
	id: 'refreshstats',
	emoji: '🔄',
	style: 'PRIMARY',
})

const RefreshButtonCooldown = 10000
let LastUpdate = 0

RefreshButton.setHandler(async (interaction) => {
	if (Date.now() - LastUpdate < RefreshButtonCooldown) {
		return interaction.reply({
			content: "You're updating too fast!",
			ephemeral: true,
		})
	}
	LastUpdate = Date.now()
	const p = interaction.deferUpdate()
	const embed = await getGameStatsEmbed()
	const button = Button.createMessageButton('refreshstats')
	button.setDisabled(true)
	const row = new MessageActionRow()
	row.addComponents(button)
	await p
	await interaction.editReply({
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
