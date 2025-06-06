import axios from 'axios';

class UtmifyService {
  constructor() {
    this.apiToken = '33N6gEl24sqy7juqxyk1dKOzvuQvkLaNJ8aT';
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
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || "00000000000",
          document: user.cpf || "00000000000",
          country: "BR",
          ip: trackingParams.ip || "127.0.0.1"
        },
        products: [{
          id: transactionData._id.toString(),
          name: "ThunderBet Depósito PIX",
          quantity: 1,
          priceInCents: Math.round(transactionData.amount * 100)
        }],
        commission: {
          totalPriceInCents: Math.round(transactionData.amount * 100),
          gatewayFeeInCents: Math.round((transactionData.amount * 0.05) * 100),
          userCommissionInCents: Math.round((transactionData.amount * 0.95) * 100)
        },
        isTest: false
      };

      // Adicionar trackingParameters apenas se tiver valores
      if (Object.values(trackingParams).some(value => value !== null && value !== undefined)) {
        payload.trackingParameters = {};
        if (trackingParams.src) payload.trackingParameters.src = trackingParams.src;
        if (trackingParams.sck) payload.trackingParameters.sck = trackingParams.sck;
        if (trackingParams.utm_source) payload.trackingParameters.utm_source = trackingParams.utm_source;
        if (trackingParams.utm_campaign) payload.trackingParameters.utm_campaign = trackingParams.utm_campaign;
        if (trackingParams.utm_medium) payload.trackingParameters.utm_medium = trackingParams.utm_medium;
        if (trackingParams.utm_content) payload.trackingParameters.utm_content = trackingParams.utm_content;
        if (trackingParams.utm_term) payload.trackingParameters.utm_term = trackingParams.utm_term;
      }

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
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || "00000000000",
          document: user.cpf || "00000000000",
          country: "BR",
          ip: trackingParams.ip || "127.0.0.1"
        },
        products: [{
          id: transactionData._id.toString(),
          name: "ThunderBet Depósito PIX",
          quantity: 1,
          priceInCents: Math.round(transactionData.amount * 100)
        }],
        commission: {
          totalPriceInCents: Math.round(transactionData.amount * 100),
          gatewayFeeInCents: Math.round((transactionData.amount * 0.05) * 100),
          userCommissionInCents: Math.round((transactionData.amount * 0.95) * 100)
        },
        isTest: false
      };

      // Adicionar approvedDate apenas se a transação estiver completa
      if (transactionData.status === 'COMPLETED') {
        payload.approvedDate = this._formatDate(now);
      }

      // Adicionar trackingParameters apenas se tiver valores
      if (Object.values(trackingParams).some(value => value !== null && value !== undefined)) {
        payload.trackingParameters = {};
        if (trackingParams.src) payload.trackingParameters.src = trackingParams.src;
        if (trackingParams.sck) payload.trackingParameters.sck = trackingParams.sck;
        if (trackingParams.utm_source) payload.trackingParameters.utm_source = trackingParams.utm_source;
        if (trackingParams.utm_campaign) payload.trackingParameters.utm_campaign = trackingParams.utm_campaign;
        if (trackingParams.utm_medium) payload.trackingParameters.utm_medium = trackingParams.utm_medium;
        if (trackingParams.utm_content) payload.trackingParameters.utm_content = trackingParams.utm_content;
        if (trackingParams.utm_term) payload.trackingParameters.utm_term = trackingParams.utm_term;
      }

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