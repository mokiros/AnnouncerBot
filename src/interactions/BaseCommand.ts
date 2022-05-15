import {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction,
	InteractionReplyOptions,
	WebhookEditMessageOptions,
	Constants,
} from 'discord.js'
import Command from './Commands/Command'
import { UserError } from '../util'
import DiscordClient from '../client'
import getenv from '../util/GetEnv'
import path from 'path'
import fs from 'fs'

const SlashCommands: Command[] = []
const Commands: Map<Command['name'], Command> = new Map()
const GlobalCommands: ChatInputApplicationCommandData[] = []
const LocalCommands: ChatInputApplicationCommandData[] = []

export function LoadCommands() {
	const CommandsDir = path.resolve(__dirname, 'Commands')
	const CommandFiles = fs.readdirSync(CommandsDir)
	for (const file of CommandFiles) {
		const filepath = path.resolve(CommandsDir, file)
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const exp = require(filepath)
		const command = exp.default as Command
		SlashCommands.push(command)
	}
	for (const cmd of SlashCommands) {
		const isLocal = cmd.local
		const cmds = isLocal ? LocalCommands : GlobalCommands
		cmds.push({
			name: cmd.name,
			description: cmd.description,
			type: Constants.ApplicationCommandTypes.CHAT_INPUT,
			defaultPermission: cmd.defaultPermission ?? true,
			options: cmd.options,
		})
		Commands.set(cmd.name, cmd)
	}
}

export async function ProcessChatCommand(
	interaction: CommandInteraction | AutocompleteInteraction,
): Promise<void | InteractionReplyOptions | WebhookEditMessageOptions> {
	const name = interaction.commandName
	const cmd = Commands.get(name)
	if (!cmd) {
		throw new UserError('Command handler not found')
	}
	if (interaction.isAutocomplete()) {
		if (!cmd.autocomplete) {
			throw new Error(`Autocomplete handler not found for ${name}`)
		}
		await Promise.resolve(cmd.autocomplete(interaction))
	} else {
		return await Promise.resolve(cmd.handler(interaction))
	}
}

async function SetupGlobalChatCommands() {
	const app = DiscordClient.application
	if (!app) {
		throw new Error('Application not found')
	}
	const comman = app.commands
	await comman.set(GlobalCommands)
}

async function SetupLocalChatCommands() {
	const gid = getenv('DISCORD_GUILD_ID')
	const guild = await DiscordClient.guilds.fetch(gid)
	const comman = guild.commands
	await comman.set(LocalCommands)
}

export async function SetupChatCommands(): Promise<void> {
	await SetupLocalChatCommands()
	await SetupGlobalChatCommands()
}

export default Commands
