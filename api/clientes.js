// Función serverless para Vercel - Gestión de Clientes con Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                // Obtener todos los clientes o uno específico
                if (!req.query.id) {
                    const { data: clientes, error } = await supabase
                        .from('clientes')
                        .select('*')
                        .eq('activo', true)
                        .order('nombre');
                    
                    if (error) throw error;
                    return res.json(clientes);
                }
                
                // Obtener cliente específico
                const { data: cliente, error: clienteError } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', req.query.id)
                    .eq('activo', true)
                    .single();
                
                if (clienteError && clienteError.code !== 'PGRST116') throw clienteError;
                return res.json(cliente || null);

            case 'POST':
                // Crear nuevo cliente
                const { codigo, nombre, ruc, dv, email, telefono } = req.body;
                
                if (!codigo || !nombre || !ruc || !dv || !email) {
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                const { data: newClient, error: insertError } = await supabase
                    .from('clientes')
                    .insert([{ codigo, nombre, ruc, dv, email, telefono }])
                    .select();
                
                if (insertError) throw insertError;
                
                return res.json({ 
                    success: true, 
                    id: newClient[0].id,
                    message: 'Cliente creado exitosamente' 
                });

            case 'PUT':
                // Actualizar cliente
                const clienteId = req.query.id;
                const updateData = req.body;
                
                if (!clienteId) {
                    return res.status(400).json({ error: 'ID de cliente requerido' });
                }

                const { error: updateError } = await supabase
                    .from('clientes')
                    .update({
                        nombre: updateData.nombre,
                        ruc: updateData.ruc,
                        dv: updateData.dv,
                        email: updateData.email,
                        telefono: updateData.telefono
                    })
                    .eq('id', clienteId);
                
                if (updateError) throw updateError;
                return res.json({ success: true, message: 'Cliente actualizado' });

            case 'DELETE':
                // Eliminar cliente (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    return res.status(400).json({ error: 'ID de cliente requerido' });
                }

                const { error: deleteError } = await supabase
                    .from('clientes')
                    .update({ activo: false })
                    .eq('id', deleteId);
                
                if (deleteError) throw deleteError;
                return res.json({ success: true, message: 'Cliente eliminado' });

            default:
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función clientes:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 