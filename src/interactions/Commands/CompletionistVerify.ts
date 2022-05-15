import { GetLinkedAccount, ReplyEmbed, UserError, config } from '@util'
import { checkAwardedBadges } from '@util/RobloxApi'
import Command from './Command'

const CompletionistVerifyCommand: Command = {
	local: true,
	name: 'completionistverify',
	description: 'Account must be linked with Bloxlink.',
	handler: async (interaction) => {
		if (!interaction.inCachedGuild()) {
			throw new UserError('This command can only be used in a server.')
		}
		const badges = config.get('completionist_badge_ids')
		const role_id = config.get('completionist_role_id')
		const role = await interaction.guild.roles.fetch(role_id)
		if (!role) {
			throw new UserError('Completionist role not found.')
		}
		const userid = interaction.user.id
		const member = await interaction.guild.members.fetch(userid)
		if (member.roles.resolve(role_id)) {
			throw new UserError('You already have the role.')
		}
		await interaction.deferReply({ ephemeral: true })
		const accountid = await GetLinkedAccount(userid)
		if (!accountid) {
			return {
				embeds: [
					ReplyEmbed(
						'You are not linked with Bloxlink. Go to <https://blox.link/> to link your account.',
						undefined,
						0xff0000,
					),
				],
				ephemeral: false,
			}
		}
		const success = await checkAwardedBadges(
			accountid,
			badges.map((b) => parseInt(b)),
		)
		let embed
		if (success) {
			await member.roles.add(role)
			embed = ReplyEmbed('Succcessfully got completionist role!', undefined, 0x00ff00)
		} else {
			embed = ReplyEmbed(
				'You do not have all the badges yet for the completionist role.\n\n',
				undefined,
				0xff0000,
			)
		}
		return {
			embeds: [embed.setFooter({ text: `userid: ${accountid}` })],
			ephemeral: false,
		}
	},
}

export default CompletionistVerifyCommand
