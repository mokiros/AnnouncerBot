import { ApplicationCommandOptionData, CommandInteraction } from 'discord.js'

export default interface Command {
	readonly local: boolean
	readonly name: string
	readonly description: string
	readonly options?: ApplicationCommandOptionData[]
	readonly defaultPermission?: boolean
	readonly handler: (interaction: CommandInteraction) => Promise<void> | void
}
