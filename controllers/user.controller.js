import User from '../models/user.model.js';

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    // Construir filtro
    const filter = {};
    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      filter.status = status;
    }

    // Contar total de usuários com o filtro
    const total = await User.countDocuments(filter);
    
    // Obter usuários com paginação e filtro
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    console.error(`Erro ao obter usuários: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter usuários',
      error: error.message,
    });
  }
};

// @desc    Obter perfil do usuário logado
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(`Erro ao obter perfil: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Helper function para normalizar localização
const normalizeLocation = (location) => {
  if (!location) return null;
  
  const normalized = location.trim();
  
  // Se já está no formato novo, retornar como está
  if (normalized === 'Nacional' || normalized === 'Internacional') {
    return normalized;
  }
  
  // Converter valores antigos para o novo formato
  if (normalized === 'Brasil' || normalized.toLowerCase() === 'brasil') {
    return 'Nacional';
  }
  
  // Qualquer outro valor considera como Internacional
  if (normalized && normalized !== '') {
    return 'Internacional';
  }
  
  return null;
};

// @desc    Atualizar perfil do usuário logado
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar campos permitidos
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    
    // Normalizar localização
    if (req.body.location !== undefined) {
      const normalizedLocation = normalizeLocation(req.body.location);
      if (normalizedLocation) {
        user.location = normalizedLocation;
      }
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error(`Erro ao atualizar perfil: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        success: true,
        user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }
  } catch (error) {
    console.error(`Erro ao obter usuário: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter usuário',
      error: error.message,
    });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, fullName, email, phone, cpf, status, role, balance, location } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Verificar se o telefone está sendo atualizado e se já existe
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Telefone já está em uso',
        });
      }
    }

    // Atualizar usuário - aceitar tanto 'name' quanto 'fullName' para compatibilidade
    const newName = name || fullName;
    if (newName) user.name = newName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (cpf) user.cpf = cpf;
    if (status) user.status = status;
    if (role) user.role = role;
    
    // Normalizar localização
    if (location !== undefined) {
      const normalizedLocation = normalizeLocation(location);
      if (normalizedLocation) {
        user.location = normalizedLocation;
      }
    }
    
    // Apenas atualizar o saldo se for explicitamente fornecido
    if (balance !== undefined) {
      user.balance = balance;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        cpf: updatedUser.cpf,
        status: updatedUser.status,
        role: updatedUser.role,
        balance: updatedUser.balance,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    console.error(`Erro ao atualizar usuário: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message,
    });
  }
};

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Usuário removido com sucesso',
    });
  } catch (error) {
    console.error(`Erro ao excluir usuário: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir usuário',
      error: error.message,
    });
  }
}; 