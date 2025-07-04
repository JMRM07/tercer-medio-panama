// Función serverless para Vercel - Autenticación con Supabase
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
        const action = req.query.action;

        switch (action) {
            case 'register':
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Método no permitido' });
                }

                const { usuario: newUser, nombre, email, telefono, password: newPassword } = req.body;
                
                if (!newUser || !nombre || !email || !newPassword) {
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Verificar usuario existente
                const { data: userCheck } = await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('usuario', newUser);

                const { data: emailCheck } = await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('email', email);
                
                if ((userCheck && userCheck.length > 0) || (emailCheck && emailCheck.length > 0)) {
                    return res.status(400).json({ error: 'Usuario o email ya existe' });
                }

                // Hashear contraseña
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

                // Crear usuario
                const { data: newUserData, error: insertError } = await supabase
                    .from('usuarios')
                    .insert([{
                        usuario: newUser,
                        nombre: nombre,
                        email: email,
                        telefono: telefono,
                        password_hash: hashedPassword
                    }])
                    .select();

                if (insertError) {
                    console.error('Error al crear usuario:', insertError);
                    return res.status(500).json({ 
                        error: 'Error al crear usuario',
                        details: insertError.message 
                    });
                }

                return res.json({
                    success: true,
                    message: 'Usuario registrado exitosamente',
                    id: newUserData[0].id
                });

            case 'login':
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Método no permitido' });
                }

                const { usuario, password } = req.body;
                
                if (!usuario || !password) {
                    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
                }

                const { data: users, error: userError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('usuario', usuario)
                    .eq('activo', true);
                
                if (userError || !users || users.length === 0) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const user = users[0];
                const passwordValid = await bcrypt.compare(password, user.password_hash);
                
                if (!passwordValid) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const token = jwt.sign({ id: user.id, usuario: user.usuario, nombre: user.nombre }, JWT_SECRET, { expiresIn: '24h' });

                return res.json({
                    success: true,
                    token,
                    user: { id: user.id, usuario: user.usuario, nombre: user.nombre, email: user.email }
                });

            default:
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
