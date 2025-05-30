import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware para verificar token JWT
export const verifyToken = async (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se usuário está ativo
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Conta suspensa ou inativa'
      });
    }

    // Adicionar usuário decodificado à requisição
    req.user = {
      id: user._id,
      phone: user.phone,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

// Middleware para verificar permissões de admin
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
}; 