import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');

const commandCategories = fs.readdirSync(commandsPath).filter(item => {
  const itemPath = path.join(commandsPath, item);
  return fs.statSync(itemPath).isDirectory();
});

for (const category of commandCategories) {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs.readdirSync(categoryPath).filter(file => 
    (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
  );
  
  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ Command loaded: ${command.data.name} (${category})`);
    } else {
      console.log(`⚠️  Command in ${file} is missing "data" or "execute"`);
    }
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ ERROR: DISCORD_TOKEN or DISCORD_CLIENT_ID not configured in environment variables');
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    ) as any[];

    console.log(`✅ ${data.length} commands registered successfully!`);
  } catch (error) {
    console.error('❌ Error registering commands:');
    console.error(error);
  }
})();
