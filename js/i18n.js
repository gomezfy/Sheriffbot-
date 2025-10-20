// Internationalization (i18n) System
const translations = {
    en: {
        // Navigation
        nav_features: "Features",
        nav_commands: "Commands",
        nav_shop: "🛒 Shop",
        nav_dashboard: "⚙️ Dashboard",
        nav_stats: "Stats",
        nav_about: "About",
        nav_add_bot: "Add Bot",
        
        // Hero Section
        hero_title: "SHERIFF BOT",
        hero_subtitle: "The best Discord bot with Wild West theme",
        hero_description: "Complete economy system, gold mining, gambling games, bounties, custom visual profiles and much more!",
        hero_btn_add: "Add to Discord",
        hero_btn_dashboard: "Control Panel",
        hero_btn_features: "View Features",
        hero_badge_commands: "26 Commands",
        hero_badge_emojis: "47 Emojis",
        hero_badge_languages: "3 Languages",
        scroll_down: "Scroll Down",
        
        // Features Section
        features_title: "✨ Main Features",
        features_subtitle: "Everything you need for a complete Western experience",
        
        feature_economy_title: "Economy System",
        feature_economy_desc: "Dual currency: Saloon Tokens (premium) and Silver Coins (standard)",
        feature_economy_1: "Weight-based inventory (100kg)",
        feature_economy_2: "Built-in anti-exploit",
        feature_economy_3: "Convertible Gold Bars",
        
        feature_mining_title: "Gold Mining",
        feature_mining_desc: "Mine solo or in pairs to get gold bars",
        feature_mining_1: "Solo: 1-3 bars (50min cooldown)",
        feature_mining_2: "Co-op: 4-6 bars (2h cooldown)",
        feature_mining_3: "Animated progress bars",
        
        feature_gambling_title: "Gambling Games",
        feature_gambling_desc: "4 different games to test your luck at the saloon",
        feature_gambling_1: "Casino (slot machine)",
        feature_gambling_2: "Poker vs dealer",
        feature_gambling_3: "Dice duels PvP",
        feature_gambling_4: "Bank robbery (3 min!)",
        
        feature_bounties_title: "Bounty System",
        feature_bounties_desc: "Place bounties on outlaws' heads",
        feature_bounties_1: "Wanted posters with Canvas",
        feature_bounties_2: "Authentic Western style",
        feature_bounties_3: "Claim system",
        
        feature_profiles_title: "Visual Profiles",
        feature_profiles_desc: "800x550px profile cards generated with Canvas",
        feature_profiles_1: "47 custom emojis",
        feature_profiles_2: "Custom backgrounds",
        feature_profiles_3: "XP and level system",
        
        feature_images_title: "Image Detection",
        feature_images_desc: "Bot automatically responds to Western images",
        feature_images_1: "30+ keywords detected",
        feature_images_2: "Tenor/Giphy GIFs",
        feature_images_3: "35% response chance",
        
        feature_welcome_title: "Custom Welcome",
        feature_welcome_desc: "Fully customizable JSON system",
        feature_welcome_1: "Full embeds",
        feature_welcome_2: "Dynamic placeholders",
        feature_welcome_3: "GIF banners supported",
        
        feature_logs_title: "Complete Logs",
        feature_logs_desc: "9 configurable log types per server",
        feature_logs_1: "Command, error, welcome",
        feature_logs_2: "Economy, bounty, mining",
        feature_logs_3: "Gambling, admin logs",
        
        feature_autoreply_title: "Western Auto-Reply",
        feature_autoreply_desc: "100+ themed phrases in 3 languages",
        feature_autoreply_1: "PT-BR, EN-US, ES-ES",
        feature_autoreply_2: "30+ keywords",
        feature_autoreply_3: "Anti-spam cooldown",
        
        // Commands Section
        commands_title: "📋 Available Commands",
        commands_subtitle: "26 slash commands organized by category",
        
        cmd_economy: "💰 Economy (4)",
        cmd_economy_daily: "Daily reward",
        cmd_economy_inventory: "View inventory",
        cmd_economy_give: "Give coins",
        cmd_economy_migrate: "Migrate data",
        
        cmd_mining: "⛏️ Mining (1)",
        cmd_mining_mine: "Mine gold",
        
        cmd_gambling: "🎰 Gambling (4)",
        cmd_gambling_casino: "Slot machine",
        cmd_gambling_poker: "Poker vs dealer",
        cmd_gambling_dice: "Dice duel",
        cmd_gambling_bankrob: "Rob bank",
        
        cmd_bounties: "🔫 Bounties (4)",
        cmd_bounties_wanted: "Create bounty",
        cmd_bounties_list: "View bounties",
        cmd_bounties_claim: "Claim bounty",
        cmd_bounties_clear: "Clear (admin)",
        
        cmd_profile: "👤 Profile (2)",
        cmd_profile_profile: "View visual profile",
        cmd_profile_avatar: "View avatar",
        
        cmd_config: "🎉 Configuration (2)",
        cmd_config_welcome: "Setup welcome",
        cmd_config_logs: "Setup logs",
        
        cmd_utilities: "🛠️ Utilities (4)",
        cmd_utilities_help: "View help",
        cmd_utilities_ping: "View latency",
        cmd_utilities_server: "Server info",
        cmd_utilities_language: "Test i18n",
        
        cmd_admin: "👮 Admin (5)",
        cmd_admin_addgold: "Add gold",
        cmd_admin_addsilver: "Add silver",
        cmd_admin_removegold: "Remove gold",
        cmd_admin_announcement: "Announcement",
        cmd_admin_setuptoken: "Setup tokens",
        
        // Stats Section
        stats_title: "📊 Statistics",
        stats_commands: "Commands",
        stats_emojis: "Emojis",
        stats_events: "Events",
        stats_languages: "Languages",
        stats_phrases: "Auto-Reply Phrases",
        stats_logs: "Log Types",
        
        // About Section
        about_title: "🤠 About Sheriff Bot",
        about_p1: "Sheriff Bot is a Discord bot with Wild West theme that offers a complete experience of economy, mining, games and much more!",
        about_p2: "Built with <strong>Discord.js v14</strong>, the bot uses <strong>Canvas</strong> to generate custom images (profile cards, wanted posters) and supports <strong>3 languages</strong> (PT-BR, EN-US, ES-ES).",
        about_tech: "🔧 Technologies:",
        about_highlights: "✨ Highlights:",
        about_h1: "✅ Dual currency system (Tokens + Coins)",
        about_h2: "✅ Weight-based anti-exploit inventory",
        about_h3: "✅ 47 custom emojis for profiles",
        about_h4: "✅ Automatic Western image detection",
        about_h5: "✅ Animated progress bars",
        about_h6: "✅ Complete JSON welcome system",
        about_h7: "✅ 9 configurable log types",
        
        // CTA Section
        cta_title: "Ready to start your Wild West journey?",
        cta_subtitle: "Add Sheriff Bot to your Discord server now!",
        cta_button: "Add to Discord",
        cta_note: "Free • No signup required • Ready to use",
        
        // Shop Section
        shop_title: "🛒 SPECIAL OFFERS",
        shop_subtitle: "Buy premium currency and boost your economy!",
        shop_starter_badge: "🌟 Starter",
        shop_popular_badge: "⭐ BEST SELLER",
        shop_best_value_badge: "⚡ Best Value",
        shop_ultimate_badge: "💎 ULTIMATE",
        shop_buy_now: "Buy Now",
        shop_save_60: "Save 60%!",
        shop_save_65: "Save 65%!",
        shop_save_70: "Save 70%!",
        shop_bonus_50: "🎁 +50 Bonus Tokens",
        shop_bonus_150: "🎁 +150 Bonus Tokens",
        shop_bonus_500: "🎁 +500 Bonus Tokens",
        shop_vip_badge: "🌟 VIP Badge",
        shop_exclusive_bg: "🎨 Exclusive Background",
        shop_inventory_upgrade: "📦 Inventory: 100kg → 500kg",
        shop_permanent_upgrade: "🔓 Permanent Upgrade",
        shop_instant_activation: "⚡ Instant Activation",
        shop_security: "💳 <strong>100% secure payment via Stripe</strong> • ⚡ Instant delivery • 🔒 PCI Compliant",
        shop_view_all: "View All Shop Details →",
        
        // Footer
        footer_brand: "🤠 SHERIFF BOT",
        footer_brand_desc: "Western-themed Discord Bot",
        footer_links: "Quick Links",
        footer_resources: "Resources",
        footer_commands_count: "26 Commands",
        footer_emojis_count: "47 Emojis",
        footer_languages_count: "3 Languages",
        footer_logs_count: "9 Log Types",
        footer_copyright: "&copy; 2025 Sheriff Bot. All rights reserved.",
        footer_made: "Made with ❤️ for the Discord community"
    },
    
    pt: {
        // Navigation
        nav_features: "Features",
        nav_commands: "Comandos",
        nav_shop: "🛒 Loja",
        nav_dashboard: "⚙️ Painel",
        nav_stats: "Stats",
        nav_about: "Sobre",
        nav_add_bot: "Adicionar Bot",
        
        // Hero Section
        hero_title: "SHERIFF BOT",
        hero_subtitle: "O melhor bot Discord com tema do Velho Oeste",
        hero_description: "Sistema de economia completo, mineração de ouro, jogos de azar, bounties, perfis visuais personalizados e muito mais!",
        hero_btn_add: "Adicionar ao Discord",
        hero_btn_dashboard: "Painel de Controle",
        hero_btn_features: "Ver Recursos",
        hero_badge_commands: "26 Comandos",
        hero_badge_emojis: "47 Emojis",
        hero_badge_languages: "3 Idiomas",
        scroll_down: "Scroll Down",
        
        // Features Section
        features_title: "✨ Recursos Principais",
        features_subtitle: "Tudo que você precisa para uma experiência Western completa",
        
        feature_economy_title: "Sistema de Economia",
        feature_economy_desc: "Moedas duplas: Saloon Tokens (premium) e Silver Coins (padrão)",
        feature_economy_1: "Inventário com peso (100kg)",
        feature_economy_2: "Anti-exploit integrado",
        feature_economy_3: "Gold Bars conversíveis",
        
        feature_mining_title: "Mineração de Ouro",
        feature_mining_desc: "Minere sozinho ou em dupla para conseguir gold bars",
        feature_mining_1: "Solo: 1-3 bars (50min cooldown)",
        feature_mining_2: "Coop: 4-6 bars (2h cooldown)",
        feature_mining_3: "Progress bars animadas",
        
        feature_gambling_title: "Jogos de Azar",
        feature_gambling_desc: "4 jogos diferentes para testar sua sorte no saloon",
        feature_gambling_1: "Casino (slot machine)",
        feature_gambling_2: "Poker vs dealer",
        feature_gambling_3: "Dice duels PvP",
        feature_gambling_4: "Bank robbery (3 min!)",
        
        feature_bounties_title: "Sistema de Bounties",
        feature_bounties_desc: "Coloque recompensas na cabeça dos outlaws",
        feature_bounties_1: "Wanted posters com Canvas",
        feature_bounties_2: "Estilo Western autêntico",
        feature_bounties_3: "Sistema de claims",
        
        feature_profiles_title: "Perfis Visuais",
        feature_profiles_desc: "Profile cards 800x550px gerados com Canvas",
        feature_profiles_1: "47 emojis customizados",
        feature_profiles_2: "Backgrounds personalizados",
        feature_profiles_3: "Sistema de XP e níveis",
        
        feature_images_title: "Detecção de Imagens",
        feature_images_desc: "Bot responde automaticamente a imagens Western",
        feature_images_1: "30+ keywords detectadas",
        feature_images_2: "GIFs do Tenor/Giphy",
        feature_images_3: "35% chance de resposta",
        
        feature_welcome_title: "Boas-Vindas Custom",
        feature_welcome_desc: "Sistema JSON totalmente customizável",
        feature_welcome_1: "Embeds completos",
        feature_welcome_2: "Placeholders dinâmicos",
        feature_welcome_3: "Banners GIF suportados",
        
        feature_logs_title: "Logs Completos",
        feature_logs_desc: "9 tipos de logs configuráveis por servidor",
        feature_logs_1: "Command, error, welcome",
        feature_logs_2: "Economy, bounty, mining",
        feature_logs_3: "Gambling, admin logs",
        
        feature_autoreply_title: "Auto-Reply Western",
        feature_autoreply_desc: "100+ frases temáticas em 3 idiomas",
        feature_autoreply_1: "PT-BR, EN-US, ES-ES",
        feature_autoreply_2: "30+ keywords",
        feature_autoreply_3: "Cooldown anti-spam",
        
        // Commands Section
        commands_title: "📋 Comandos Disponíveis",
        commands_subtitle: "26 comandos slash organizados por categoria",
        
        cmd_economy: "💰 Economia (4)",
        cmd_economy_daily: "Recompensa diária",
        cmd_economy_inventory: "Ver inventário",
        cmd_economy_give: "Dar moedas",
        cmd_economy_migrate: "Migrar dados",
        
        cmd_mining: "⛏️ Mineração (1)",
        cmd_mining_mine: "Minerar ouro",
        
        cmd_gambling: "🎰 Jogos (4)",
        cmd_gambling_casino: "Slot machine",
        cmd_gambling_poker: "Poker vs dealer",
        cmd_gambling_dice: "Duelo de dados",
        cmd_gambling_bankrob: "Assaltar banco",
        
        cmd_bounties: "🔫 Bounties (4)",
        cmd_bounties_wanted: "Criar recompensa",
        cmd_bounties_list: "Ver recompensas",
        cmd_bounties_claim: "Coletar bounty",
        cmd_bounties_clear: "Limpar (admin)",
        
        cmd_profile: "👤 Perfil (2)",
        cmd_profile_profile: "Ver perfil visual",
        cmd_profile_avatar: "Ver avatar",
        
        cmd_config: "🎉 Configuração (2)",
        cmd_config_welcome: "Config boas-vindas",
        cmd_config_logs: "Config logs",
        
        cmd_utilities: "🛠️ Utilidades (4)",
        cmd_utilities_help: "Ver ajuda",
        cmd_utilities_ping: "Ver latência",
        cmd_utilities_server: "Info do servidor",
        cmd_utilities_language: "Testar i18n",
        
        cmd_admin: "👮 Admin (5)",
        cmd_admin_addgold: "Adicionar gold",
        cmd_admin_addsilver: "Adicionar silver",
        cmd_admin_removegold: "Remover gold",
        cmd_admin_announcement: "Anúncio",
        cmd_admin_setuptoken: "Config tokens",
        
        // Stats Section
        stats_title: "📊 Estatísticas",
        stats_commands: "Comandos",
        stats_emojis: "Emojis",
        stats_events: "Eventos",
        stats_languages: "Idiomas",
        stats_phrases: "Frases Auto-Reply",
        stats_logs: "Tipos de Logs",
        
        // About Section
        about_title: "🤠 Sobre o Sheriff Bot",
        about_p1: "Sheriff Bot é um bot Discord com tema do Velho Oeste que oferece uma experiência completa de economia, mineração, jogos e muito mais!",
        about_p2: "Desenvolvido com <strong>Discord.js v14</strong>, o bot utiliza <strong>Canvas</strong> para gerar imagens personalizadas (profile cards, wanted posters) e suporta <strong>3 idiomas</strong> (PT-BR, EN-US, ES-ES).",
        about_tech: "🔧 Tecnologias:",
        about_highlights: "✨ Destaques:",
        about_h1: "✅ Sistema de moedas duplas (Tokens + Coins)",
        about_h2: "✅ Inventário com peso anti-exploit",
        about_h3: "✅ 47 emojis customizados para perfis",
        about_h4: "✅ Detecção automática de imagens Western",
        about_h5: "✅ Progress bars animadas",
        about_h6: "✅ JSON welcome system completo",
        about_h7: "✅ 9 tipos de logs configuráveis",
        
        // CTA Section
        cta_title: "Pronto para começar sua jornada no Velho Oeste?",
        cta_subtitle: "Adicione o Sheriff Bot ao seu servidor Discord agora!",
        cta_button: "Adicionar ao Discord",
        cta_note: "Gratuito • Sem necessidade de cadastro • Pronto para uso",
        
        // Shop Section
        shop_title: "🛒 OFERTAS ESPECIAIS",
        shop_subtitle: "Compre moeda premium e turbine sua economia!",
        shop_starter_badge: "🌟 Iniciante",
        shop_popular_badge: "⭐ MAIS VENDIDO",
        shop_best_value_badge: "⚡ Melhor Custo",
        shop_ultimate_badge: "💎 SUPREMO",
        shop_buy_now: "Comprar Agora",
        shop_save_60: "Economize 60%!",
        shop_save_65: "Economize 65%!",
        shop_save_70: "Economize 70%!",
        shop_bonus_50: "🎁 +50 Tokens Bônus",
        shop_bonus_150: "🎁 +150 Tokens Bônus",
        shop_bonus_500: "🎁 +500 Tokens Bônus",
        shop_vip_badge: "🌟 Badge VIP",
        shop_exclusive_bg: "🎨 Background Exclusivo",
        shop_inventory_upgrade: "📦 Inventário: 100kg → 500kg",
        shop_permanent_upgrade: "🔓 Upgrade Permanente",
        shop_instant_activation: "⚡ Ativação Instantânea",
        shop_security: "💳 <strong>Pagamento 100% seguro via Stripe</strong> • ⚡ Entrega instantânea • 🔒 PCI Compliant",
        shop_view_all: "Ver Todos os Detalhes da Loja →",
        
        // Footer
        footer_brand: "🤠 SHERIFF BOT",
        footer_brand_desc: "Western-themed Discord Bot",
        footer_links: "Links Rápidos",
        footer_resources: "Recursos",
        footer_commands_count: "26 Comandos",
        footer_emojis_count: "47 Emojis",
        footer_languages_count: "3 Idiomas",
        footer_logs_count: "9 Tipos de Logs",
        // Shop Section
        shop_security: "💳 <strong>Pagamento 100% seguro via Stripe</strong> • ⚡ Entrega instantânea • 🔒 PCI Compliant",
        shop_view_all: "Ver Todos os Detalhes da Loja →",
        
        footer_copyright: "&copy; 2025 Sheriff Bot. Todos os direitos reservados.",
        footer_made: "Feito com ❤️ para a comunidade Discord"
    }
};

// Get browser language or default to English
function getDefaultLanguage() {
    // Always default to English
    // Users can change via language selector
    return 'en';
}

// Current language
let currentLang = getDefaultLanguage();

// Translate function
function t(key) {
    return translations[currentLang][key] || key;
}

// Change language
function changeLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('sheriff-bot-lang', lang);
    
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update language selector
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLang);
});
