/**
 * Teste da integração UTMify - ThunderBet
 * Script para testar se os eventos estão sendo enviados corretamente
 */

import UtmifyService from './services/utmify.service.js';

// Dados de exemplo para teste
const mockTransactionData = {
  _id: '507f1f77bcf86cd799439011',
  amount: 35.00, // Testando com o valor mínimo
  status: 'COMPLETED',
  createdAt: new Date(),
  type: 'DEPOSIT',
  paymentMethod: 'PIX'
};

const mockUser = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '11999999999',
  cpf: '12345678901'
};

const mockTrackingParams = {
  utm_source: 'google',
  utm_campaign: 'thunderbet-pix',
  utm_medium: 'cpc',
  utm_content: 'deposito',
  utm_term: 'casa-apostas'
};

async function testUtmifyIntegration() {
  console.log('🧪 Iniciando teste da integração UTMify...\n');

  try {
    // Teste 1: PIX Gerado
    console.log('📊 Teste 1: Enviando evento PIX Gerado');
    const pixGeneratedResult = await UtmifyService.sendPixGeneratedEvent(
      mockTransactionData,
      mockUser,
      mockTrackingParams
    );
    
    if (pixGeneratedResult) {
      console.log('✅ Evento PIX Gerado enviado com sucesso');
    } else {
      console.log('❌ Falha ao enviar evento PIX Gerado');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: PIX Aprovado
    console.log('💰 Teste 2: Enviando evento PIX Aprovado');
    const pixApprovedResult = await UtmifyService.sendPixApprovedEvent(
      mockTransactionData,
      mockUser,
      mockTrackingParams
    );
    
    if (pixApprovedResult) {
      console.log('✅ Evento PIX Aprovado enviado com sucesso');
    } else {
      console.log('❌ Falha ao enviar evento PIX Aprovado');
    }

  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message);
  }

  console.log('\n🏁 Teste concluído!');
}

// Executar teste diretamente
testUtmifyIntegration();

export { testUtmifyIntegration }; 