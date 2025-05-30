import axios from 'axios';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import PixCredential from '../models/pixCredential.model.js';
import { generatePixQRCode } from '../services/pix.service.js';

// @desc    Gerar QR Code PIX para depósito
// @route   POST /api/pix/generate
// @access  Private
export const generatePixQrCode = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Validar valor do depósito
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido'
      });
    }

    if (amount < 27) {
      return res.status(400).json({
        success: false,
        message: 'O valor mínimo para depósito é R$ 27,00'
      });
    }

    // Buscar credenciais PIX ativas
    const activeCredential = await PixCredential.findOne({ isActive: true }).select('+clientSecret');
    if (!activeCredential) {
      return res.status(500).json({
        success: false,
        message: 'Credenciais PIX não configuradas'
      });
    }

    // Gerar ID externo único
    const externalId = `PIX_${Date.now()}_${userId}`;

    // Criar transação pendente
    const transaction = await Transaction.create({
      userId,
      type: 'DEPOSIT',
      amount: amount,
      status: 'PENDING',
      paymentMethod: 'PIX',
      externalReference: externalId
    });

    // Gerar QR Code PIX
    const pixData = await generatePixQRCode({
      amount,
      description: 'Depósito via PIX',
      externalId,
      credential: activeCredential
    });

    res.status(201).json({
      success: true,
      data: {
        transaction_id: transaction._id,
        external_id: externalId,
        qr_code: pixData.qrCode,
        amount: amount
      }
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code PIX:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar QR Code PIX',
      error: error.response ? error.response.data : error.message
    });
  }
};

// @desc    Webhook para notificações de pagamento PIX
// @route   POST /api/pix/webhook
// @access  Public
export const pixWebhook = async (req, res) => {
  try {
    const { requestBody } = req.body;

    console.log('PIX RECEBIDO');
    console.log('Webhook data:', JSON.stringify(requestBody));

    if (!requestBody || requestBody.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Dados de webhook inválidos'
      });
    }

    // Encontrar a transação PIX pendente mais recente
    const latestTransaction = await Transaction.findOne({
      type: 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: 'PIX'
    }).sort({ createdAt: -1 });

    if (!latestTransaction) {
      console.log('Nenhuma transação PIX pendente encontrada');
      return res.status(404).json({
        success: false,
        message: 'Nenhuma transação PIX pendente encontrada'
      });
    }

    console.log(`Atualizando transação ${latestTransaction._id}`);

    // Atualizar status da transação
    latestTransaction.status = 'COMPLETED';
    latestTransaction.metadata = {
      pixTransactionId: requestBody.transactionId || 'unknown',
      dateApproval: requestBody.dateApproval || new Date(),
      payerInfo: requestBody.creditParty || {},
      webhookData: requestBody,
      paymentMethod: 'PIX'
    };

    await latestTransaction.save();

    // Verificar se o saldo foi atualizado (para debug)
    const updatedUser = await User.findById(latestTransaction.userId);
    console.log(`Saldo do usuário atualizado: ${updatedUser.balance}`);

    res.json({
      success: true,
      message: 'Pagamento processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar notificação de pagamento'
    });
  }
};

// @desc    Verificar status do pagamento PIX
// @route   GET /api/pix/status/:external_id
// @access  Private
export const checkPixStatus = async (req, res) => {
  try {
    const { external_id } = req.params;
    const userId = req.user.id;

    // Buscar transação
    const transaction = await Transaction.findOne({
      externalReference: external_id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }



    res.json({
      success: true,
      data: {
        status: transaction.status,
        transaction_id: transaction._id,
        external_id: transaction.externalReference,
        amount: transaction.amount,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
        metadata: transaction.metadata
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento'
    });
  }
};