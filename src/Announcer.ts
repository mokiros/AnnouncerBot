import DiscordClient from './client'
import path from 'path'
import config from './util/Config'
import { ReadLines } from './util'

// Fetching announcements from the file and removing empty strings
const Announcements = ReadLines(path.resolve('txt', 'AnnouncerLines.txt'))

DiscordClient.on('messageCreate', async (msg) => {
	const id = config.get('announcer_channel', null)
	if (msg.channelId !== id || msg.author.bot) {
		return
	}
	const chance = config.get('announcer_chance', 5)
	if (Math.random() < chance / 100) {
		const announcement = Announcements[Math.floor(Math.random() * Announcements.length)]
		await msg.channel.send({
			content: announcement,
		})
	}
})

console.log('Announcer ready')
