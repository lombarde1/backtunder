import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Carregegar variáveis de ambiente
dotenv.config();

const migrateToPhoneAuth = async () => {
  try {
    // Conectar ao banco de dados
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Buscar usuários sem telefone ou com telefone vazio
    const usersWithoutPhone = await User.find({
      $or: [
        { phone: { $exists: false } },
        { phone: null },
        { phone: '' }
      ]
    });

    console.log(`Encontrados ${usersWithoutPhone.length} usuários sem telefone`);

    // Atualizar usuários sem telefone
    for (const user of usersWithoutPhone) {
      // Gerar um telefone temporário baseado no ID do usuário
      const tempPhone = `temp_${user._id.toString().slice(-8)}`;
      
      console.log(`Atualizando usuário ${user.username || user.email} para telefone temporário: ${tempPhone}`);
      
      await User.findByIdAndUpdate(user._id, {
        phone: tempPhone,
        // Remover obrigatoriedade de campos que agora são opcionais
        $unset: {
          email: user.email === '' ? 1 : 0,
          cpf: user.cpf === '' ? 1 : 0,
          username: user.username === '' ? 1 : 0
        }
      });
    }

    // Criar índice único para telefone se não existir
    try {
      await User.collection.createIndex({ phone: 1 }, { unique: true });
      console.log('Índice único criado para telefone');
    } catch (error) {
      console.log('Índice para telefone já existe ou erro:', error.message);
    }

    console.log('Migração concluída com sucesso!');
    console.log('IMPORTANTE: Usuários receberam telefones temporários. Eles devem atualizar para números reais.');
    
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
};

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToPhoneAuth();
}

export default migrateToPhoneAuth; 