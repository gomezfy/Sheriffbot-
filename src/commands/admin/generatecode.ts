import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { writeData } from '../../utils/database';

const redemptionCodesPath = path.join(__dirname, '..', '..', '..', 'data', 'redemption-codes.json');
const OWNER_ID = '339772388566892546';

interface RedemptionCode {
  productId: string;
  productName: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: boolean;
  createdAt: number;
  createdBy: string;
  redeemed: boolean;
}

interface Product {
  name: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: boolean;
}

function loadRedemptionCodes(): Record<string, RedemptionCode> {
  if (!fs.existsSync(redemptionCodesPath)) {
    const dataDir = path.dirname(redemptionCodesPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(redemptionCodesPath, '{}');
  }
  return JSON.parse(fs.readFileSync(redemptionCodesPath, 'utf-8'));
}

function saveRedemptionCodes(data: Record<string, RedemptionCode>): void {
  writeData('redemption-codes.json', data);
}

function generateRedemptionCode(productId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SHERIFF-${productId.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generatecode')
    .setDescription('[OWNER ONLY] Generate a redemption code manually')
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Product type')
        .setRequired(true)
        .addChoices(
          { name: 'Starter Pack ($1.99)', value: 'starter' },
          { name: 'Popular Pack ($4.99)', value: 'popular' },
          { name: 'Gold Pack ($9.99)', value: 'gold' },
          { name: 'Ultimate Pack ($19.99)', value: 'ultimate' },
          { name: 'Backpack Upgrade ($9.99)', value: 'backpack' }
        ))
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: '❌ This command is only available to the bot owner!',
        ephemeral: true
      });
      return;
    }

    const productId = interaction.options.getString('product', true);

    await interaction.deferReply({ ephemeral: true });

    try {
      const PRODUCTS: Record<string, Product> = {
        starter: {
          name: 'Starter Pack',
          tokens: 100,
          coins: 5000,
          vip: false,
          background: false
        },
        popular: {
          name: 'Popular Pack',
          tokens: 350,
          coins: 15000,
          vip: false,
          background: false
        },
        gold: {
          name: 'Gold Pack',
          tokens: 900,
          coins: 40000,
          vip: true,
          background: false
        },
        ultimate: {
          name: 'Ultimate Pack',
          tokens: 2500,
          coins: 100000,
          vip: true,
          background: true
        },
        backpack: {
          name: 'Backpack Upgrade',
          tokens: 0,
          coins: 0,
          vip: false,
          background: false,
          backpack: true
        }
      };

      const product = PRODUCTS[productId];
      const code = generateRedemptionCode(productId);

      const redemptionCodes = loadRedemptionCodes();

      redemptionCodes[code] = {
        productId: productId,
        productName: product.name,
        tokens: product.tokens,
        coins: product.coins,
        vip: product.vip,
        background: product.background,
        backpack: product.backpack || false,
        createdAt: Date.now(),
        createdBy: interaction.user.id,
        redeemed: false
      };

      saveRedemptionCodes(redemptionCodes);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✅ Redemption Code Generated!')
        .setDescription(`**${product.name}** code created successfully!`)
        .addFields(
          { name: '🔑 Redemption Code', value: `\`${code}\``, inline: false },
          { name: '🎫 Saloon Tokens', value: `${product.tokens.toLocaleString()}`, inline: true },
          { name: '🪙 Silver Coins', value: `${product.coins.toLocaleString()}`, inline: true },
          { name: '\u200b', value: '\u200b', inline: true }
        )
        .setFooter({ text: 'This code can be redeemed once using /redeem' })
        .setTimestamp();

      if (product.vip) {
        embed.addFields({ name: '🌟 VIP Status', value: 'Included', inline: true });
      }

      if (product.background) {
        embed.addFields({ name: '🎨 Exclusive Background', value: 'Included', inline: true });
      }

      if (product.backpack) {
        embed.addFields({ name: '🎒 Backpack Upgrade', value: '100kg → 500kg', inline: true });
      }

      await interaction.editReply({ embeds: [embed] });

      console.log(`📝 Code generated: ${code} for ${product.name} by ${interaction.user.tag}`);

    } catch (error) {
      console.error('Error generating code:', error);
      await interaction.editReply({
        content: `❌ Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
};
