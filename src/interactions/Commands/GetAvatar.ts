import { Constants } from 'discord.js'
import Command from './Command'

const GetAvatar: Command = {
	local: true,
	name: 'avatar',
	description: 'Get avatar of target user',
	options: [
		{
			name: 'target',
			description: 'User to get avatar of',
			type: Constants.ApplicationCommandOptionTypes.USER,
			required: true,
		},
	],
	handler: (interaction) => {
		const user = interaction.options.getUser('target', true)
		return {
			content: user.avatarURL(),
			ephemeral: true,
			fetchReply: false,
		}
	},
}

export default GetAvatar
