# Announcer Bot - Typescript version
This is a completely new codebase which is based from my ([Mokiros](http://github.com/Mokiros)) code for a different project.

# Installation and usage
1. Get the bot token from https://discord.com/developers/applications
2. Get Guild ID and Bot ID
3. Put it all in `.env` file under following keys:
   * `DISCORD_BOT_TOKEN`
   * `DISCORD_GUILD_ID`
   * `DISCORD_BOT_ID`
4. Run one of the following:
```sh
# NPM

# Install dependencies
npm install

# Run in development mode
npm run dev

# Compile for production
npm run build

# Run compiled version in terminal
npm start

# Run compiled version using pm2
npm run pm2
```
```sh
# Yarn

# Install dependencies
yarn install

# Run in development mode
yarn dev

# Compile for production
yarn build

# Run compiled version in terminal
yarn start

# Run compiled version using pm2
yarn pm2
```

# How to add a new command
1. Create new `.ts` file in the `src/Commands` directory.
2. Add the command to the `SlashCommands` array in the `src/Commands/index.ts` file.
For reference, use `src/Commands/GetAvatar.ts` as an example.
