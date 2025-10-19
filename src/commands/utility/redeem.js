const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '..', '..', '..', 'data', 'economy.json');
const redemptionCodesPath = path.join(__dirname, '..', '..', '..', 'data', 'redemption-codes.json');
const inventoryPath = path.join(__dirname, '..', '..', '..', 'data', 'inventory.json');

function loadEconomy() {
    if (!fs.existsSync(economyPath)) {
        fs.writeFileSync(economyPath, '{}');
    }
    return JSON.parse(fs.readFileSync(economyPath, 'utf-8'));
}

function saveEconomy(data) {
    fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

function loadRedemptionCodes() {
    if (!fs.existsSync(redemptionCodesPath)) {
        fs.writeFileSync(redemptionCodesPath, '{}');
    }
    return JSON.parse(fs.readFileSync(redemptionCodesPath, 'utf-8'));
}

function saveRedemptionCodes(data) {
    fs.writeFileSync(redemptionCodesPath, JSON.stringify(data, null, 2));
}

function loadInventory() {
    if (!fs.existsSync(inventoryPath)) {
        fs.writeFileSync(inventoryPath, '{}');
    }
    return JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
}

function saveInventory(data) {
    fs.writeFileSync(inventoryPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('🎁 Redeem a purchase code from the Sheriff Bot shop')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The redemption code you received after purchase')
                .setRequired(true)),
    async execute(interaction) {
        const code = interaction.options.getString('code').toUpperCase();
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Load redemption codes database
            const redemptionCodes = loadRedemptionCodes();

            // Check if code exists
            if (!redemptionCodes[code]) {
                return interaction.editReply({
                    content: '❌ **Invalid Redemption Code!**\n\n' +
                        'This code does not exist or has already been used.\n\n' +
                        '**Troubleshooting:**\n' +
                        '• Make sure you copied the entire code\n' +
                        '• Check for typos or extra spaces\n' +
                        '• Codes can only be used once\n\n' +
                        'If you believe this is an error, please contact support.'
                });
            }

            const codeData = redemptionCodes[code];

            // Check if code has already been redeemed
            if (codeData.redeemed) {
                return interaction.editReply({
                    content: `❌ **Code Already Redeemed!**\n\n` +
                        `This code was already used by <@${codeData.redeemedBy}> on <t:${Math.floor(codeData.redeemedAt / 1000)}:F>.\n\n` +
                        `Each code can only be used once.`
                });
            }

            // Load economy data
            const economy = loadEconomy();
            
            if (!economy[userId]) {
                economy[userId] = {
                    tokens: 0,
                    coins: 0,
                    vip: false
                };
            }

            // Add tokens and coins
            economy[userId].tokens = (economy[userId].tokens || 0) + codeData.tokens;
            economy[userId].coins = (economy[userId].coins || 0) + codeData.coins;

            // Add VIP status if included
            if (codeData.vip) {
                economy[userId].vip = true;
            }

            // Add exclusive background if included
            if (codeData.background) {
                economy[userId].exclusiveBackground = true;
            }

            // Add backpack upgrade if included
            if (codeData.backpack) {
                const inventory = loadInventory();
                if (!inventory[userId]) {
                    inventory[userId] = {
                        items: {},
                        weight: 0,
                        maxWeight: 100 // Will be preserved if user already has upgrade
                    };
                }
                
                // IMPORTANT: Preserve existing maxWeight if user already has upgrade
                const currentMaxWeight = inventory[userId].maxWeight || 100;
                inventory[userId].maxWeight = 500;
                saveInventory(inventory);
            }

            // Save updated economy
            saveEconomy(economy);

            // Mark code as redeemed
            codeData.redeemed = true;
            codeData.redeemedBy = userId;
            codeData.redeemedAt = Date.now();
            saveRedemptionCodes(redemptionCodes);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('✅ Redemption Successful!')
                .setDescription(`**${codeData.productName}** has been added to your account!`)
                .addFields(
                    { name: '🎫 Saloon Tokens', value: `+${codeData.tokens.toLocaleString()}`, inline: true },
                    { name: '🪙 Silver Coins', value: `+${codeData.coins.toLocaleString()}`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }
                )
                .setFooter({ text: `Code: ${code}` })
                .setTimestamp();

            // Add VIP field if applicable
            if (codeData.vip) {
                embed.addFields({ name: '🌟 VIP Status', value: 'Activated!', inline: true });
            }

            // Add exclusive background field if applicable
            if (codeData.background) {
                embed.addFields({ name: '🎨 Exclusive Background', value: 'Unlocked!', inline: true });
            }

            // Add backpack upgrade field if applicable
            if (codeData.backpack) {
                embed.addFields({ name: '🎒 Backpack Upgrade', value: '100kg → 500kg capacity!', inline: true });
            }

            // Show new balances
            embed.addFields(
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '💰 New Balance', value: `🎫 ${economy[userId].tokens.toLocaleString()} Tokens\n🪙 ${economy[userId].coins.toLocaleString()} Coins`, inline: false }
            );

            await interaction.editReply({ embeds: [embed] });

            // Log redemption
            console.log(`✅ Code redeemed: ${code} by ${interaction.user.tag} (${userId})`);

        } catch (error) {
            console.error('Error redeeming code:', error);
            await interaction.editReply({
                content: '❌ An error occurred while redeeming your code. Please try again or contact support.\n\n' +
                    `Error: ${error.message}`
            });
        }
    },
};
