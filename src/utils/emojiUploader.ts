import { Guild } from 'discord.js';
import fs from 'fs';
import path from 'path';

interface EmojiMapping {
  [key: string]: string; // name -> emoji ID format <:name:id>
}

const EMOJI_MAPPING_FILE = path.join(__dirname, '..', 'data', 'emoji-mapping.json');
const CUSTOM_EMOJIS_DIR = path.join(__dirname, '..', '..', 'assets', 'custom-emojis');

/**
 * Carrega o mapeamento de emojis do arquivo JSON
 */
export function loadEmojiMapping(): EmojiMapping {
  if (!fs.existsSync(EMOJI_MAPPING_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(EMOJI_MAPPING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading emoji mapping:', error);
    return {};
  }
}

/**
 * Salva o mapeamento de emojis no arquivo JSON
 */
export function saveEmojiMapping(mapping: EmojiMapping): void {
  try {
    fs.writeFileSync(EMOJI_MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving emoji mapping:', error);
  }
}

/**
 * Faz upload de todos os emojis da pasta custom-emojis para o servidor Discord
 */
export async function uploadCustomEmojis(guild: Guild): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Verifica se a pasta existe
  if (!fs.existsSync(CUSTOM_EMOJIS_DIR)) {
    results.errors.push('Custom emojis directory not found');
    return results;
  }

  // Lê todos os arquivos PNG da pasta
  const files = fs.readdirSync(CUSTOM_EMOJIS_DIR).filter(file => 
    file.endsWith('.png') || file.endsWith('.gif')
  );

  if (files.length === 0) {
    results.errors.push('No emoji files found in custom-emojis folder');
    return results;
  }

  const mapping = loadEmojiMapping();

  for (const file of files) {
    try {
      const filePath = path.join(CUSTOM_EMOJIS_DIR, file);
      const emojiName = file.replace(/\.(png|gif)$/, '');
      
      // Verifica o tamanho do arquivo (máximo 256KB)
      const stats = fs.statSync(filePath);
      if (stats.size > 256 * 1024) {
        results.failed++;
        results.errors.push(`${file}: File too large (${Math.round(stats.size / 1024)}KB > 256KB)`);
        continue;
      }

      // Verifica se o emoji já existe no servidor
      const existingEmoji = guild.emojis.cache.find(e => e.name === emojiName);
      
      if (existingEmoji) {
        // Atualiza o mapeamento com o emoji existente
        mapping[emojiName] = `<:${existingEmoji.name}:${existingEmoji.id}>`;
        results.success++;
        continue;
      }

      // Faz upload do emoji para o servidor
      const emoji = await guild.emojis.create({
        attachment: filePath,
        name: emojiName,
        reason: 'Custom emoji upload via Sheriff Rex Bot'
      });

      // Salva o mapeamento
      mapping[emojiName] = `<:${emoji.name}:${emoji.id}>`;
      results.success++;
      
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${file}: ${error.message}`);
    }
  }

  // Salva o mapeamento atualizado
  saveEmojiMapping(mapping);

  return results;
}

/**
 * Obtém um emoji customizado pelo nome
 */
export function getCustomEmoji(name: string, fallback: string = '❓'): string {
  const mapping = loadEmojiMapping();
  return mapping[name] || fallback;
}

/**
 * Lista todos os emojis customizados disponíveis
 */
export function listCustomEmojis(): string[] {
  const mapping = loadEmojiMapping();
  return Object.keys(mapping);
}

/**
 * Remove um emoji do servidor e do mapeamento
 */
export async function removeCustomEmoji(guild: Guild, emojiName: string): Promise<boolean> {
  try {
    const mapping = loadEmojiMapping();
    const emojiString = mapping[emojiName];
    
    if (!emojiString) {
      return false;
    }

    // Extrai o ID do emoji
    const match = emojiString.match(/:(\d+)>/);
    if (!match) {
      return false;
    }

    const emojiId = match[1];
    const emoji = guild.emojis.cache.get(emojiId);
    
    if (emoji) {
      await emoji.delete('Removed via Sheriff Rex Bot');
    }

    // Remove do mapeamento
    delete mapping[emojiName];
    saveEmojiMapping(mapping);

    return true;
  } catch (error) {
    console.error('Error removing custom emoji:', error);
    return false;
  }
}
