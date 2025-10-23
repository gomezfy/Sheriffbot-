import fs from 'fs';
import path from 'path';
import { isValidDataFilename } from './security';

const dataDir = path.join(__dirname, '..', 'data');

export function initializeDatabase(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Pasta data/ criada!');
  }

  const requiredFiles = [
    'daily.json', 'economy.json', 'economy.backup.json', 'profiles.json',
    'xp.json', 'inventory.json', 'wanted.json', 'welcome.json',
    'logs.json', 'bounties.json', 'backgrounds.json', 'punishment.json',
    'mining.json', 'work.json', 'redemption-codes.json'
  ];

  let created = 0;
  requiredFiles.forEach(filename => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}', 'utf8');
      created++;
    }
  });
  
  if (created > 0) {
    console.log(`✅ Criados ${created} arquivos de dados!`);
  }
  console.log('✅ Sistema de dados pronto!');
}

export function readData(filename: string): any {
  // Security: Validate filename to prevent path traversal
  if (!isValidDataFilename(filename)) {
    console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
    throw new Error(`Invalid filename: ${filename}`);
  }
  
  const filePath = path.join(dataDir, filename);
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}', 'utf8');
      return {};
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    if (!data.trim()) {
      return {};
    }
    
    return JSON.parse(data);
  } catch (error: any) {
    console.error(`❌ Erro ao ler ${filename}:`, error.message);
    return {};
  }
}

export function writeData(filename: string, data: any): boolean {
  // Security: Validate filename to prevent path traversal
  if (!isValidDataFilename(filename)) {
    console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
    throw new Error(`Invalid filename: ${filename}`);
  }
  
  const filePath = path.join(dataDir, filename);
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error: any) {
    console.error(`❌ Erro ao escrever ${filename}:`, error.message);
    return false;
  }
}
