const { Client } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados Neon PostgreSQL');

    // Ler o arquivo SQL
    const fs = require('fs');
    const sqlCommands = fs.readFileSync('./backend/database.sql', 'utf8')
      .split(';')
      .filter(cmd => cmd.trim().length > 0);

    console.log('📋 Executando comandos SQL...');

    for (const command of sqlCommands) {
      if (command.trim()) {
        try {
          await client.query(command);
          console.log('✅ Comando executado com sucesso');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('ℹ️  Tabela já existe, continuando...');
          } else {
            console.log('⚠️  Erro:', error.message);
          }
        }
      }
    }

    console.log('🎉 Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
  } finally {
    await client.end();
  }
};

setupDatabase();