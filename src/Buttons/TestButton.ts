import InteractionButton from './Button'

const TestButton: InteractionButton = {
	id: 'testbutton',
	text: 'This is a test button',
	paramsnum: 0,
	handler: async (interaction) => {
		await interaction.reply({
			fetchReply: false,
			ephemeral: true,
			content: `Test button pressed!`,
		})
	},
}

export default TestButton
