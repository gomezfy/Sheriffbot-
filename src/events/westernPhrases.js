const { Events } = require('discord.js');

// Keywords para detectar em URLs/nomes de arquivos de imagens
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

// Frases de resposta para imagens Western detectadas
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

const westernPhrases = {
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
  whisky: [
    "Whisky's the lifeblood of the frontier, partner!",
    "Pour me a double whisky, bartender!",
    "That whisky'll warm your bones on a cold desert night.",
    "Best whisky in the territory right here!",
    "A bottle of whisky and a game of cards - that's living!"
  ],
  bourbon: [
    "Finest bourbon this side of Kentucky!",
    "Bourbon's the drink of choice for true cowboys.",
    "Nothing beats a glass of smooth bourbon after a long ride.",
    "That bourbon'll put hair on your chest, partner!"
  ],
  beer: [
    "Cold beer on a hot day - can't beat that!",
    "Bartender! A beer for the road!",
    "Beer's flowin' like the river tonight!",
    "Nothing like an ice-cold beer after work, eh partner?"
  ],
  tequila: [
    "Tequila! Now that's a drink with some kick!",
    "South of the border's finest - tequila!",
    "That tequila'll knock you flat, stranger!",
    "Tequila shots all around! We're celebrating tonight!"
  ],
  howdy: [
    "Howdy, partner! What brings you to these parts?",
    "Well, howdy there, stranger!",
    "Howdy! Welcome to the frontier!",
    "Howdy, friend! Good to see a friendly face.",
    "Howdy! You new in town, or just passing through?"
  ],
  yee: [
    "Yee-haw! That's the spirit, cowpoke!",
    "YEE-HAW! Ride 'em, cowboy!",
    "That's the western spirit! Yee-haw!",
    "Yee-haw, partner! Let's rustle up some fun!"
  ],
  outlaw: [
    "An outlaw, eh? The sheriff won't like that one bit.",
    "Outlaws ain't welcome in this town, stranger.",
    "You got the look of an outlaw. Best keep a low profile.",
    "Outlaws live fast and die young out here in the west."
  ],
  robbery: [
    "Planning a robbery? Better watch out for the law!",
    "Robbery's a risky business in these parts, partner.",
    "I heard tell of a robbery happening down at the bank...",
    "The sheriff's been cracking down on robberies lately.",
    "Robbery will get you a one-way ticket to the gallows!"
  ],
  assalto: [
    "Um assalto? Cuidado com o xerife, parceiro!",
    "Assaltos são perigosos nestas bandas!",
    "Ouvi falar de um assalto planejado na cidade...",
    "O xerife não tolera assaltantes por aqui!",
    "Assalto ao banco? Você é corajoso ou louco!"
  ],
  roubo: [
    "Roubo? Isso é coisa séria no Velho Oeste!",
    "O xerife tá de olho em qualquer roubo por aqui.",
    "Já vi muitos bandidos enforcados por roubo...",
    "Roubar é arriscado, mas o ouro vale a pena, né?"
  ],
  bank: [
    "The bank's got the most gold in town, but it's heavily guarded!",
    "Thinking about the bank, eh? Be careful, partner.",
    "The bank vault's thicker than a fortress wall!",
    "That bank's been robbed three times this month already!",
    "The bank manager's got a shotgun under his desk, just so you know."
  ],
  banco: [
    "O banco tá cheio de ouro, mas bem guardado!",
    "O banco? Lugar perigoso pra se meter, amigo.",
    "Já pensou em assaltar o banco? Melhor não...",
    "O cofre do banco é impenetrável, dizem."
  ],
  gold: [
    "Gold! That's what everyone's after in these parts.",
    "There's gold in them hills, partner!",
    "Gold fever's taken over this town, friend.",
    "Strike it rich with gold, or die trying. That's the way of the west."
  ],
  ouro: [
    "Ouro! Todos querem ouro por aqui!",
    "Tem ouro naquelas colinas, parceiro!",
    "A febre do ouro tomou conta da cidade!",
    "Ouro é poder no Velho Oeste!"
  ],
  saloon: [
    "The saloon's always open for weary travelers!",
    "Best saloon west of the Mississippi right here!",
    "Come on into the saloon, we got cards, drinks, and stories!",
    "Every good story in this town starts at the saloon."
  ],
  pistol: [
    "That's a fine pistol you got there, partner!",
    "Never leave home without your pistol in these parts.",
    "A cowboy's pistol is his best friend.",
    "Fast with a pistol? You might survive out here."
  ],
  revolver: [
    "Six-shooter revolver - the great equalizer!",
    "That revolver's seen some action, I bet.",
    "Every gunslinger needs a trusty revolver.",
    "Keep that revolver clean and it'll save your life someday."
  ],
  duel: [
    "A duel at high noon? Classic!",
    "Duels are how disputes are settled in the west.",
    "Meet me at main street for a duel, if you dare!",
    "Only one walks away from a duel, partner."
  ],
  cowboy: [
    "You look like a real cowboy, partner!",
    "Cowboys built this frontier with their bare hands.",
    "Being a cowboy ain't easy, but it's honest work.",
    "Ride like a cowboy, drink like a cowboy, fight like a cowboy!"
  ],
  horse: [
    "A cowboy without a horse is just a boy.",
    "That's a fine horse you got there!",
    "Horses are more loyal than most people out here.",
    "Take care of your horse and it'll take care of you."
  ],
  desert: [
    "The desert's unforgiving, partner. Stay hydrated!",
    "Many men have perished in these desert lands.",
    "Desert nights are cold, desert days are scorching.",
    "The desert holds many secrets and treasures."
  ],
  mine: [
    "Vai minerar ouro? Usa /mine aí, parceiro! ⛏️",
    "Ouro nas montanhas! Bora minerar com /mine! 🥇",
    "Pegue sua picareta e use /mine, cowboy!",
    "Mineração? Chama o parceiro com /mine! 👥",
    "Gold mining time! Use /mine partner! ⛏️"
  ],
  miner: [
    "Garimpeiro? Usa /mine pra achar ouro! ⛏️",
    "Minerador de ouro! Bora garimpar com /mine! 🥇",
    "Miner life! Use /mine command! ⛏️"
  ],
  daily: [
    "Pegou suas moedas hoje? /daily tá te esperando! 🪙",
    "Todo dia tem moeda grátis no /daily, parceiro! 💰",
    "Passa no caixa com /daily todo dia! 🎁",
    "Daily reward waiting! Use /daily cowboy! 🪙"
  ],
  diario: [
    "Bônus diário! Cola no /daily parceiro! 🎁",
    "Todo santo dia tem moeda de graça no /daily! 💰"
  ],
  sheriff: [
    "Sou o xerife por aqui, e tô de olho em vocês! 🤠",
    "O xerife não dorme! Tô vigiando tudo! 👮",
    "Sheriff in town! Better behave, outlaws! 🤠",
    "Respeita o xerife, cowboy! 👮",
    "This town ain't big enough for troublemakers! 🔫"
  ],
  xerife: [
    "Respeita o xerife, rapaz! 🤠",
    "O xerife tá de olho em vocês, bandidos! 👮",
    "Sou o sheriff mais rápido do oeste! 🔫"
  ],
  rob: [
    "Roubar o banco? /bankrob com um parceiro! 🏦",
    "Bank robbery? Get a partner and use /bankrob! 💰",
    "Assalto é perigoso, mas /bankrob paga bem! 💵"
  ],
  rico: [
    "Quer ficar rico? Minera ouro e rouba banco! 💰",
    "Rico no oeste? Usa /mine e /bankrob! 🤑",
    "Riqueza vem pra quem tem coragem! 💵"
  ],
  rich: [
    "Wanna get rich? Mine gold with /mine! 🥇",
    "Get rich or die trying, partner! 💰"
  ],
  parceiro: [
    "Parceiro de verdade ajuda no /bankrob! 🤝",
    "Bom ter parceiros confiáveis no oeste! 🤠",
    "Partner up for /bankrob! 👥"
  ],
  partner: [
    "Howdy partner! Ready for some action? 🤠",
    "Good partners make good robberies! /bankrob! 🏦",
    "Partner! Let's mine some gold! /mine ⛏️"
  ],
  moeda: [
    "Moedas de prata? /daily todo dia, parceiro! 🪙",
    "Precisa de moedas? Vai no /daily! 💰"
  ],
  coin: [
    "Need coins? /daily every day partner! 🪙",
    "Silver coins waiting at /daily! 💰"
  ],
  dinheiro: [
    "Dinheiro fácil não existe, mas /daily ajuda! 💵",
    "Quer grana? Minera, rouba, aposta! Use os comandos! 💰"
  ],
  money: [
    "Money talks in the west! Use /daily! 💰",
    "Easy money? Try /mine or /bankrob! 💵"
  ],
  help: [
    "Precisa de ajuda? Usa /help que eu te mostro tudo! 📋",
    "Perdido, cowboy? /help tá aí pra isso! 🤠",
    "Need help partner? Use /help command! 📋"
  ],
  ajuda: [
    "Quer ajuda? /help mostra todos os comandos! 📋",
    "Tá perdido? Cola no /help! 🤠"
  ],
  dice: [
    "Aposta nos dados? /dice pra duelar! 🎲",
    "Jogo de dados no /dice, cowboy! 🎲",
    "Dice duel? Use /dice partner! 🎲"
  ],
  dados: [
    "Dados? Chama pro duelo com /dice! 🎲",
    "Aposta nos dados com /dice! 🎲"
  ],
  poker: [
    "Poker contra o dealer? /poker tá aí! ♠️",
    "Mesa de poker aberta! /poker! ♥️",
    "Poker time! Use /poker cowboy! ♣️"
  ],
  casino: [
    "Cassino tá bombando! Usa /casino! 🎰",
    "Slot machine no /casino! 🎰",
    "Casino luck? Try /casino! 🎰"
  ],
  slot: [
    "Caça-níqueis? /casino parceiro! 🎰",
    "Slot machine no /casino! 🎰"
  ]
};

