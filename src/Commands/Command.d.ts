import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction } from 'discord.js'

export default interface Command {
	readonly local: true
	readonly name: string
	readonly description: string
	readonly options?: ApplicationCommandOptionData[]
	readonly defaultPermission?: boolean
	readonly permissions?: ApplicationCommandPermissionData[]
	readonly handler: (interaction: CommandInteraction) => Promise<void> | void
}
