import { User, Guild, TextChannel, Role } from 'discord.js'
import DiscordClient from './client'
import getenv from './getenv'

export async function getGuild(): Promise<Guild> {
	const gid = getenv('DISCORD_GUILD_ID')
	const guild = DiscordClient.guilds.resolve(gid)
	if (!guild) {
		throw `Target guild (${gid}) not found`
	}
	return guild
}

export async function getChannel(name: string): Promise<TextChannel> {
	const guild = await getGuild()
	const channels = await guild.channels.fetch()
	const channel = channels.find((ch) => ch.name === name)
	if (!channel || channel.type !== 'GUILD_TEXT') {
		throw '#verify channel not found'
	}
	return channel
}

export async function getDiscordUser(id: string): Promise<User | null> {
	try {
		const user = await DiscordClient.users.fetch(id)
		return user
	} catch {
		return null
	}
}

export async function getRole(name: string): Promise<Role> {
	const guild = await getGuild()
	const roles = await guild.roles.fetch()
	const roleObj = roles.find((r) => r.name === name)
	if (!roleObj) {
		throw `Role ${name} not found`
	}
	return roleObj
}

export async function giveRole(id: string, role: string): Promise<void> {
	const guild = await getGuild()
	const roleObj = await getRole(role)
	const member = await guild.members.fetch(id)
	await member.roles.add(roleObj)
}
