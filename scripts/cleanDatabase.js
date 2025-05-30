import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const cleanDatabase = async () => {
  try {
    // Conectar ao banco de dados
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Listar índices existentes
    const indexes = await User.collection.getIndexes();
    console.log('Índices existentes:', Object.keys(indexes));

    // Remover todos os usuários com campos null/vazios que podem causar conflito
    const result = await User.deleteMany({ 
      $or: [
        { username: null },
        { username: '' },
        { email: null },
        { email: '' },
        { cpf: null },
        { cpf: '' },
        { name: null },
        { name: '' }
      ]
    });
    console.log(`Removidos ${result.deletedCount} usuários com campos null/vazios`);

    // Remover índices únicos problemáticos se existirem
    const indexesToDrop = ['username_1', 'email_1', 'cpf_1'];
    
    for (const indexName of indexesToDrop) {
      try {
        await User.collection.dropIndex(indexName);
        console.log(`Índice ${indexName} removido`);
      } catch (error) {
        console.log(`Índice ${indexName} não existe ou já foi removido`);
      }
    }

    // Recriar índices únicos para os campos necessários
    try {
      await User.collection.createIndex({ username: 1 }, { unique: true });
      console.log('Índice único criado para username');
    } catch (error) {
      console.log('Erro ao criar índice para username:', error.message);
    }

    try {
      await User.collection.createIndex({ email: 1 }, { unique: true });
      console.log('Índice único criado para email');
    } catch (error) {
      console.log('Erro ao criar índice para email:', error.message);
    }

    try {
      await User.collection.createIndex({ cpf: 1 }, { unique: true });
      console.log('Índice único criado para cpf');
    } catch (error) {
      console.log('Erro ao criar índice para cpf:', error.message);
    }

    console.log('Limpeza do banco de dados concluída!');
    
  } catch (error) {
    console.error('Erro na limpeza:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanDatabase();
}

export default cleanDatabase; 