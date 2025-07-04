const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acceso requerido',
            code: 'NO_TOKEN' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar si el usuario existe y está activo
        const [rows] = await pool.execute(
            'SELECT id, usuario, nombre, email FROM usuarios WHERE id = ? AND activo = TRUE',
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ 
                error: 'Usuario no válido o inactivo',
                code: 'INVALID_USER' 
            });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'Token inválido',
                code: 'INVALID_TOKEN' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                error: 'Token expirado',
                code: 'EXPIRED_TOKEN' 
            });
        }
        
        console.error('Error en autenticación:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            code: 'INTERNAL_ERROR' 
        });
    }
};

// Función para generar token JWT
const generateToken = (userId, usuario) => {
    return jwt.sign(
        { userId, usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

module.exports = {
    authenticateToken,
    generateToken
}; 