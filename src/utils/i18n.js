const translations = {
  'pt-BR': {
    // Comandos gerais
    cooldown: 'Devagar, parceiro! Até os cavalos precisam descansar. Volta daqui a {time}! 🐴',
    error: 'Essa não, parceiro! Meu cavalo tropeçou e derrubou tudo... 🤠',
    inventory_full: 'Peraí, cowboy! Tá carregando o rancho inteiro nas costas? Libera espaço aí! 🎒',
    
    // /daily
    daily_claimed: 'Opa, cowboy ganancioso! Já passou por aqui hoje. Volte daqui a {time} que tem mais! 💰',
    daily_success: 'Olha só quem chegou no saloon! Aqui está suas {amount} Moedas de Prata, parceiro! 🍻',
    daily_title: '🎁 BAÚ DIÁRIO DO VELHO OESTE',
    daily_description: 'Volte amanhã que o xerife deixa mais moedas no cofre! 🤠',
    daily_footer: 'Não gasta tudo com whisky, viu parceiro? 🥃',
    daily_cooldown_title: '⏰ O GALO AINDA NÃO CANTOU!',
    daily_cooldown_desc: 'Calma lá, cowboy! Já passou aqui hoje pegando suas moedas!\n\n**Volta quando o sol nascer de novo:** {time}',
    daily_cooldown_footer: 'Vai descansar um pouco, até o xerife dorme! 😴',
    
    // /mine
    mine_cooldown: 'Você está cansado demais para minerar! Volte em: **{time}**',
    mine_title: 'MINERAÇÃO DE OURO',
    mine_choose: 'Escolha seu método de mineração:',
    mine_solo: 'Mineração Solo',
    mine_solo_desc: 'Duração: 50 minutos\nRecompensa: 1-3 Barras de Ouro\nRisco: Baixo',
    mine_coop: 'Mineração Cooperativa',
    mine_coop_desc: 'Duração: 2 horas\nRecompensa: 4-6 Barras de Ouro (divididas)\nRisco: Alto',
    mine_gold_value: '1 Barra de Ouro = {value} Moedas de Prata',
    mine_progress: 'Minerando ouro...',
    mine_success: 'Você minerou {amount} Barra(s) de Ouro!',
    mine_value: 'Valor',
    mine_next: 'Próxima Mineração',
    mine_good_work: 'Bom trabalho, parceiro!',
    
    // /bankrob
    bankrob_cooldown: 'O xerife está vigiando você! Espere {time} antes de tentar outro assalto.',
    bankrob_active: 'Você já tem um assalto ativo! Espere terminar ou expirar.',
    bankrob_title: 'ASSALTO AO BANCO!',
    bankrob_description: '**{user}** está planejando um assalto ao banco!\n\nEste é um trabalho perigoso, parceiro. Precisamos de mais um fora-da-lei!\n\n⏰ Você tem **60 segundos** para encontrar um parceiro!',
    bankrob_reward: 'Recompensa Potencial',
    bankrob_duration: 'Duração',
    bankrob_partners: 'Parceiros Necessários',
    bankrob_join_button: 'Participar do Assalto',
    bankrob_click: 'Clique no botão para participar!',
    bankrob_cant_join_self: 'Você não pode participar do seu próprio assalto!',
    bankrob_started: 'ASSALTO AO BANCO INICIADO!',
    bankrob_in_progress: '**{user1}** e **{user2}** estão assaltando o banco!\n\n**Progresso:**\n`{bar}` {percent}%\n\n⏰ Tempo restante: **{time}**\n\n🤫 Fique quieto e não chame atenção!',
    bankrob_sheriff_patrol: 'O xerife pode estar patrulhando...',
    bankrob_success_title: 'ASSALTO BEM-SUCEDIDO!',
    bankrob_success_desc: '**{user1}** e **{user2}** assaltaram o banco com sucesso!\n\nVocês conseguiram escapar com o dinheiro!',
    bankrob_failed_title: 'ASSALTO FALHOU!',
    bankrob_failed_desc: '**{user1}** e **{user2}** foram pegos pelo xerife!\n\nVocês mal escaparam com vida! Nenhuma Moeda de Prata foi roubada.',
    bankrob_cancelled: 'Nenhum parceiro se juntou ao assalto. O plano foi abandonado.',
    
    // /dice
    dice_title: 'JOGO DE DADOS',
    dice_rolling: 'Rolando os dados...',
    dice_result: 'Resultado',
    dice_you_rolled: 'Você tirou',
    dice_win: 'VOCÊ GANHOU!',
    dice_lose: 'VOCÊ PERDEU!',
    dice_won_amount: 'Ganhou {amount} Moedas de Prata!',
    dice_lost_amount: 'Perdeu {amount} Moedas de Prata!',
    
    // /saloon
    saloon_insufficient_title: '🎫 TOKENS INSUFICIENTES!',
    saloon_insufficient_desc: 'Calma lá, parceiro! Você tentou trocar **{requested}** Tokens, mas só tem **{current}** no bolso!',
    saloon_insufficient_footer: 'Compre mais Tokens na loja ou use o /daily para ganhar moedas!',
    saloon_inventory_full: 'Ops! Seu inventário não aguenta mais **{weight}kg** de moedas! Libera espaço primeiro, parceiro!',
    saloon_success_title: '🎫 TROCA NO SALOON REALIZADA!',
    saloon_success_desc: 'Beleza, cowboy! Trocou **{tokens}** Tokens por **{coins}** Moedas de Prata no balcão do saloon! 💰',
    saloon_exchanged: 'Você Trocou',
    saloon_received: 'Você Recebeu',
    saloon_token_balance: 'Saldo de Tokens',
    saloon_coin_balance: 'Saldo de Moedas',
    saloon_total_weight: 'Peso Total',
    saloon_footer: 'Taxa de câmbio: 1 Token = {rate} Moedas | Beba com moderação! 🥃',
    
    // /middleman
    middleman_welcome: 'Bem-vindo ao **Black Market**, parceiro! Aqui você pode trocar suas moedas sem fazer perguntas. Escolha uma opção abaixo:',
    middleman_your_balance: 'Seu Saldo',
    middleman_rates: 'Taxas de Câmbio',
    middleman_sell_tokens: 'Vender Tokens',
    middleman_buy_tokens: 'Comprar Tokens',
    middleman_exchange_gold: 'Trocar Ouro',
    middleman_footer: 'Negócios discretos, resultados garantidos! 🎩',
    middleman_btn_sell_tokens: 'Vender Tokens',
    middleman_btn_buy_tokens: 'Comprar Tokens',
    middleman_btn_exchange_gold: 'Trocar Ouro',
    middleman_btn_shop: 'Visitar Loja',
    middleman_no_tokens: '❌ Você não tem Tokens para vender!',
    middleman_no_coins: '❌ Você precisa de pelo menos **{amount}** Moedas para comprar Tokens!',
    middleman_no_gold: '❌ Você não tem Barras de Ouro para trocar!',
    middleman_sell_how_many: '💰 **Quantos Tokens você quer vender?**\nEscolha uma opção:',
    middleman_buy_how_many: '💰 **Quantos Tokens você quer comprar?**\nEscolha uma opção:',
    middleman_gold_how_many: '🥇 **Quantas Barras de Ouro você quer trocar?**\nEscolha uma opção:',
    middleman_all: 'Tudo',
    middleman_cancel: 'Cancelar',
    middleman_cancelled: '❌ Transação cancelada.',
    middleman_insufficient_tokens: '❌ Você não tem Tokens suficientes!',
    middleman_insufficient_coins: '❌ Você não tem Moedas suficientes!',
    middleman_insufficient_gold: '❌ Você não tem Barras de Ouro suficientes!',
    middleman_inventory_full_tokens: 'Ops! Seu inventário não aguenta mais **{weight}kg** de tokens! Libera espaço primeiro!',
    middleman_transaction_complete: 'TRANSAÇÃO COMPLETA',
    middleman_sold_tokens: 'Você vendeu **{tokens}** Tokens e recebeu **{coins}** Moedas de Prata! 💰',
    middleman_bought_tokens: 'Você gastou **{coins}** Moedas e comprou **{tokens}** Tokens! 🎫',
    middleman_exchanged_gold: 'Você trocou **{gold}** Barra(s) de Ouro por **{coins}** Moedas de Prata! 🥇',
    middleman_gold_balance: 'Saldo de Ouro',
    
    // /inventory
    inventory_title: '🎒 Alforje de {username}',
    inventory_desc: 'Inventário e itens carregados',
    inventory_currency: '💰 Moedas',
    inventory_items: '🧳 Itens Carregados',
    inventory_no_items: '📦 Nenhum outro item',
    inventory_weight: '⚖️ Peso do Alforje',
    inventory_items_count: '📊 Itens Carregados',
    inventory_different_items: '💼 Itens Diferentes',
    inventory_nearly_full: '⚠️ Alforje quase cheio, parceiro!',
    inventory_use_give: '💡 Use /give para compartilhar itens',
    inventory_full_warning: '🚫 AVISO',
    inventory_full_msg: '- ALFORJE CHEIO!\n- Seu cavalo não aguenta mais peso!',
    inventory_private: '🔒 Inventários são privados! Você só pode ver o seu próprio.',
    
    // /help
    help_title: 'Comandos Disponíveis no Velho Oeste',
    help_desc: 'Aqui estão todos os comandos disponíveis na fronteira, parceiro!',
    
    // /ping
    ping_pong: '🏓 Pong!',
    ping_latency: 'Latência',
    
    // Geral
    silver_coins: 'Moedas de Prata',
    gold_bars: 'Barras de Ouro',
    weight: 'Peso',
    time_minutes: '{min} minutos',
    time_hours: '{hours}h {min}m',
  },
  
  'en-US': {
    // General commands
    cooldown: 'Whoa there, cowpoke! Even the fastest guns need a break. Come back in {time}! 🐴',
    error: 'Well butter my biscuit! My horse done kicked the bucket... 🤠',
    inventory_full: 'Hold up, partner! You carrying the whole ranch on your back? Lighten that load! 🎒',
    
    // /daily
    daily_claimed: 'Easy there, greedy gunslinger! Already got your gold today. Mosey back in {time}! 💰',
    daily_success: 'Well I\'ll be! Look who rode into the saloon! Here\'s your {amount} Silver Coins, partner! 🍻',
    daily_title: '🎁 WILD WEST DAILY TREASURE',
    daily_description: 'Ride back tomorrow when the sheriff refills the vault! 🤠',
    daily_footer: 'Don\'t spend it all on whisky now, ya hear? 🥃',
    daily_cooldown_title: '⏰ THE ROOSTER AIN\'T CROWED YET!',
    daily_cooldown_desc: 'Simmer down, cowboy! You done grabbed your coins already!\n\n**Come back when the sun rises again:** {time}',
    daily_cooldown_footer: 'Go rest your spurs, even outlaws need sleep! 😴',
    
    // /mine
    mine_cooldown: 'You\'re too tired to mine! Come back in: **{time}**',
    mine_title: 'GOLD MINING',
    mine_choose: 'Choose your mining method:',
    mine_solo: 'Solo Mining',
    mine_solo_desc: 'Duration: 50 minutes\nReward: 1-3 Gold Bars\nRisk: Low',
    mine_coop: 'Cooperative Mining',
    mine_coop_desc: 'Duration: 2 hours\nReward: 4-6 Gold Bars (split)\nRisk: High',
    mine_gold_value: '1 Gold Bar = {value} Silver Coins',
    mine_progress: 'Mining for gold...',
    mine_success: 'You mined {amount} Gold Bar(s)!',
    mine_value: 'Value',
    mine_next: 'Next Mining',
    mine_good_work: 'Good work, partner!',
    
    // /bankrob
    bankrob_cooldown: 'The sheriff\'s watching you! Wait {time} before attempting another robbery.',
    bankrob_active: 'You already have an active robbery! Wait for it to finish or expire.',
    bankrob_title: 'BANK ROBBERY!',
    bankrob_description: '**{user}** is planning a bank robbery!\n\nThis is a dangerous job, partner. We need one more outlaw!\n\n⏰ You have **60 seconds** to find a partner!',
    bankrob_reward: 'Potential Reward',
    bankrob_duration: 'Duration',
    bankrob_partners: 'Partners Needed',
    bankrob_join_button: 'Join the Robbery',
    bankrob_click: 'Click the button to join!',
    bankrob_cant_join_self: 'You can\'t join your own robbery!',
    bankrob_started: 'BANK ROBBERY STARTED!',
    bankrob_in_progress: '**{user1}** and **{user2}** are robbing the bank!\n\n**Progress:**\n`{bar}` {percent}%\n\n⏰ Time remaining: **{time}**\n\n🤫 Keep quiet and don\'t attract attention!',
    bankrob_sheriff_patrol: 'The sheriff might be on patrol...',
    bankrob_success_title: 'ROBBERY SUCCESSFUL!',
    bankrob_success_desc: '**{user1}** and **{user2}** successfully robbed the bank!\n\nYou managed to escape with the loot!',
    bankrob_failed_title: 'ROBBERY FAILED!',
    bankrob_failed_desc: '**{user1}** and **{user2}** were caught by the sheriff!\n\nYou barely escaped with your lives! No Silver Coins were stolen.',
    bankrob_cancelled: 'No partner joined the robbery. The plan was abandoned.',
    
    // /dice
    dice_title: 'DICE GAME',
    dice_rolling: 'Rolling the dice...',
    dice_result: 'Result',
    dice_you_rolled: 'You rolled',
    dice_win: 'YOU WON!',
    dice_lose: 'YOU LOST!',
    dice_won_amount: 'Won {amount} Silver Coins!',
    dice_lost_amount: 'Lost {amount} Silver Coins!',
    
    // /saloon
    saloon_insufficient_title: '🎫 INSUFFICIENT TOKENS!',
    saloon_insufficient_desc: 'Hold up, partner! You tried to exchange **{requested}** Tokens, but you only have **{current}** in your pocket!',
    saloon_insufficient_footer: 'Buy more Tokens at the shop or use /daily to earn coins!',
    saloon_inventory_full: 'Whoa! Your inventory can\'t handle another **{weight}kg** of coins! Clear some space first, partner!',
    saloon_success_title: '🎫 SALOON EXCHANGE COMPLETED!',
    saloon_success_desc: 'Well done, cowboy! You exchanged **{tokens}** Tokens for **{coins}** Silver Coins at the saloon counter! 💰',
    saloon_exchanged: 'You Exchanged',
    saloon_received: 'You Received',
    saloon_token_balance: 'Token Balance',
    saloon_coin_balance: 'Coin Balance',
    saloon_total_weight: 'Total Weight',
    saloon_footer: 'Exchange rate: 1 Token = {rate} Coins | Drink responsibly! 🥃',
    
    // /middleman
    middleman_welcome: 'Welcome to the **Black Market**, partner! Here you can trade your currencies, no questions asked. Choose an option below:',
    middleman_your_balance: 'Your Balance',
    middleman_rates: 'Exchange Rates',
    middleman_sell_tokens: 'Sell Tokens',
    middleman_buy_tokens: 'Buy Tokens',
    middleman_exchange_gold: 'Exchange Gold',
    middleman_footer: 'Discreet deals, guaranteed results! 🎩',
    middleman_btn_sell_tokens: 'Sell Tokens',
    middleman_btn_buy_tokens: 'Buy Tokens',
    middleman_btn_exchange_gold: 'Exchange Gold',
    middleman_btn_shop: 'Visit Shop',
    middleman_no_tokens: '❌ You don\'t have any Tokens to sell!',
    middleman_no_coins: '❌ You need at least **{amount}** Coins to buy Tokens!',
    middleman_no_gold: '❌ You don\'t have any Gold Bars to exchange!',
    middleman_sell_how_many: '💰 **How many Tokens do you want to sell?**\nChoose an option:',
    middleman_buy_how_many: '💰 **How many Tokens do you want to buy?**\nChoose an option:',
    middleman_gold_how_many: '🥇 **How many Gold Bars do you want to exchange?**\nChoose an option:',
    middleman_all: 'All',
    middleman_cancel: 'Cancel',
    middleman_cancelled: '❌ Transaction cancelled.',
    middleman_insufficient_tokens: '❌ You don\'t have enough Tokens!',
    middleman_insufficient_coins: '❌ You don\'t have enough Coins!',
    middleman_insufficient_gold: '❌ You don\'t have enough Gold Bars!',
    middleman_inventory_full_tokens: 'Whoa! Your inventory can\'t handle another **{weight}kg** of tokens! Clear some space first!',
    middleman_transaction_complete: 'TRANSACTION COMPLETE',
    middleman_sold_tokens: 'You sold **{tokens}** Tokens and received **{coins}** Silver Coins! 💰',
    middleman_bought_tokens: 'You spent **{coins}** Coins and bought **{tokens}** Tokens! 🎫',
    middleman_exchanged_gold: 'You exchanged **{gold}** Gold Bar(s) for **{coins}** Silver Coins! 🥇',
    middleman_gold_balance: 'Gold Balance',
    
    // /inventory
    inventory_title: '🎒 {username}\'s Saddlebag',
    inventory_desc: 'Inventory and items carried',
    inventory_currency: '💰 Currency',
    inventory_items: '🧳 Items Carried',
    inventory_no_items: '📦 No other items',
    inventory_weight: '⚖️ Saddlebag Weight',
    inventory_items_count: '📊 Items Carried',
    inventory_different_items: '💼 Different Items',
    inventory_nearly_full: '⚠️ Saddlebag nearly full, partner!',
    inventory_use_give: '💡 Use /give to share items with others',
    inventory_full_warning: '🚫 WARNING',
    inventory_full_msg: '- SADDLEBAG FULL!\n- Your horse can\'t carry any more weight!',
    inventory_private: '🔒 Inventories are private! You can only view your own inventory.',
    
    // /help
    help_title: 'Available Commands in the Wild West',
    help_desc: 'Here are all the commands available in the frontier, partner!',
    
    // /ping
    ping_pong: '🏓 Pong!',
    ping_latency: 'Latency',
    
    // General
    silver_coins: 'Silver Coins',
    gold_bars: 'Gold Bars',
    weight: 'Weight',
    time_minutes: '{min} minutes',
    time_hours: '{hours}h {min}m',
  },
  
  'es-ES': {
    // Comandos generales
    cooldown: '¡Tranquilo, vaquero! Hasta los caballos necesitan siesta. ¡Vuelve en {time}! 🐴',
    error: '¡Caramba, compadre! Mi caballo tropezó y tiró todo... 🤠',
    inventory_full: '¡Oye vaquero! ¿Llevas el rancho entero en la espalda? ¡Libera espacio! 🎒',
    
    // /daily
    daily_claimed: '¡Ey, pistolero codicioso! Ya pasaste hoy. Vuelve en {time} que habrá más! 💰',
    daily_success: '¡Mira quién llegó al saloon! ¡Aquí tienes tus {amount} Monedas de Plata, compadre! 🍻',
    daily_title: '🎁 COFRE DIARIO DEL VIEJO OESTE',
    daily_description: '¡Vuelve mañana que el sheriff deja más monedas! 🤠',
    daily_footer: '¡No lo gastes todo en tequila, eh compadre! 🥃',
    daily_cooldown_title: '⏰ ¡EL GALLO NO HA CANTADO AÚN!',
    daily_cooldown_desc: '¡Calma vaquero! Ya agarraste tus monedas hoy!\n\n**Vuelve cuando salga el sol otra vez:** {time}',
    daily_cooldown_footer: '¡Ve a descansar, hasta los forajidos duermen! 😴',
    
    // /mine
    mine_cooldown: '¡Estás muy cansado para minar! Vuelve en: **{time}**',
    mine_title: 'MINERÍA DE ORO',
    mine_choose: 'Elige tu método de minería:',
    mine_solo: 'Minería Solo',
    mine_solo_desc: 'Duración: 50 minutos\nRecompensa: 1-3 Barras de Oro\nRiesgo: Bajo',
    mine_coop: 'Minería Cooperativa',
    mine_coop_desc: 'Duración: 2 horas\nRecompensa: 4-6 Barras de Oro (divididas)\nRiesgo: Alto',
    mine_gold_value: '1 Barra de Oro = {value} Monedas de Plata',
    mine_progress: 'Minando oro...',
    mine_success: '¡Minaste {amount} Barra(s) de Oro!',
    mine_value: 'Valor',
    mine_next: 'Próxima Minería',
    mine_good_work: '¡Buen trabajo, compadre!',
    
    // /bankrob
    bankrob_cooldown: '¡El sheriff te está vigilando! Espera {time} antes de intentar otro robo.',
    bankrob_active: '¡Ya tienes un robo activo! Espera a que termine o expire.',
    bankrob_title: '¡ROBO AL BANCO!',
    bankrob_description: '¡**{user}** está planeando un robo al banco!\n\nEste es un trabajo peligroso, compadre. ¡Necesitamos un forajido más!\n\n⏰ ¡Tienes **60 segundos** para encontrar un compañero!',
    bankrob_reward: 'Recompensa Potencial',
    bankrob_duration: 'Duración',
    bankrob_partners: 'Compañeros Necesarios',
    bankrob_join_button: 'Unirse al Robo',
    bankrob_click: '¡Haz clic en el botón para unirte!',
    bankrob_cant_join_self: '¡No puedes unirte a tu propio robo!',
    bankrob_started: '¡ROBO AL BANCO INICIADO!',
    bankrob_in_progress: '¡**{user1}** y **{user2}** están robando el banco!\n\n**Progreso:**\n`{bar}` {percent}%\n\n⏰ Tiempo restante: **{time}**\n\n🤫 ¡Mantén la calma y no llames la atención!',
    bankrob_sheriff_patrol: 'El sheriff podría estar patrullando...',
    bankrob_success_title: '¡ROBO EXITOSO!',
    bankrob_success_desc: '¡**{user1}** y **{user2}** robaron el banco exitosamente!\n\n¡Lograron escapar con el botín!',
    bankrob_failed_title: '¡ROBO FALLIDO!',
    bankrob_failed_desc: '¡**{user1}** y **{user2}** fueron capturados por el sheriff!\n\n¡Apenas escaparon con vida! No se robaron Monedas de Plata.',
    bankrob_cancelled: 'Ningún compañero se unió al robo. El plan fue abandonado.',
    
    // /dice
    dice_title: 'JUEGO DE DADOS',
    dice_rolling: 'Lanzando los dados...',
    dice_result: 'Resultado',
    dice_you_rolled: 'Sacaste',
    dice_win: '¡GANASTE!',
    dice_lose: '¡PERDISTE!',
    dice_won_amount: '¡Ganaste {amount} Monedas de Plata!',
    dice_lost_amount: '¡Perdiste {amount} Monedas de Plata!',
    
    // /saloon
    saloon_insufficient_title: '🎫 ¡TOKENS INSUFICIENTES!',
    saloon_insufficient_desc: '¡Espera, compadre! Intentaste cambiar **{requested}** Tokens, ¡pero solo tienes **{current}** en el bolsillo!',
    saloon_insufficient_footer: '¡Compra más Tokens en la tienda o usa /daily para ganar monedas!',
    saloon_inventory_full: '¡Ey! ¡Tu inventario no aguanta otros **{weight}kg** de monedas! ¡Libera espacio primero, compadre!',
    saloon_success_title: '🎫 ¡CAMBIO EN EL SALOON COMPLETADO!',
    saloon_success_desc: '¡Muy bien, vaquero! ¡Cambiaste **{tokens}** Tokens por **{coins}** Monedas de Plata en el mostrador del saloon! 💰',
    saloon_exchanged: 'Cambiaste',
    saloon_received: 'Recibiste',
    saloon_token_balance: 'Saldo de Tokens',
    saloon_coin_balance: 'Saldo de Monedas',
    saloon_total_weight: 'Peso Total',
    saloon_footer: 'Tasa de cambio: 1 Token = {rate} Monedas | ¡Bebe con moderación! 🥃',
    
    // /middleman
    middleman_welcome: '¡Bienvenido al **Black Market**, compadre! Aquí puedes intercambiar tus monedas sin hacer preguntas. Elige una opción:',
    middleman_your_balance: 'Tu Saldo',
    middleman_rates: 'Tasas de Cambio',
    middleman_sell_tokens: 'Vender Tokens',
    middleman_buy_tokens: 'Comprar Tokens',
    middleman_exchange_gold: 'Cambiar Oro',
    middleman_footer: '¡Negocios discretos, resultados garantizados! 🎩',
    middleman_btn_sell_tokens: 'Vender Tokens',
    middleman_btn_buy_tokens: 'Comprar Tokens',
    middleman_btn_exchange_gold: 'Cambiar Oro',
    middleman_btn_shop: 'Visitar Tienda',
    middleman_no_tokens: '❌ ¡No tienes Tokens para vender!',
    middleman_no_coins: '❌ ¡Necesitas al menos **{amount}** Monedas para comprar Tokens!',
    middleman_no_gold: '❌ ¡No tienes Barras de Oro para cambiar!',
    middleman_sell_how_many: '💰 **¿Cuántos Tokens quieres vender?**\nElige una opción:',
    middleman_buy_how_many: '💰 **¿Cuántos Tokens quieres comprar?**\nElige una opción:',
    middleman_gold_how_many: '🥇 **¿Cuántas Barras de Oro quieres cambiar?**\nElige una opción:',
    middleman_all: 'Todo',
    middleman_cancel: 'Cancelar',
    middleman_cancelled: '❌ Transacción cancelada.',
    middleman_insufficient_tokens: '❌ ¡No tienes suficientes Tokens!',
    middleman_insufficient_coins: '❌ ¡No tienes suficientes Monedas!',
    middleman_insufficient_gold: '❌ ¡No tienes suficientes Barras de Oro!',
    middleman_inventory_full_tokens: '¡Ey! ¡Tu inventario no aguanta otros **{weight}kg** de tokens! ¡Libera espacio primero!',
    middleman_transaction_complete: 'TRANSACCIÓN COMPLETA',
    middleman_sold_tokens: '¡Vendiste **{tokens}** Tokens y recibiste **{coins}** Monedas de Plata! 💰',
    middleman_bought_tokens: '¡Gastaste **{coins}** Monedas y compraste **{tokens}** Tokens! 🎫',
    middleman_exchanged_gold: '¡Cambiaste **{gold}** Barra(s) de Oro por **{coins}** Monedas de Plata! 🥇',
    middleman_gold_balance: 'Saldo de Oro',
    
    // /inventory
    inventory_title: '🎒 Alforja de {username}',
    inventory_desc: 'Inventario y artículos cargados',
    inventory_currency: '💰 Monedas',
    inventory_items: '🧳 Artículos Cargados',
    inventory_no_items: '📦 Ningún otro artículo',
    inventory_weight: '⚖️ Peso de la Alforja',
    inventory_items_count: '📊 Artículos Cargados',
    inventory_different_items: '💼 Artículos Diferentes',
    inventory_nearly_full: '⚠️ ¡Alforja casi llena, compadre!',
    inventory_use_give: '💡 Usa /give para compartir artículos',
    inventory_full_warning: '🚫 ADVERTENCIA',
    inventory_full_msg: '- ¡ALFORJA LLENA!\n- ¡Tu caballo no puede cargar más peso!',
    inventory_private: '🔒 ¡Los inventarios son privados! Solo puedes ver el tuyo.',
    
    // /help
    help_title: 'Comandos Disponibles en el Viejo Oeste',
    help_desc: '¡Aquí están todos los comandos disponibles en la frontera, compadre!',
    
    // /ping
    ping_pong: '🏓 ¡Pong!',
    ping_latency: 'Latencia',
    
    // General
    silver_coins: 'Monedas de Plata',
    gold_bars: 'Barras de Oro',
    weight: 'Peso',
    time_minutes: '{min} minutos',
    time_hours: '{hours}h {min}m',
  }
};

function getLocale(interaction) {
  const locale = interaction.locale || 'en-US';
  
  if (locale.startsWith('pt')) return 'pt-BR';
  if (locale.startsWith('es')) return 'es-ES';
  
  return 'en-US';
}

function t(interaction, key, params = {}) {
  const locale = getLocale(interaction);
  let text = translations[locale][key] || translations['en-US'][key] || key;
  
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}

module.exports = { t, getLocale, translations };
