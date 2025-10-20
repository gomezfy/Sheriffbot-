import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency, formatDuration } from '../../utils/embeds';
const { addItem } = require('../../utils/inventoryManager');
const { showProgressBar } = require('../../utils/progressBar');
const { readData, writeData } = require('../../utils/database');

const WORK_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours

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
  messages: string[];
}

const JOBS: Job[] = [
  {
    name: 'Sheriff Deputy',
    icon: '🤠',
    minSilver: 300,
    maxSilver: 600,
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
    .setDescription('💼 Work a job to earn Silver Coins'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const workData = getWorkData();
    
    const now = Date.now();
    const lastWork = workData[userId] || 0;
    const timeSinceLastWork = now - lastWork;
    
    // Check cooldown
    if (timeSinceLastWork < WORK_COOLDOWN) {
      const timeLeft = WORK_COOLDOWN - timeSinceLastWork;
      
      const embed = warningEmbed(
        'Work Cooldown',
        `You're too tired to work right now, partner!\n\n**Rest time remaining:** ${formatDuration(timeLeft)}`,
        'Come back after you\'ve rested up'
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply();

    // Select random job
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const message = job.messages[Math.floor(Math.random() * job.messages.length)];
    
    const silverEarned = Math.floor(Math.random() * (job.maxSilver - job.minSilver + 1)) + job.minSilver;

    // Show working animation
    await showProgressBar(interaction, `${job.icon} ${job.name.toUpperCase()}`, message, 3000, '#10b981');

    // Add reward
    const result = addItem(userId, 'silver', silverEarned);

    if (!result.success) {
      const embed = errorEmbed(
        'Work Failed',
        `${result.error}\n\nYour backpack is too full to receive payment!`,
        'Free up space with /give or upgrade your backpack'
      );
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }
    
    // Save work timestamp
    workData[userId] = now;
    saveWorkData(workData);

    // Success message
    const embed = successEmbed(
      `${job.icon} ${job.name}`,
      message
    ).addFields(
      { 
        name: '💰 Earnings', 
        value: formatCurrency(silverEarned, 'silver'), 
        inline: true 
      },
      { 
        name: '⏰ Next Work Available', 
        value: formatDuration(WORK_COOLDOWN), 
        inline: true 
      }
    ).setFooter({ text: 'Hard work pays off in the Wild West!' });

    await interaction.editReply({ embeds: [embed] });
  },
};
