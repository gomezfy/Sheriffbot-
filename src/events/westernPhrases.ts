import { Events, Message, Attachment } from 'discord.js';

const westernImageKeywords = [
  'cowboy', 'cowboys', 'rdr2', 'red-dead', 'reddead', 'redemption',
  'western', 'oeste', 'wild-west', 'wildwest', 'velho-oeste',
  'hat', 'chapeu', 'stetson', 'horse', 'cavalo',
  'revolver', 'pistol', 'gun', 'arma', 'sheriff', 'xerife',
  'saloon', 'ranch', 'fazenda', 'desert', 'deserto',
  'outlaw', 'bandido', 'bounty', 'wanted', 'procurado',
  'gold', 'ouro', 'mine', 'mineração', 'minera',
  'yeehaw', 'yee-haw', 'howdy', 'meowdy',
  'arthur-morgan', 'john-marston', 'dutch', 'micah'
];

const imageResponses = [
  "🤠 Essa imagem é puro Velho Oeste, parceiro!",
  "⭐ Que visual Western massa, cowboy!",
  "🐴 Isso sim é espírito do oeste!",
  "🎯 RDR2 vibes detected! Yeehaw!",
  "🌵 Imagem top demais, partner! Velho Oeste raiz!",
  "💰 Tá com cara de quem curte o Velho Oeste!",
  "🔫 Esse é o verdadeiro espírito Western!",
  "🏜️ Deserto, cowboys e aventura! Assim que é!",
  "🤠 Howdy partner! Curtindo o oeste selvagem?",
  "⚡ Red Dead Redemption vibes! Que imagem top!",
  "🎰 Isso é que é visual de saloon!",
  "🥇 Imagem de cowboy raiz! Respeito!",
  "👢 Botas, chapéu e revólver! Velho Oeste perfeito!",
  "🌟 Arthur Morgan would be proud! 🤠",
  "🎯 That's the Wild West spirit right there!",
  "🐎 Beautiful Western scene, partner!",
  "💎 This screams Red Dead Redemption!",
  "🔥 Cowboy energy is strong with this one!",
  "⭐ Pure frontier vibes! Love it!",
  "🏆 Now that's a proper Western image!"
];

const westernPhrases: Record<string, string[]> = {
  wanted: [
    "Wanted, dead or alive! There's a bounty on your head, partner!",
    "I seen your face on a poster in the sheriff's office. You're wanted, stranger!",
    "Word 'round these parts is there's a price on your head, outlaw.",
    "You got the look of a wanted man. Best watch your back in these parts.",
    "The sheriff's been asking about you. Seems you're wanted for something."
  ],
  sheriff: [
    "The sheriff don't take kindly to troublemakers in this town.",
    "I'm the law 'round here, and don't you forget it!",
    "This town ain't big enough for lawbreakers. I suggest you keep your nose clean.",
    "As sheriff, I've got my eye on all you outlaws.",
    "The badge I wear means something in this town. Best remember that."
  ],
  'good morning': [
    "Mornin', partner! Ready for another day in the wild west?",
    "Good morning, stranger! The sun's up and so are the opportunities.",
    "Well, howdy there! Top of the morning to ya!",
    "Rise and shine, cowpoke! Another fine day in the frontier.",
    "Morning, friend! Coffee's hot and the gold's waiting to be earned."
  ],
  'good night': [
    "Rest easy, partner. Tomorrow's another day in the wild west.",
    "Good night, stranger. Keep your gun close and your dreams closer.",
    "Sleep tight, cowpoke. Don't let the tumbleweeds bite.",
    "Night falls on the frontier. Get some shut-eye, you'll need it.",
    "The saloon's closing, friend. Time to hit the hay."
  ],
  drinks: [
    "Bartender! Whiskey for my friend here!",
    "Nothing like a cold drink after a long day on the trail.",
    "Pull up a stool, partner. First round's on me!",
    "This here's the finest whiskey west of the Mississippi!",
    "A drink sounds mighty fine right about now. What's your poison?"
  ],
  howdy: [
    "Howdy, partner! What brings you to these parts?",
    "Well, howdy there, stranger!",
    "Howdy! Welcome to the frontier!",
    "Howdy, friend! Good to see a friendly face.",
    "Howdy! You new in town, or just passing through?"
  ],
  mine: [
    "Vai minerar ouro? Usa /mine aí, parceiro! ⛏️",
    "Ouro nas montanhas! Bora minerar com /mine! 🥇",
    "Pegue sua picareta e use /mine, cowboy!",
    "Mineração? Chama o parceiro com /mine! 👥",
    "Gold mining time! Use /mine partner! ⛏️"
  ],
  daily: [
    "Pegou suas moedas hoje? /daily tá te esperando! 🪙",
    "Todo dia tem moeda grátis no /daily, parceiro! 💰",
    "Passa no caixa com /daily todo dia! 🎁",
    "Daily reward waiting! Use /daily cowboy! 🪙"
  ],
};

const lastResponse = new Map<string, number>();
const COOLDOWN = 10000;

function detectWesternImage(attachment: Attachment): boolean {
  const url = attachment.url.toLowerCase();
  const filename = attachment.name?.toLowerCase() || '';
  const proxyUrl = attachment.proxyURL?.toLowerCase() || '';
  
  const fullText = `${url} ${filename} ${proxyUrl}`;
  
  for (const keyword of westernImageKeywords) {
    if (fullText.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

export = {
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;
    
    const channelId = message.channel.id;
    const now = Date.now();
    const lastTime = lastResponse.get(channelId);
    
    if (lastTime && (now - lastTime) < COOLDOWN) {
      return;
    }

    try {
      if (message.attachments.size > 0) {
        for (const [, attachment] of message.attachments) {
          const isImage = attachment.contentType?.startsWith('image/') || 
                         attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
          
          if (isImage && detectWesternImage(attachment)) {
            const chance = 0.35;
            
            if (Math.random() < chance) {
              const randomResponse = imageResponses[Math.floor(Math.random() * imageResponses.length)];
              
              setTimeout(() => {
                message.reply(randomResponse).catch(err => {
                  console.error('Error sending image reply:', err);
                });
              }, 800);
              
              lastResponse.set(channelId, now);
              return;
            }
          }
        }
      }

      const content = message.content.toLowerCase();

      for (const [keyword, phrases] of Object.entries(westernPhrases)) {
        if (content.includes(keyword)) {
          const chance = 0.18;
          
          if (Math.random() < chance) {
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            
            setTimeout(() => {
              message.reply(randomPhrase).catch(err => {
                console.error('Error sending auto-reply:', err);
              });
            }, 800);
            
            lastResponse.set(channelId, now);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error in westernPhrases event:', error);
    }
  },
};
