import UTM from '../models/utm.model.js';

// @desc    Salvar parâmetros UTM por IP
// @route   POST /api/tracking/save-utms
// @access  Public
export const saveUTMs = async (req, res) => {
  try {
    console.log('🎯 Salvando UTMs...');
    
    // Capturar IP real do usuário
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.ip;

    const {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      src,
      sck,
      page_url,
      referrer
    } = req.body;

    const user_agent = req.headers['user-agent'];

    console.log('📍 IP detectado:', ip);
    console.log('📊 Dados UTM recebidos:', {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      src,
      sck,
      page_url,
      referrer,
      user_agent
    });

    // Usar upsert para atualizar ou criar
    const utmData = await UTM.findOneAndUpdate(
      { ip },
      {
        ip,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        src: src || null,
        sck: sck || null,
        user_agent: user_agent || null,
        page_url: page_url || null,
        referrer: referrer || null,
        timestamp: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ UTMs salvos com sucesso para IP:', ip);

    res.json({
      success: true,
      message: 'UTMs salvos com sucesso',
      data: {
        ip,
        saved_at: utmData.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar UTMs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar UTMs',
      error: error.message
    });
  }
};

// @desc    Recuperar parâmetros UTM por IP
// @route   GET /api/tracking/get-utms
// @access  Public
export const getUTMs = async (req, res) => {
  try {
    // Capturar IP real do usuário
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.ip;

    console.log('🔍 Buscando UTMs para IP:', ip);

    const utmData = await UTM.findOne({ ip });

    if (!utmData) {
      console.log('❌ Nenhum dado UTM encontrado para IP:', ip);
      return res.json({
        success: true,
        found: false,
        data: null,
        ip
      });
    }

    console.log('✅ UTMs encontrados para IP:', ip);

    res.json({
      success: true,
      found: true,
      data: {
        utm_source: utmData.utm_source,
        utm_medium: utmData.utm_medium,
        utm_campaign: utmData.utm_campaign,
        utm_content: utmData.utm_content,
        utm_term: utmData.utm_term,
        src: utmData.src,
        sck: utmData.sck,
        user_agent: utmData.user_agent,
        page_url: utmData.page_url,
        referrer: utmData.referrer,
        timestamp: utmData.timestamp,
        ip: utmData.ip
      }
    });

  } catch (error) {
    console.error('❌ Erro ao recuperar UTMs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recuperar UTMs',
      error: error.message
    });
  }
}; 