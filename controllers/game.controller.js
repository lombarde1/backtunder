import Game from '../models/game.model.js';

// @desc    Obter todos os jogos
// @route   GET /api/games
// @access  Public
export const getGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    
    const search = req.query.search || '';
    const category = req.query.category || '';
    const provider = req.query.provider || '';
    const active = req.query.active !== undefined ? req.query.active === 'true' : true;
    
    // Construir filtro
    const filter = { isActive: active };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category && ['slots', 'table', 'live', 'crash', 'sport', 'other'].includes(category)) {
      filter.category = category;
    }
    
    if (provider) {
      filter.provider = { $regex: provider, $options: 'i' };
    }

    // Contar total de jogos com o filtro
    const total = await Game.countDocuments(filter);
    
    // Obter jogos com paginação e filtro
    const games = await Game.find(filter)
      .sort({ popularity: -1, createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    res.json({
      success: true,
      count: games.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      games,
    });
  } catch (error) {
    console.error(`Erro ao obter jogos: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter jogos',
      error: error.message,
    });
  }
};

// @desc    Obter jogos em destaque
// @route   GET /api/games/featured
// @access  Public
export const getFeaturedGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true, isFeatured: true })
      .sort({ popularity: -1 })
      .limit(10);

    res.json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error(`Erro ao obter jogos em destaque: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter jogos em destaque',
      error: error.message,
    });
  }
};

// @desc    Obter um jogo por ID
// @route   GET /api/games/:id
// @access  Public
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (game) {
      res.json({
        success: true,
        game,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Jogo não encontrado',
      });
    }
  } catch (error) {
    console.error(`Erro ao obter jogo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter jogo',
      error: error.message,
    });
  }
};

// @desc    Criar um novo jogo
// @route   POST /api/games
// @access  Private/Admin
export const createGame = async (req, res) => {
  try {
    const {
      name,
      provider,
      category,
      imageUrl,
      description,
      minBet,
      maxBet,
      rtp,
      isActive,
      isFeatured,
      gameConfig,
    } = req.body;

    // Verificar se o nome e provedor foram fornecidos
    if (!name || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Nome e provedor do jogo são obrigatórios',
      });
    }

    // Verificar se o jogo já existe
    const gameExists = await Game.findOne({ name, provider });

    if (gameExists) {
      return res.status(400).json({
        success: false,
        message: 'Jogo com este nome e provedor já existe',
      });
    }

    // Criar novo jogo
    const game = await Game.create({
      name,
      provider,
      category,
      imageUrl,
      description,
      minBet,
      maxBet,
      rtp,
      isActive,
      isFeatured,
      gameConfig,
    });

    res.status(201).json({
      success: true,
      message: 'Jogo criado com sucesso',
      game,
    });
  } catch (error) {
    console.error(`Erro ao criar jogo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar jogo',
      error: error.message,
    });
  }
};

// @desc    Atualizar um jogo
// @route   PUT /api/games/:id
// @access  Private/Admin
export const updateGame = async (req, res) => {
  try {
    const {
      name,
      provider,
      category,
      imageUrl,
      description,
      minBet,
      maxBet,
      rtp,
      isActive,
      isFeatured,
      popularity,
      gameConfig,
    } = req.body;

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jogo não encontrado',
      });
    }

    // Atualizar jogo
    if (name) game.name = name;
    if (provider) game.provider = provider;
    if (category) game.category = category;
    if (imageUrl) game.imageUrl = imageUrl;
    if (description) game.description = description;
    if (minBet !== undefined) game.minBet = minBet;
    if (maxBet !== undefined) game.maxBet = maxBet;
    if (rtp !== undefined) game.rtp = rtp;
    if (isActive !== undefined) game.isActive = isActive;
    if (isFeatured !== undefined) game.isFeatured = isFeatured;
    if (popularity !== undefined) game.popularity = popularity;
    if (gameConfig) game.gameConfig = gameConfig;

    const updatedGame = await game.save();

    res.json({
      success: true,
      message: 'Jogo atualizado com sucesso',
      game: updatedGame,
    });
  } catch (error) {
    console.error(`Erro ao atualizar jogo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar jogo',
      error: error.message,
    });
  }
};

// @desc    Excluir um jogo
// @route   DELETE /api/games/:id
// @access  Private/Admin
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jogo não encontrado',
      });
    }

    await game.deleteOne();

    res.json({
      success: true,
      message: 'Jogo removido com sucesso',
    });
  } catch (error) {
    console.error(`Erro ao excluir jogo: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir jogo',
      error: error.message,
    });
  }
}; 