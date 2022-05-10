import { ButtonInteraction } from 'discord.js'
import Button from './Button'

import './TestButton'
import './RefreshStats'

export function ProcessButtonInteraction(interaction: ButtonInteraction) {
	return Button.process(interaction)
}
