import DiscordClient from './client'
import getenv from './getenv'
import * as fs from 'fs'
import * as path from 'path'

// Fetching announcements from the file and removing empty strings
const Announcements = fs
	.readFileSync(path.resolve('txt', 'AnnouncerLines.txt'), 'utf8')
	.split('\n')
	.filter((v) => v !== '')

DiscordClient.on('messageCreate', async (msg) => {
	if (msg.channelId !== getenv('ANNOUNCER_CHANNEL_ID') || msg.author.bot) {
		return
	}
	// Message must contain at least 6 space separated words with length of at least 2 characters
	// Punctuation also counts in word length
	const content = msg.content.split(' ').filter((v) => v.length > 2)
	if (content.length < 6) {
		return
	}
	// 5% chance
	if (Math.random() < 0.05) {
		const announcement = Announcements[Math.floor(Math.random() * Announcements.length)]
		await msg.channel.send({
			content: announcement,
		})
	}
})

console.log('Announcer ready')
