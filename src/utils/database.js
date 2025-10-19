const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function initializeDatabase() {
    // Criar pasta data
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Pasta data/ criada!');
    }

    // Lista de arquivos necessários
    const requiredFiles = [
        'daily.json', 'economy.json', 'economy.backup.json', 'profiles.json',
        'xp.json', 'inventory.json', 'wanted.json', 'welcome.json',
        'logs.json', 'bounties.json', 'backgrounds.json', 'punishment.json',
        'mining.json', 'work.json', 'redemption-codes.json'
    ];

    // Criar arquivos que não existem
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

function readData(filename) {
    const filePath = path.join(dataDir, filename);
    
    try {
        // Garantir que a pasta existe
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Criar arquivo se não existe
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}', 'utf8');
            return {};
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) {
            return {};
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Erro ao ler ${filename}:`, error.message);
        return {};
    }
}

function writeData(filename, data) {
    const filePath = path.join(dataDir, filename);
    
    try {
        // Garantir que a pasta existe
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Erro ao escrever ${filename}:`, error.message);
        return false;
    }
}

module.exports = {
    initializeDatabase,
    readData,
    writeData
};
