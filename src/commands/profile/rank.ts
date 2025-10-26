import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getUserXp, getXpForLevel } from '../../utils/xpManager';

export const data = new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Shows your current level and XP.')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to check the rank of.')
            .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const { xp, level } = getUserXp(user.id);
    const xpForNextLevel = getXpForLevel(level);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${user.tag}'s Rank`, iconURL: user.displayAvatarURL() })
        .setColor('#FFD700')
        .addFields(
            { name: 'Level', value: `**${level}**`, inline: true },
            { name: 'XP', value: `**${xp} / ${xpForNextLevel}**`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
