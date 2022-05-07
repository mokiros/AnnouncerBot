import { MessageEmbed } from 'discord.js'

const epoch = BigInt(new Date('2022-01-01').getTime())

let counter = 0n

export type SnowflakeID = string

export function Snowflake(timestamp?: Date): SnowflakeID {
	const t = BigInt(timestamp?.getTime() ?? Date.now())
	const id = ((t - epoch) << 4n) + counter++
	if (counter >= 2n ** 4n) {
		counter = 0n
	}
	return id.toString()
}

export class UserError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'UserError'
	}
}

export function ReplyEmbed(message: string, title?: string, color?: number) {
	const embed = new MessageEmbed()
	embed.setColor(color ?? 0x0099ff)
	embed.setTitle(title ?? 'Command')
	embed.setDescription(message)
	return embed
}
