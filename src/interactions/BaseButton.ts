import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageButtonStyleResolvable,
	MessageActionRow,
	MessageButton,
} from 'discord.js'
import { UserError } from '@util'
import path from 'path'
import fs from 'fs'

interface BaseButtonProperties {
	id: string
	text?: string
	emoji?: EmojiIdentifierResolvable
}

interface ButtonProperties extends BaseButtonProperties {
	style?: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 1 | 2 | 3 | 4
}

interface LinkButtonProperties extends BaseButtonProperties {
	style: 'LINK' | 5
	link: string
}

type ButtonHandler = (interaction: ButtonInteraction, params: string[]) => Promise<void> | void

export default class Button {
	public static readonly separator = '/'
	public static readonly buttons = new Map<string, Button>()

	public id?: string
	public text?: string
	public emoji?: EmojiIdentifierResolvable
	public style?: MessageButtonStyleResolvable
	public paramsnum = 0

	public isLink = false
	public link?: string
	public handler?: ButtonHandler

	public constructor(props: ButtonProperties | LinkButtonProperties) {
		this.text = props.text
		this.emoji = props.emoji
		this.style = props.style ?? this.style
		if (props.style === 'LINK' || props.style === 5) {
			this.isLink = true
			this.link = props.link
		}
		this.id = props.id
		Button.buttons.set(props.id, this)
	}

	public setHandler(handler: ButtonHandler, paramsnum: number): void {
		if (this.isLink) {
			throw new Error('Link buttons cannot have a handler')
		}
		this.handler = handler
		this.paramsnum = paramsnum
	}

	public create(params?: (number | string)[]): MessageButton {
		if (this.paramsnum && params?.length !== this.paramsnum) {
			throw new Error(`Button ${this.id} requires ${this.paramsnum} parameters`)
		}
		const button = new MessageButton()
		if (this.isLink) {
			button.setURL(this.link!)
		} else {
			if (params) {
				button.setCustomId(`${this.id}${Button.separator}${params.join(Button.separator)}`)
			} else {
				button.setCustomId(this.id!)
			}
		}
		if (this.text) {
			button.setLabel(this.text)
		}
		if (this.emoji) {
			button.setEmoji(this.emoji)
		}
		if (this.style) {
			button.setStyle(this.style)
		}
		return button
	}

	public static createMessageButton(id: string, params?: (number | string)[]): MessageButton {
		const button = Button.buttons.get(id)
		if (!button) {
			throw new Error(`Button ${id} does not exist`)
		}
		return button.create(params)
	}

	public static createMessageButtonsRow(buttons: ([id: string, ...params: (number | string)[]] | string)[]) {
		const row = new MessageActionRow()
		for (const btn of buttons) {
			if (typeof btn === 'string') {
				row.addComponents(Button.createMessageButton(btn))
			} else {
				row.addComponents(Button.createMessageButton(btn[0], btn.slice(1)))
			}
		}
		return row
	}

	public static process(interaction: ButtonInteraction): Promise<void> | void {
		const customId = interaction.customId
		const [id, ...params] = customId.split(Button.separator)
		const button = Button.buttons.get(id)
		if (!button) {
			throw new UserError(`Button ${id} does not exist`)
		}
		if (button.isLink) {
			throw new UserError(`Button ${id} is a link`)
		}
		if (!button.handler) {
			throw new UserError(`Button ${id} does not have a handler`)
		}
		return button.handler(interaction, params)
	}
}

export function LoadButtons() {
	const ButtonsDir = path.resolve(__dirname, 'Buttons')
	const CommandFiles = fs.readdirSync(ButtonsDir)
	for (const file of CommandFiles) {
		const filepath = path.resolve(ButtonsDir, file)
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		require(filepath)
	}
}
