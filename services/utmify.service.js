import axios from 'axios';

class UtmifyService {
  constructor() {
    this.apiToken = 'cDNiuju2ztYv9DJBQhEnuH79Vi7d4MQolTO6';
    this.baseUrl = 'https://api.utmify.com.br/api-credentials/orders';
  }

  // Método para enviar evento de PIX Gerado quando PIX é criado
  async sendPixGeneratedEvent(transactionData, user, trackingParams = {}) {
    try {
      const payload = {
        orderId: transactionData._id.toString(),
        platform: "ThunderBet",
        paymentMethod: "pix",
        status: "waiting_payment", // PIX gerado está aguardando pagamento
        createdAt: this._formatDate(transactionData.createdAt || new Date()),
        approvedDate: null, // Obrigatório mesmo que null para PIX gerado
        refundedAt: null, // Obrigatório conforme documentação
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || null, // Pode ser null conforme documentação
          document: user.cpf || null, // Pode ser null conforme documentação
          country: "BR", // ISO 3166-1 alfa-2 para Brasil
          ip: trackingParams.ip || "201.23.456.789" // IP fictício mais realista
        },
        products: [{
          id: transactionData._id.toString(),
          name: "ThunderBet Depósito PIX",
          planId: null, // Obrigatório
          planName: null, // Obrigatório
          quantity: 1,
          priceInCents: Math.round(transactionData.amount * 100)
        }],
        trackingParameters: {
          src: trackingParams.src || null,
          sck: trackingParams.sck || null,
          utm_source: trackingParams.utm_source || null,
          utm_campaign: trackingParams.utm_campaign || null,
          utm_medium: trackingParams.utm_medium || null,
          utm_content: trackingParams.utm_content || null,
          utm_term: trackingParams.utm_term || null
        },
        commission: {
          totalPriceInCents: Math.round(transactionData.amount * 100),
          gatewayFeeInCents: Math.round((transactionData.amount * 0.02) * 100), // 2% taxa gateway
          userCommissionInCents: Math.round(transactionData.amount * 100) // 100% para usuário (sem taxa comissão)
        },
        isTest: false
      };

      console.log('📊 Enviando evento PIX Gerado para UTMify:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'x-api-token': this.apiToken,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      console.log('✅ UTMify PIX Gerado - Sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao enviar PIX Gerado para UTMify:', error.response?.data || error.message);
      // Não relançar o erro para não quebrar o fluxo principal
      return null;
    }
  }

  // Método para enviar ordem (Purchase) quando pagamento é confirmado
  async sendPixApprovedEvent(transactionData, user, trackingParams = {}) {
    try {
      const now = new Date();
      const payload = {
        orderId: transactionData._id.toString(),
        platform: "ThunderBet",
        paymentMethod: "pix",
        status: this._mapStatus(transactionData.status),
        createdAt: this._formatDate(transactionData.createdAt || now),
        approvedDate: transactionData.status === 'COMPLETED' ? this._formatDate(now) : null,
        refundedAt: null, // Obrigatório conforme documentação
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || null, // Pode ser null conforme documentação
          document: user.cpf || null, // Pode ser null conforme documentação
          country: "BR", // ISO 3166-1 alfa-2 para Brasil
          ip: trackingParams.ip || "201.23.456.789" // IP fictício mais realista
        },
        products: [{
          id: transactionData._id.toString(),
          name: "ThunderBet Depósito PIX",
          planId: null, // Obrigatório
          planName: null, // Obrigatório
          quantity: 1,
          priceInCents: Math.round(transactionData.amount * 100)
        }],
        trackingParameters: {
          src: trackingParams.src || null,
          sck: trackingParams.sck || null,
          utm_source: trackingParams.utm_source || null,
          utm_campaign: trackingParams.utm_campaign || null,
          utm_medium: trackingParams.utm_medium || null,
          utm_content: trackingParams.utm_content || null,
          utm_term: trackingParams.utm_term || null
        },
        commission: {
          totalPriceInCents: Math.round(transactionData.amount * 100),
          gatewayFeeInCents: Math.round((transactionData.amount * 0.02) * 100), // 2% taxa gateway
          userCommissionInCents: Math.round(transactionData.amount * 100) // 100% para usuário (sem taxa comissão)
        },
        isTest: false
      };

      console.log('💰 Enviando evento PIX Aprovado para UTMify:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'x-api-token': this.apiToken,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      console.log('✅ UTMify PIX Aprovado - Sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao enviar PIX Aprovado para UTMify:', error.response?.data || error.message);
      // Não relançar o erro para não quebrar o fluxo principal
      return null;
    }
  }

  _mapStatus(status) {
    const statusMap = {
      'PENDING': 'waiting_payment',
      'COMPLETED': 'paid',
      'FAILED': 'refused',
      'CANCELLED': 'refused'
    };
    return statusMap[status] || 'waiting_payment';
  }

  _formatDate(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }
}

export default new UtmifyService(); 