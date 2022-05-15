import { MessageEmbed } from 'discord.js'

export default function ReplyEmbed(message: string, title?: string, color?: number) {
	const embed = new MessageEmbed()
	embed.setColor(color ?? 0x0099ff)
	if (title) {
		embed.setTitle(title)
	}
	embed.setDescription(message)
	return embed
}
