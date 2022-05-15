import getenv from './util/GetEnv'
import DiscordClient from './client'
import './Announcer'
import './interactions'

DiscordClient.on('ready', async () => {
	console.log('Bot ready')
})

DiscordClient.login(getenv('DISCORD_BOT_TOKEN'))
