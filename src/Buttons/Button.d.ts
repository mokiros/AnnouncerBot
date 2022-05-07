import { ButtonInteraction } from 'discord.js'

export default interface InteractionButton {
	readonly id: string
	readonly text: string
	readonly paramsnum: number
	readonly style?: number
	readonly handler: (interaction: ButtonInteraction, params: string[]) => Promise<void> | void
}
