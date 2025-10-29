import { LocalizationMap } from 'discord.js';

export interface CommandLocalization {
  name: LocalizationMap;
  description: LocalizationMap;
}

export const commandLocalizations: Record<string, CommandLocalization> = {
  ping: {
    name: {
      'pt-BR': 'ping',
      'en-US': 'ping',
      'es-ES': 'ping',
      'fr': 'ping'
    },
    description: {
      'pt-BR': 'Verifica a latência do bot',
      'en-US': "Check the bot's latency",
      'es-ES': 'Verifica la latencia del bot',
      'fr': 'Vérifier la latence du bot'
    }
  },
  
  help: {
    name: {
      'pt-BR': 'ajuda',
      'en-US': 'help',
      'es-ES': 'ayuda',
      'fr': 'aide'
    },
    description: {
      'pt-BR': 'Mostra todos os comandos disponíveis',
      'en-US': 'Shows all available commands',
      'es-ES': 'Muestra todos los comandos disponibles',
      'fr': 'Affiche toutes les commandes disponibles'
    }
  },
  
  daily: {
    name: {
      'pt-BR': 'diaria',
      'en-US': 'daily',
      'es-ES': 'diaria',
      'fr': 'quotidien'
    },
    description: {
      'pt-BR': 'Reivindique sua recompensa diária e construa uma sequência!',
      'en-US': 'Claim your daily reward and build a streak!',
      'es-ES': '¡Reclama tu recompensa diaria y construye una racha!',
      'fr': 'Réclamez votre récompense quotidienne et créez une séquence!'
    }
  },
  
  profile: {
    name: {
      'pt-BR': 'perfil',
      'en-US': 'profile',
      'es-ES': 'perfil',
      'fr': 'profil'
    },
    description: {
      'pt-BR': 'Mostra o perfil de um usuário com cartão visual',
      'en-US': "Shows a user's profile with visual card",
      'es-ES': 'Muestra el perfil de un usuario con tarjeta visual',
      'fr': "Affiche le profil d'un utilisateur avec carte visuelle"
    }
  },
  
  inventory: {
    name: {
      'pt-BR': 'inventario',
      'en-US': 'inventory',
      'es-ES': 'inventario',
      'fr': 'inventaire'
    },
    description: {
      'pt-BR': 'Mostra seu inventário com itens, moedas e capacidade',
      'en-US': 'Shows your inventory with items, coins, and capacity',
      'es-ES': 'Muestra tu inventario con artículos, monedas y capacidad',
      'fr': 'Affiche votre inventaire avec objets, pièces et capacité'
    }
  },
  
  mine: {
    name: {
      'pt-BR': 'minerar',
      'en-US': 'mine',
      'es-ES': 'minar',
      'fr': 'miner'
    },
    description: {
      'pt-BR': 'Minere por ouro nas montanhas! Solo ou cooperativo',
      'en-US': 'Mine for gold in the mountains! Solo or cooperative',
      'es-ES': '¡Extrae oro en las montañas! Solo o cooperativo',
      'fr': "Extrayez de l'or dans les montagnes! Solo ou coopératif"
    }
  },
  
  give: {
    name: {
      'pt-BR': 'dar',
      'en-US': 'give',
      'es-ES': 'dar',
      'fr': 'donner'
    },
    description: {
      'pt-BR': 'Transfira itens ou moedas para outro usuário',
      'en-US': 'Transfer items or coins to another user',
      'es-ES': 'Transfiere artículos o monedas a otro usuario',
      'fr': 'Transférer des objets ou des pièces à un autre utilisateur'
    }
  },
  
  leaderboard: {
    name: {
      'pt-BR': 'classificacao',
      'en-US': 'leaderboard',
      'es-ES': 'clasificacion',
      'fr': 'classement'
    },
    description: {
      'pt-BR': 'Mostra os usuários mais ricos do servidor',
      'en-US': 'Shows the richest users in the server',
      'es-ES': 'Muestra los usuarios más ricos del servidor',
      'fr': 'Affiche les utilisateurs les plus riches du serveur'
    }
  },
  
  middleman: {
    name: {
      'pt-BR': 'intermediario',
      'en-US': 'middleman',
      'es-ES': 'intermediario',
      'fr': 'intermédiaire'
    },
    description: {
      'pt-BR': 'Troque Fichas Saloon ou Barras de Ouro por Moedas de Prata',
      'en-US': 'Exchange Saloon Tokens or Gold Bars for Silver Coins',
      'es-ES': 'Intercambia Fichas de Saloon o Barras de Oro por Monedas de Plata',
      'fr': "Échangez des jetons de saloon ou des lingots d'or contre des pièces d'argent"
    }
  },
  
  redeem: {
    name: {
      'pt-BR': 'resgatar',
      'en-US': 'redeem',
      'es-ES': 'canjear',
      'fr': 'echanger'
    },
    description: {
      'pt-BR': 'Resgate um código de compra da loja do site',
      'en-US': 'Redeem a purchase code from the website shop',
      'es-ES': 'Canjea un código de compra de la tienda del sitio web',
      'fr': 'Échangez un code d\'achat de la boutique du site web'
    }
  },
  
  territories: {
    name: {
      'pt-BR': 'territorios',
      'en-US': 'territories',
      'es-ES': 'territorios',
      'fr': 'territoires'
    },
    description: {
      'pt-BR': 'Compre territórios que geram renda automática',
      'en-US': 'Purchase territories that generate automatic income',
      'es-ES': 'Compra territorios que generan ingresos automáticos',
      'fr': 'Achetez des territoires qui génèrent des revenus automatiques'
    }
  },
  
  bankrob: {
    name: {
      'pt-BR': 'assaltar',
      'en-US': 'bankrob',
      'es-ES': 'asaltar',
      'fr': 'braquer'
    },
    description: {
      'pt-BR': 'Assalte o banco com um parceiro! 30% de chance de captura',
      'en-US': 'Rob the bank with a partner! 30% chance of capture',
      'es-ES': '¡Asalta el banco con un compañero! 30% de probabilidad de captura',
      'fr': 'Volez la banque avec un partenaire! 30% de chance de capture'
    }
  },
  
  dice: {
    name: {
      'pt-BR': 'dado',
      'en-US': 'dice',
      'es-ES': 'dado',
      'fr': 'dés'
    },
    description: {
      'pt-BR': 'Role os dados e aposte suas moedas!',
      'en-US': 'Roll the dice and bet your coins!',
      'es-ES': '¡Tira los dados y apuesta tus monedas!',
      'fr': 'Lancez les dés et pariez vos pièces!'
    }
  },
  
  duel: {
    name: {
      'pt-BR': 'duelo',
      'en-US': 'duel',
      'es-ES': 'duelo',
      'fr': 'duel'
    },
    description: {
      'pt-BR': 'Desafie outro jogador para um duelo de apostas',
      'en-US': 'Challenge another player to a betting duel',
      'es-ES': 'Desafía a otro jugador a un duelo de apuestas',
      'fr': "Défiez un autre joueur à un duel de paris"
    }
  },
  
  wanted: {
    name: {
      'pt-BR': 'procurado',
      'en-US': 'wanted',
      'es-ES': 'buscado',
      'fr': 'recherché'
    },
    description: {
      'pt-BR': 'Coloque uma recompensa em um usuário procurado',
      'en-US': 'Place a bounty on a wanted user',
      'es-ES': 'Coloca una recompensa en un usuario buscado',
      'fr': 'Placer une prime sur un utilisateur recherché'
    }
  },
  
  bounties: {
    name: {
      'pt-BR': 'recompensas',
      'en-US': 'bounties',
      'es-ES': 'recompensas',
      'fr': 'primes'
    },
    description: {
      'pt-BR': 'Veja todas as recompensas ativas no servidor',
      'en-US': 'View all active bounties in the server',
      'es-ES': 'Ver todas las recompensas activas en el servidor',
      'fr': 'Voir toutes les primes actives sur le serveur'
    }
  },
  
  capture: {
    name: {
      'pt-BR': 'capturar',
      'en-US': 'capture',
      'es-ES': 'capturar',
      'fr': 'capturer'
    },
    description: {
      'pt-BR': 'Capture um criminoso procurado e ganhe a recompensa',
      'en-US': 'Capture a wanted criminal and earn the bounty',
      'es-ES': 'Captura a un criminal buscado y gana la recompensa',
      'fr': 'Capturez un criminel recherché et gagnez la prime'
    }
  },
  
  clearbounty: {
    name: {
      'pt-BR': 'limparrecompensa',
      'en-US': 'clearbounty',
      'es-ES': 'limparrecompensa',
      'fr': 'effacerprime'
    },
    description: {
      'pt-BR': 'Remover uma recompensa (Apenas Admin)',
      'en-US': 'Remove a bounty (Admin only)',
      'es-ES': 'Eliminar una recompensa (Solo Admin)',
      'fr': 'Supprimer une prime (Admin uniquement)'
    }
  },
  
  avatar: {
    name: {
      'pt-BR': 'avatar',
      'en-US': 'avatar',
      'es-ES': 'avatar',
      'fr': 'avatar'
    },
    description: {
      'pt-BR': 'Mostra o avatar de um usuário',
      'en-US': "Shows a user's avatar",
      'es-ES': 'Muestra el avatar de un usuario',
      'fr': "Affiche l'avatar d'un utilisateur"
    }
  },
  
  music: {
    name: {
      'pt-BR': 'musica',
      'en-US': 'music',
      'es-ES': 'musica',
      'fr': 'musique'
    },
    description: {
      'pt-BR': '🎵 Sistema profissional de reprodução de música',
      'en-US': '🎵 Professional music player system',
      'es-ES': '🎵 Sistema profesional de reproducción de música',
      'fr': '🎵 Système de lecture musicale professionnelle'
    }
  },
  
  poll: {
    name: {
      'pt-BR': 'votacao',
      'en-US': 'poll',
      'es-ES': 'votacion',
      'fr': 'sondage'
    },
    description: {
      'pt-BR': 'Crie uma votação estilo Velho Oeste no saloon',
      'en-US': 'Create a western-style poll in the saloon',
      'es-ES': 'Crea una votación estilo Viejo Oeste en el saloon',
      'fr': 'Créez un sondage style Far West dans le saloon'
    }
  },
  
  quickpoll: {
    name: {
      'pt-BR': 'votacao-rapida',
      'en-US': 'quickpoll',
      'es-ES': 'votacion-rapida',
      'fr': 'sondage-rapide'
    },
    description: {
      'pt-BR': 'Crie uma votação rápida Sim/Não',
      'en-US': 'Create a quick Yes/No poll',
      'es-ES': 'Crea una votación rápida Sí/No',
      'fr': 'Créez un sondage rapide Oui/Non'
    }
  }
};

export function applyLocalizations(
  builder: any,
  commandName: string
): any {
  const localization = commandLocalizations[commandName];
  
  if (!localization) {
    console.warn(`⚠️ No localizations found for command: ${commandName}`);
    return builder;
  }
  
  return builder
    .setNameLocalizations(localization.name)
    .setDescriptionLocalizations(localization.description);
}