const lastResponse = new Map();
const COOLDOWN = 10000; // 10 segundos entre respostas por canal

// Função para detectar se uma imagem/GIF tem tema Western
function detectWesternImage(attachment) {
  const url = attachment.url.toLowerCase();
  const filename = attachment.name?.toLowerCase() || '';
  const proxyUrl = attachment.proxyURL?.toLowerCase() || '';
  
  // Combinar URL, filename e proxyURL para análise
  const fullText = `${url} ${filename} ${proxyUrl}`;
  
  // Verificar se contém alguma keyword Western
  for (const keyword of westernImageKeywords) {
    if (fullText.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    
    // Cooldown por canal para evitar spam
    const channelId = message.channel.id;
    const now = Date.now();
    const lastTime = lastResponse.get(channelId);
    
    if (lastTime && (now - lastTime) < COOLDOWN) {
      return; // Ainda em cooldown
    }

    try {
      // PRIORITY 1: Detectar imagens/GIFs com tema Western
      if (message.attachments.size > 0) {
        for (const [, attachment] of message.attachments) {
          // Verificar se é imagem ou GIF
          const isImage = attachment.contentType?.startsWith('image/') || 
                         attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
          
          if (isImage && detectWesternImage(attachment)) {
            const chance = 0.35; // 35% de chance para imagens (mais alta que texto)
            
            if (Math.random() < chance) {
              const randomResponse = imageResponses[Math.floor(Math.random() * imageResponses.length)];
              
              setTimeout(() => {
                message.reply(randomResponse).catch(err => {
                  console.error('Error sending image reply:', err);
                });
              }, 800);
              
              lastResponse.set(channelId, now);
              return; // Sai após responder à imagem
            }
          }
        }
      }

      // PRIORITY 2: Detectar keywords em texto (sistema original)
      const content = message.content.toLowerCase();

      for (const [keyword, phrases] of Object.entries(westernPhrases)) {
        if (content.includes(keyword)) {
          const chance = 0.18; // 18% de chance (otimizado para Discloud)
          
          if (Math.random() < chance) {
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            
            // Delay fixo de 800ms (otimizado para Discloud)
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
