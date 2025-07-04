// Función serverless para Vercel - Autenticación
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function connectDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    return connection;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await connectDB();
        const action = req.query.action;

        switch (action) {
            case 'login':
                // Autenticar usuario
                if (req.method !== 'POST') {
                    await db.end();
                    return res.status(405).json({ error: 'Método no permitido' });
                }

                const { usuario, password } = req.body;
                
                if (!usuario || !password) {
                    await db.end();
                    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
                }

                // Buscar usuario en la base de datos
                const [users] = await db.execute('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1', [usuario]);
                
                if (!users.length) {
                    await db.end();
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const user = users[0];
                
                // Verificar contraseña
                const passwordValid = await bcrypt.compare(password, user.password_hash);
                
                if (!passwordValid) {
                    await db.end();
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                // Generar token JWT
                const token = jwt.sign(
                    { 
                        id: user.id, 
                        usuario: user.usuario, 
                        nombre: user.nombre 
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                await db.end();
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        usuario: user.usuario,
                        nombre: user.nombre,
                        email: user.email
                    }
                });

            case 'register':
                // Registrar nuevo usuario
                if (req.method !== 'POST') {
                    await db.end();
                    return res.status(405).json({ error: 'Método no permitido' });
                }

                const { usuario: newUser, nombre, email, telefono, password: newPassword } = req.body;
                
                if (!newUser || !nombre || !email || !newPassword) {
                    await db.end();
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Verificar si el usuario ya existe
                const [existingUsers] = await db.execute('SELECT id FROM usuarios WHERE usuario = ? OR email = ?', [newUser, email]);
                
                if (existingUsers.length > 0) {
                    await db.end();
                    return res.status(400).json({ error: 'Usuario o email ya existe' });
                }

                // Hashear contraseña
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

                // Crear usuario
                const [result] = await db.execute(`
                    INSERT INTO usuarios (usuario, nombre, email, telefono, password_hash) 
                    VALUES (?, ?, ?, ?, ?)
                `, [newUser, nombre, email, telefono, hashedPassword]);

                await db.end();
                return res.json({
                    success: true,
                    message: 'Usuario registrado exitosamente',
                    id: result.insertId
                });

            case 'verify':
                // Verificar token JWT
                if (req.method !== 'GET') {
                    await db.end();
                    return res.status(405).json({ error: 'Método no permitido' });
                }

                const authHeader = req.headers.authorization;
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    await db.end();
                    return res.status(401).json({ error: 'Token no proporcionado' });
                }

                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    
                    // Verificar que el usuario aún existe y está activo
                    const [users] = await db.execute('SELECT id, usuario, nombre, email FROM usuarios WHERE id = ? AND activo = 1', [decoded.id]);
                    
                    if (!users.length) {
                        await db.end();
                        return res.status(401).json({ error: 'Usuario no válido' });
                    }

                    await db.end();
                    return res.json({
                        valid: true,
                        user: users[0]
                    });

                } catch (error) {
                    await db.end();
                    return res.status(401).json({ error: 'Token inválido' });
                }

            default:
                await db.end();
                return res.status(400).json({ error: 'Acción no válida' });
        }

    } catch (error) {
        console.error('Error en función auth:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 