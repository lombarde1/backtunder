import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const fixIndexes = async () => {
  try {
    // Conectar ao banco de dados
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Listar índices existentes
    const indexes = await User.collection.getIndexes();
    console.log('Índices existentes:', Object.keys(indexes));

    // Remover índice único do username se existir
    try {
      await User.collection.dropIndex('username_1');
      console.log('Índice único do username removido');
    } catch (error) {
      console.log('Índice do username não existe ou já foi removido:', error.message);
    }

    // Remover usuários com username null que podem estar causando conflito
    const result = await User.deleteMany({ 
      $or: [
        { username: null },
        { username: '' }
      ]
    });
    console.log(`Removidos ${result.deletedCount} usuários com username null/vazio`);

    // Criar índice não-único para username (para performance)
    try {
      await User.collection.createIndex({ username: 1 }, { sparse: true });
      console.log('Índice não-único criado para username');
    } catch (error) {
      console.log('Erro ao criar índice para username:', error.message);
    }

    console.log('Correção de índices concluída!');
    
  } catch (error) {
    console.error('Erro na correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixIndexes();
}

export default fixIndexes; 