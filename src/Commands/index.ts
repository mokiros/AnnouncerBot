import { ChatInputApplicationCommandData, CommandInteraction, Constants } from 'discord.js'
import Command from './Command'
import GetAvatar from './GetAvatar'
import { UserError } from '../util'
import { getGuild } from '../common'
import EvalCommand from './Eval'
import GameStatsCommand from './GameStats'
import SuggestCommand from './Suggest'
import GetBadgesCommand from './GetBadges'

const SlashCommands = [GetAvatar, EvalCommand, GameStatsCommand, SuggestCommand, GetBadgesCommand] as const

const Commands: Map<Command['name'], Command> = new Map()
const GlobalCommands: ChatInputApplicationCommandData[] = []
const LocalCommands: ChatInputApplicationCommandData[] = []

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

export async function ProcessChatCommand(interaction: CommandInteraction): Promise<void> {
	const name = interaction.commandName
	const cmd = Commands.get(name)
	if (!cmd) {
		throw new UserError('Command handler not found')
	}
	await Promise.resolve(cmd.handler(interaction))
}

async function SetupLocalChatCommands() {
	const guild = await getGuild()
	const comman = guild.commands
	await comman.set(LocalCommands)
}

export async function SetupChatCommands(): Promise<void> {
	await SetupLocalChatCommands()
}

export default Commands
