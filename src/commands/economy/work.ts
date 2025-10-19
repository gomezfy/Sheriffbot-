import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { addItem } = require('../../utils/inventoryManager');
const { addUserXP } = require('../../utils/xpManager');
const { showProgressBar } = require('../../utils/progressBar');
const { readData, writeData } = require('../../utils/database');

const workCooldown = 2 * 60 * 60 * 1000;

interface WorkData {
  [userId: string]: number;
}

function getWorkData(): WorkData {
  return readData('work.json');
}

function saveWorkData(data: WorkData): void {
  writeData('work.json', data);
}

interface Job {
  name: string;
  icon: string;
  minSilver: number;
  maxSilver: number;
  minXP: number;
  maxXP: number;
  messages: string[];
}

const jobs: Job[] = [
  {
    name: 'Sheriff Deputy',
    icon: '🤠',
    minSilver: 300,
    maxSilver: 600,
    minXP: 30,
    maxXP: 60,
    messages: [
      'You helped capture a notorious outlaw!',
      'You patrolled the town and kept the peace.',
      'You recovered stolen goods from bandits!',
      'You protected the bank from robbers.',
      'You broke up a saloon brawl successfully!'
    ]
  },
  {
    name: 'Bartender',
    icon: '🍺',
    minSilver: 200,
    maxSilver: 400,
    minXP: 20,
    maxXP: 40,
    messages: [
      'You served drinks to thirsty cowboys all day!',
      'You mixed the perfect whiskey cocktail!',
      'You broke up a bar fight and earned extra tips!',
      'The saloon was packed tonight. Good tips!',
      'You entertained customers with stories!'
    ]
  },
  {
    name: 'Blacksmith',
    icon: '🔨',
    minSilver: 400,
    maxSilver: 700,
    minXP: 40,
    maxXP: 70,
    messages: [
      'You forged a fine horseshoe for a wealthy rancher!',
      'You repaired weapons for the local militia!',
      'You crafted a custom revolver for a gunslinger!',
      'You shoed horses all day. Hard work pays off!',
      'You repaired wagon wheels for travelers!'
    ]
  },
  {
    name: 'Prospector',
    icon: '⛏️',
    minSilver: 250,
    maxSilver: 800,
    minXP: 25,
    maxXP: 80,
    messages: [
      'You found a small gold nugget in the creek!',
      'You discovered a silver vein in the mountains!',
      'Lady Luck smiled on you today. Big find!',
      'You panned for gold all day with modest success.',
      'You struck a decent ore deposit!'
    ]
  },
  {
    name: 'Ranch Hand',
    icon: '🐎',
    minSilver: 180,
    maxSilver: 350,
    minXP: 18,
    maxXP: 35,
    messages: [
      'You rounded up cattle successfully!',
      'You fixed fences around the ranch.',
      'You tamed a wild horse!',
      'You helped with the harvest. Hard but honest work!',
      'You fed and groomed the horses all day.'
    ]
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('💼 Work a job to earn Silver Coins and XP!'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const workData = getWorkData();
    
    const now = Date.now();
    const lastWork = workData[userId] || 0;
    const timeSinceLastWork = now - lastWork;
    
    if (timeSinceLastWork < workCooldown) {
      const timeLeft = workCooldown - timeSinceLastWork;
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      await interaction.reply({
        embeds: [{
          color: 0xFF6B6B,
          title: '⏰ WORK COOLDOWN',
          description: `You're too tired to work right now!\n\n**Time remaining:** ${hoursLeft}h ${minutesLeft}m`,
          footer: { text: 'Rest up, partner!' }
        }],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const message = job.messages[Math.floor(Math.random() * job.messages.length)];
    
    const silverEarned = Math.floor(Math.random() * (job.maxSilver - job.minSilver + 1)) + job.minSilver;
    const xpEarned = Math.floor(Math.random() * (job.maxXP - job.minXP + 1)) + job.minXP;

    await showProgressBar(interaction, `${job.icon} ${job.name.toUpperCase()}`, message, 3000, '#8B4513');

    const result = addItem(userId, 'silver', silverEarned);

    if (!result.success) {
      await interaction.editReply({
        embeds: [{
          color: 0xFF0000,
          title: '❌ WORK FAILED',
          description: `${result.error}\n\nYour inventory is too full to receive payment!`,
          footer: { text: 'Free up space and try again!' }
        }]
      });
    }

    addUserXP(userId, xpEarned);
    
    workData[userId] = now;
    saveWorkData(workData);

    const embed = new EmbedBuilder()
      .setColor('#8B4513')
      .setTitle(`${job.icon} ${job.name.toUpperCase()}`)
      .setDescription(`**${message}**\n\n\`\`\`diff\n+ Work completed successfully!\n\`\`\``)
      .addFields(
        { name: '🪙 Earned', value: `**${silverEarned.toLocaleString()}** Silver Coins`, inline: true },
        { name: '⭐ XP Gained', value: `**+${xpEarned}**`, inline: true },
        { name: '⏰ Next Work', value: 'In 2 hours', inline: true }
      )
      .setFooter({ text: 'Hard work pays off in the Wild West!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
