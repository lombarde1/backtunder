import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Gerar Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { phone, password, username, email, fullName, cpf, name } = req.body;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe telefone e senha',
      });
    }

    // Verificar se o telefone já existe
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Telefone já cadastrado',
      });
    }

    // Gerar timestamp e random para usar em todos os campos
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // Gerar username aleatório se não fornecido
    let finalUsername = username;
    if (!username || !username.trim()) {
      finalUsername = `user_${timestamp}${random}`;
      
      // Verificar se o username gerado já existe (muito improvável, mas por segurança)
      let attempts = 0;
      while (attempts < 5) {
        const existingUser = await User.findOne({ username: finalUsername });
        if (!existingUser) break;
        
        // Se existir, gerar outro
        const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalUsername = `user_${timestamp}${newRandom}`;
        attempts++;
      }
    } else {
      // Verificar se o username fornecido já existe
      const usernameExists = await User.findOne({ username: finalUsername });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Nome de usuário já existe',
        });
      }
    }

    // Gerar email aleatório se não fornecido
    let finalEmail = email;
    if (!email || !email.trim()) {
      finalEmail = `user_${timestamp}${random}@temp.local`;
      
      // Verificar se o email gerado já existe
      let attempts = 0;
      while (attempts < 5) {
        const existingUser = await User.findOne({ email: finalEmail });
        if (!existingUser) break;
        
        // Se existir, gerar outro
        const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalEmail = `user_${timestamp}${newRandom}@temp.local`;
        attempts++;
      }
    } else {
      // Verificar se o email fornecido já existe
      const emailExists = await User.findOne({ email: finalEmail });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }
    }

    // Gerar CPF temporário se não fornecido (formato: temp_XXXXXX)
    let finalCpf = cpf;
    if (!cpf || !cpf.trim()) {
      finalCpf = `temp_${timestamp}${random}`;
      
      // Verificar se o CPF gerado já existe
      let attempts = 0;
      while (attempts < 5) {
        const existingUser = await User.findOne({ cpf: finalCpf });
        if (!existingUser) break;
        
        // Se existir, gerar outro
        const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalCpf = `temp_${timestamp}${newRandom}`;
        attempts++;
      }
    }

    // Usar nome fornecido ou gerar um padrão
    let finalName = fullName || name;
    if (!finalName || !finalName.trim()) {
      finalName = `Usuário ${timestamp}`;
    }

    // Preparar dados do usuário
    const userData = {
      phone,
      password,
      username: finalUsername,
      email: finalEmail,
      name: finalName.trim(),
      cpf: finalCpf,
      location: 'Nacional', // Definir como padrão Nacional para novos usuários
      role: 'USER',
      status: 'ACTIVE'
    };

    // Criar novo usuário
    const user = await User.create(userData);

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        phone: user.phone,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Tratar erros específicos do MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let message = 'Dados já cadastrados';
      
      switch (field) {
        case 'phone':
          message = 'Telefone já cadastrado';
          break;
        case 'username':
          message = 'Nome de usuário já existe';
          break;
        case 'email':
          message = 'Email já cadastrado';
          break;
        case 'cpf':
          message = 'CPF já cadastrado';
          break;
      }
      
      return res.status(400).json({
        success: false,
        message,
      });
    }
    
    // Tratar erros de validação
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Verificar se os campos foram fornecidos
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe telefone e senha',
      });
    }

    // Buscar usuário e incluir a senha para comparação
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se o usuário está ativo
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Conta suspensa ou inativa',
      });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        id: user._id,
        phone: user.phone,
        username: user.username,
        email: user.email,
        name: user.name,
        cpf: user.cpf,
        balance: user.balance,
        location: user.location,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
    });
  }
}; 