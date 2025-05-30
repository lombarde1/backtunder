import PixCredential from '../models/pixCredential.model.js';

// @desc    Obter todas as credenciais PIX
// @route   GET /api/pix-credentials
// @access  Private/Admin
export const getPixCredentials = async (req, res) => {
  try {
    const pixCredentials = await PixCredential.find({});

    res.json({
      success: true,
      count: pixCredentials.length,
      data: pixCredentials
    });
  } catch (error) {
    console.error('Erro ao obter credenciais PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter credenciais PIX'
    });
  }
};

// @desc    Obter uma credencial PIX por ID
// @route   GET /api/pix-credentials/:id
// @access  Private/Admin
export const getPixCredentialById = async (req, res) => {
  try {
    const pixCredential = await PixCredential.findById(req.params.id);

    if (pixCredential) {
      res.json({
        success: true,
        data: pixCredential
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Credencial PIX não encontrada'
      });
    }
  } catch (error) {
    console.error('Erro ao obter credencial PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter credencial PIX'
    });
  }
};

// @desc    Criar nova credencial PIX
// @route   POST /api/pix-credentials
// @access  Private/Admin
export const createPixCredential = async (req, res) => {
  try {
    const { name, baseUrl, clientId, clientSecret, webhookUrl, provider } = req.body;

    // Validar campos obrigatórios
    if (!name || !baseUrl || !clientId || !clientSecret || !webhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Criar nova credencial
    const pixCredential = await PixCredential.create({
      name,
      baseUrl,
      clientId,
      clientSecret,
      webhookUrl,
      provider: provider || 'pixup'
    });

    res.status(201).json({
      success: true,
      data: {
        id: pixCredential._id,
        name: pixCredential.name,
        baseUrl: pixCredential.baseUrl,
        clientId: pixCredential.clientId,
        clientSecret: pixCredential.clientSecret,
        webhookUrl: pixCredential.webhookUrl,
        provider: pixCredential.provider,
        isActive: pixCredential.isActive,
        createdAt: pixCredential.createdAt,
        updatedAt: pixCredential.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar credencial PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar credencial PIX'
    });
  }
};

// @desc    Atualizar credencial PIX
// @route   PUT /api/pix-credentials/:id
// @access  Private/Admin
export const updatePixCredential = async (req, res) => {
  try {
    const { name, baseUrl, clientId, clientSecret, webhookUrl, provider, isActive } = req.body;
    const pixCredential = await PixCredential.findById(req.params.id);

    if (!pixCredential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial PIX não encontrada'
      });
    }

    // Atualizar campos
    pixCredential.name = name || pixCredential.name;
    pixCredential.baseUrl = baseUrl || pixCredential.baseUrl;
    pixCredential.clientId = clientId || pixCredential.clientId;
    pixCredential.clientSecret = clientSecret || pixCredential.clientSecret;
    pixCredential.webhookUrl = webhookUrl || pixCredential.webhookUrl;
    pixCredential.provider = provider || pixCredential.provider;
    pixCredential.isActive = isActive !== undefined ? isActive : pixCredential.isActive;

    await pixCredential.save();

    res.json({
      success: true,
      data: {
        id: pixCredential._id,
        name: pixCredential.name,
        baseUrl: pixCredential.baseUrl,
        clientId: pixCredential.clientId,
        clientSecret: pixCredential.clientSecret,
        webhookUrl: pixCredential.webhookUrl,
        provider: pixCredential.provider,
        isActive: pixCredential.isActive,
        createdAt: pixCredential.createdAt,
        updatedAt: pixCredential.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar credencial PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar credencial PIX'
    });
  }
};

// @desc    Deletar credencial PIX
// @route   DELETE /api/pix-credentials/:id
// @access  Private/Admin
export const deletePixCredential = async (req, res) => {
  try {
    const pixCredential = await PixCredential.findById(req.params.id);

    if (!pixCredential) {
      return res.status(404).json({
        success: false,
        message: 'Credencial PIX não encontrada'
      });
    }

    await pixCredential.deleteOne();

    res.json({
      success: true,
      message: 'Credencial PIX removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar credencial PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar credencial PIX'
    });
  }
}; 