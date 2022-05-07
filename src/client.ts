import { Client, Intents } from 'discord.js'

const DiscordClient = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS],
})

export default DiscordClient
