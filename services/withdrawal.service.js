import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

class WithdrawalService {
  async processWithdrawal(transaction) {
    try {
      // Atualizar status para processando
      transaction.status = 'PROCESSING';
      await transaction.save();

      // Aqui você implementaria a integração com o provedor de pagamento PIX
      // Por exemplo, integração com a API do seu banco ou provedor de pagamento
      
      // Simular processamento assíncrono
      setTimeout(async () => {
        try {
          // Atualizar status para concluído
          transaction.status = 'COMPLETED';
          transaction.metadata.processingDetails.completedAt = new Date();
          await transaction.save();

          // Enviar notificação ao usuário (implementar sistema de notificações)
          // await this.sendNotification(transaction.userId, 'Saque concluído com sucesso');
        } catch (error) {
          console.error('Erro ao finalizar processamento do saque:', error);
          transaction.status = 'FAILED';
          transaction.metadata.processingDetails.error = error.message;
          await transaction.save();
        }
      }, 5000); // Simular 5 segundos de processamento

      return transaction;
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      transaction.status = 'FAILED';
      transaction.metadata.processingDetails.error = error.message;
      await transaction.save();
      throw error;
    }
  }

  async cancelWithdrawal(transactionId, userId) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      status: 'PENDING'
    });

    if (!transaction) {
      throw new Error('Transação não encontrada ou não pode ser cancelada');
    }

    // Restaurar saldo do usuário
    const user = await User.findById(userId);
    user.balance += transaction.amount;
    await user.save();

    // Atualizar status da transação
    transaction.status = 'CANCELLED';
    transaction.metadata.processingDetails.cancelledAt = new Date();
    await transaction.save();

    return transaction;
  }
}

export default WithdrawalService; 