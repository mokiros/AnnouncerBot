import { ButtonInteraction, MessageButton } from 'discord.js'
import InteractionButton from './Button'
import TestButton from './TestButton'

export const InteractionButtons = {
	testbutton: TestButton,
} as const

type Buttons = typeof InteractionButtons

const AllButtons: Record<string, InteractionButton> = InteractionButtons

export async function ProcessButtonInteraction(interaction: ButtonInteraction): Promise<void> {
	const params = interaction.customId.split(' ')
	const id = params.shift()
	if (!id) {
		throw `Invalid button id: ${interaction.customId}`
	}
	const btn = AllButtons[id]
	if (!btn) {
		await interaction.reply({
			content: 'Internal error: Button handler not found',
			ephemeral: true,
			fetchReply: false,
		})
		return
	}
	if (btn.paramsnum !== params.length) {
		await interaction.reply({
			content: `Internal error: Invalid number of parameters. Expected ${btn.paramsnum}, got ${params.length}`,
			ephemeral: true,
			fetchReply: false,
		})
		return
	}
	await Promise.resolve(btn.handler(interaction, params))
}

export function CreateButton<ID extends keyof Buttons>(id: ID, params?: string[]): MessageButton {
	const btn = AllButtons[id]
	if (!btn) {
		throw `Invalid button id: ${id}`
	}
	let fullid
	if (btn.paramsnum !== 0) {
		if (!params) {
			throw `Button ${id} requires parameters`
		}
		if (btn.paramsnum > params.length) {
			throw `Button ${id} requires at least ${btn.paramsnum} parameters`
		}
		fullid = `${id} ${params.join(' ')}`
	} else {
		fullid = id
	}
	const Button = new MessageButton({
		type: 2,
		label: btn.text,
		style: btn.style ?? 1,
		customId: fullid,
	})
	return Button
}

export default Buttons
