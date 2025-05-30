// sdk/cardClientSDK.js
/**
 * SDK para integração com a API de Cartões de Crédito
 * @module CardClientSDK
 */

import axios from 'axios';

class CardClientSDK {
  /**
   * Inicializa o SDK do cliente de cartões
   * @param {Object} config - Configuração do cliente
   * @param {string} config.apiUrl - URL base da API
   * @param {number} [config.timeout=10000] - Timeout para requisições em ms
   */
  constructor(config) {
    if (!config.apiUrl) {
      throw new Error('apiUrl é obrigatório');
    }

    this.apiUrl = config.apiUrl.endsWith('/') 
      ? config.apiUrl.slice(0, -1) 
      : config.apiUrl;
    
    this.timeout = config.timeout || 10000;
    
    // Criar instância do axios com configurações padrão
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Adicionar interceptor para tratar erros
    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorResponse = {
          success: false,
          status: error.response?.status || 500,
          message: error.response?.data?.message || 'Erro na comunicação com a API',
          error: error.message
        };
        
        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * Gera um novo cartão de crédito válido
   * @returns {Promise<Object>} Dados do cartão gerado
   */
  async generateCard() {
    try {
      const response = await this.client.post('/api/credit-cards/generate');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Valida um cartão de crédito
   * @param {Object} cardData - Dados do cartão a ser validado
   * @param {string} cardData.cardNumber - Número do cartão
   * @param {string} cardData.expirationDate - Data de expiração (MM/YY)
   * @param {string} cardData.cvv - Código de segurança
   * @param {string} cardData.holderName - Nome do titular
   * @param {string} cardData.cpf - CPF do titular
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateCard(cardData) {
    try {
      const response = await this.client.post('/api/credit-cards/validate', cardData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Processa um pagamento com cartão de crédito
   * @param {Object} paymentData - Dados do pagamento
   * @param {string} paymentData.cardId - ID do cartão validado
   * @param {number} paymentData.amount - Valor do pagamento
   * @param {string} paymentData.transactionId - ID da transação no sistema da plataforma
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processPayment(paymentData) {
    try {
      const response = await this.client.post('/api/credit-cards/process-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Verifica status da API
   * @returns {Promise<Object>} Status da API
   */
  async checkStatus() {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default CardClientSDK;