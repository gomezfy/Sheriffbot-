const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

/**
 * Inicializa o sistema de arquivos
 * Cria a pasta data e arquivos JSON necessários
 */
function initializeDatabase() {
    // Criar pasta data se não existir
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Pasta data/ criada!');
    }

    // Lista de arquivos JSON necessários
    const requiredFiles = [
        'daily.json',
        'economy.json',
        'economy.backup.json',
        'profiles.json',
        'xp.json',
        'inventory.json',
        'wanted.json',
        'welcome.json',
        'logs.json',
        'bounties.json',
        'backgrounds.json',
        'punishment.json',
        'mining.json',
        'work.json'
    ];

    // Criar arquivos que não existem
    requiredFiles.forEach(filename => {
        const filePath = path.join(dataDir, filename);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}', 'utf8');
            console.log(`✅ Criado: ${filename}`);
        }
    });

    console.log('✅ Sistema de dados inicializado!');
}

/**
 * Lê dados de um arquivo JSON
 * @param {string} filename - Nome do arquivo (ex: 'daily.json')
 * @returns {Object} Dados do arquivo ou objeto vazio
 */
function readData(filename) {
    const filePath = path.join(dataDir, filename);
    
    try {
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

/**
 * Escreve dados em um arquivo JSON
 * @param {string} filename - Nome do arquivo (ex: 'daily.json')
 * @param {Object} data - Dados para escrever
 * @returns {boolean} Sucesso da operação
 */
function writeData(filename, data) {
    const filePath = path.join(dataDir, filename);
    
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
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
