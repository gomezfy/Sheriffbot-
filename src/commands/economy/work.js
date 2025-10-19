const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addItem } = require('../../utils/inventoryManager');
const fs = require('fs');
const path = require('path');

const workFile = path.join(__dirname, '..', '..', 'data', 'work.json');

// Initialize work file if it doesn't exist
if (!fs.existsSync(workFile)) {
  fs.writeFileSync(workFile, JSON.stringify({}, null, 2));
}

// Western-themed jobs with different payouts and cooldowns
const JOBS = {
  cowboy: {
    name: '🤠 Cowboy',
    minPay: 50,
    maxPay: 150,
    cooldown: 60 * 60 * 1000, // 1 hour
    messages: [
      'You herded cattle across the dusty plains!',
      'You broke in a wild mustang!',
      'You rode shotgun on a cattle drive!',
      'You roped a dozen steers at the ranch!'
    ]
  },
  barman: {
    name: '🍺 Barman',
    minPay: 30,
    maxPay: 100,
    cooldown: 45 * 60 * 1000, // 45 minutes
    messages: [
      'You served whiskey to thirsty outlaws!',
      'You broke up a bar fight and earned tips!',
      'You poured drinks all night at the saloon!',
      'You cleaned glasses and collected generous tips!'
    ]
  },
  miner: {
    name: '⛏️ Miner',
    minPay: 80,
    maxPay: 200,
    cooldown: 90 * 60 * 1000, // 1.5 hours
    messages: [
      'You struck a small silver vein!',
      'You hauled ore carts all day!',
      'You dug deep into the mountain!',
      'You found valuable minerals in the mine!'
    ],
    goldChance: 0.15 // 15% chance to find a gold bar
  },
  blacksmith: {
    name: '🔨 Blacksmith',
    minPay: 60,
    maxPay: 180,
    cooldown: 75 * 60 * 1000, // 1.25 hours
    messages: [
      'You forged horseshoes for the cavalry!',
      'You repaired guns for the sheriff!',
      'You crafted a beautiful iron gate!',
      'You sharpened blades at the forge!'
    ]
  },
  sheriff_deputy: {
    name: '⭐ Sheriff Deputy',
    minPay: 100,
    maxPay: 250,
    cooldown: 2 * 60 * 60 * 1000, // 2 hours
    messages: [
      'You patrolled the town and kept order!',
      'You escorted prisoners to jail!',
      'You investigated a robbery and caught the thief!',
      'You protected the bank from outlaws!'
    ]
  }
};

function getLastWork(userId) {
  const data = fs.readFileSync(workFile, 'utf8');
  const workData = JSON.parse(data);
  return workData[userId] || {};
}

function setLastWork(userId, jobType) {
  const data = fs.readFileSync(workFile, 'utf8');
  const workData = JSON.parse(data);
  
  if (!workData[userId]) {
    workData[userId] = {};
  }
  
  workData[userId][jobType] = Date.now();
  fs.writeFileSync(workFile, JSON.stringify(workData, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('🛠️ Work a job to earn Silver Coins!')
    .addStringOption(option =>
      option
        .setName('job')
        .setDescription('Choose your job')
        .setRequired(true)
        .addChoices(
          { name: '🤠 Cowboy (50-150 coins, 1h cooldown)', value: 'cowboy' },
          { name: '🍺 Barman (30-100 coins, 45m cooldown)', value: 'barman' },
          { name: '⛏️ Miner (80-200 coins, 1.5h cooldown, gold chance!)', value: 'miner' },
          { name: '🔨 Blacksmith (60-180 coins, 1.25h cooldown)', value: 'blacksmith' },
          { name: '⭐ Sheriff Deputy (100-250 coins, 2h cooldown)', value: 'sheriff_deputy' }
        )
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const jobType = interaction.options.getString('job');
    const job = JOBS[jobType];

    if (!job) {
      return interaction.reply({
        content: '❌ Invalid job selected!',
        ephemeral: true
      });
    }

    const lastWork = getLastWork(userId);
    const now = Date.now();

    // Check cooldown
    if (lastWork[jobType]) {
      const timeSinceWork = now - lastWork[jobType];
      
      if (timeSinceWork < job.cooldown) {
        const timeLeft = job.cooldown - timeSinceWork;
        const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;

        const timeDisplay = hoursLeft > 0 
          ? `${hoursLeft}h ${minsLeft}m` 
          : `${minsLeft}m`;

        return interaction.reply({
          content: `⏰ You're too tired to work as a ${job.name} right now!\n\nCome back in **${timeDisplay}** to work this job again.`,
          ephemeral: true
        });
      }
    }

    // Calculate earnings
    const earnings = Math.floor(Math.random() * (job.maxPay - job.minPay + 1)) + job.minPay;
    const message = job.messages[Math.floor(Math.random() * job.messages.length)];

    // Add silver to inventory
    const silverResult = addItem(userId, 'silver', earnings);
    
    if (!silverResult.success) {
      return interaction.reply({
        content: `❌ Your inventory is too heavy! Clean it before working.\n\nError: ${silverResult.error}`,
        ephemeral: true
      });
    }

    // Check for gold bar (miner only)
    let foundGold = false;
    if (jobType === 'miner' && job.goldChance) {
      if (Math.random() < job.goldChance) {
        const goldResult = addItem(userId, 'gold', 1);
        if (goldResult.success) {
          foundGold = true;
        }
      }
    }

    // Update last work time
    setLastWork(userId, jobType);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`${job.name} - Work Complete!`)
      .setDescription(message)
      .addFields(
        { name: '💵 Earned', value: `🪙 ${earnings.toLocaleString()} Silver Coins`, inline: true },
        { name: '💰 Total', value: `🪙 ${silverResult.totalQuantity.toLocaleString()} Silver Coins`, inline: true }
      )
      .setFooter({ text: 'Work hard, earn big! Come back later for more work.' })
      .setTimestamp();

    if (foundGold) {
      embed.addFields({ 
        name: '🎁 Bonus!', 
        value: '🥇 Found 1 Gold Bar while mining!', 
        inline: false 
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
