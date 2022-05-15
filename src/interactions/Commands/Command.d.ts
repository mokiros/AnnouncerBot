import {
	ApplicationCommandOptionData,
	AutocompleteInteraction,
	CommandInteraction,
	InteractionReplyOptions,
	WebhookEditMessageOptions,
} from 'discord.js'

export default interface Command {
	readonly local: boolean
	readonly name: string
	readonly description: string
	readonly options?: ApplicationCommandOptionData[]
	readonly defaultPermission?: boolean
	readonly handler: (
		interaction: CommandInteraction,
	) =>
		| Promise<void | InteractionReplyOptions | WebhookEditMessageOptions>
		| void
		| InteractionReplyOptions
		| WebhookEditMessageOptions
	readonly autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void
}
