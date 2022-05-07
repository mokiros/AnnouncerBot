import {
	ApplicationCommand,
	ChatInputApplicationCommandData,
	Collection,
	CommandInteraction,
	Constants,
} from 'discord.js'
import Command from './Command'
import GetAvatar from './GetAvatar'
import { UserError } from '../util'
import { getGuild } from '../common'
import EvalCommand from './Eval'
import GameStatsCommand from './GameStats'
import SuggestCommand from './Suggest'

const SlashCommands = [GetAvatar, EvalCommand, GameStatsCommand, SuggestCommand] as const

const Commands: Map<Command['name'], Command> = new Map()
const GlobalCommands: ChatInputApplicationCommandData[] = []
const LocalCommands: ChatInputApplicationCommandData[] = []
const Permissions: Map<Command['name'], Command['permissions']> = new Map()

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
	if (cmd.permissions) {
		Permissions.set(cmd.name, cmd.permissions)
	}
}

export async function ProcessChatCommand(interaction: CommandInteraction): Promise<void> {
	const name = interaction.commandName
	const cmd = Commands.get(name)
	if (!cmd) {
		throw new UserError('Command handler not found')
	}
	await Promise.resolve(cmd.handler(interaction))
}

function GetCommandsPermissions(cmds: Collection<string, ApplicationCommand>) {
	const PermissionData = []
	for (const [id, cmd] of cmds) {
		const permissions = Permissions.get(cmd.name)
		if (!permissions) {
			continue
		}
		PermissionData.push({ id, permissions })
	}
	return PermissionData
}

async function SetupLocalChatCommands() {
	const guild = await getGuild()
	const comman = guild.commands
	const cmds = await comman.set(LocalCommands)

	//	Currently returns 405 Method Not Allowed.
	//	Possible cause: incorrect permissions when adding the bot
	//	Related documentation: https://discord.com/developers/docs/interactions/application-commands#permissions
	//const PermissionData = GetCommandsPermissions(cmds)
	//await comman.permissions.set({ fullPermissions: PermissionData })
}

export async function SetupChatCommands(): Promise<void> {
	await SetupLocalChatCommands()
}

export default Commands
