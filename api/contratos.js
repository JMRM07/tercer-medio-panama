// Función serverless para Vercel - Gestión de Contratos con Supabase
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
                // Obtener todos los contratos o uno específico
                if (!req.query.id) {
                    const { data: contratos, error } = await supabase
                        .from('contratos')
                        .select(`
                            *,
                            clientes (
                                id,
                                nombre,
                                ruc,
                                dv,
                                email
                            )
                        `)
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    return res.json(contratos);
                }
                
                // Obtener contrato específico
                const { data: contrato, error: contratoError } = await supabase
                    .from('contratos')
                    .select(`
                        *,
                        clientes (
                            id,
                            nombre,
                            ruc,
                            dv,
                            email,
                            telefono
                        )
                    `)
                    .eq('id', req.query.id)
                    .single();
                
                if (contratoError && contratoError.code !== 'PGRST116') throw contratoError;
                return res.json(contrato || null);

            case 'POST':
                // Crear nuevo contrato
                const { 
                    numero, 
                    cliente_id, 
                    descripcion, 
                    monto, 
                    fecha_inicio, 
                    fecha_fin, 
                    tipo_contrato, 
                    observaciones 
                } = req.body;
                
                if (!numero || !cliente_id || !descripcion || !monto || !fecha_inicio) {
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Calcular valores
                const montoNumerico = parseFloat(monto);
                const subtotal = montoNumerico;
                const itbms = subtotal * 0.07; // 7% ITBMS
                const total = subtotal + itbms;

                const { data: newContrato, error: insertError } = await supabase
                    .from('contratos')
                    .insert([{
                        numero,
                        cliente_id: parseInt(cliente_id),
                        descripcion,
                        monto: montoNumerico,
                        subtotal,
                        itbms,
                        total,
                        fecha_inicio,
                        fecha_fin,
                        tipo_contrato: tipo_contrato || 'Servicios',
                        observaciones,
                        estado: 'Activo'
                    }])
                    .select();
                
                if (insertError) throw insertError;
                
                return res.json({ 
                    success: true, 
                    id: newContrato[0].id,
                    message: 'Contrato creado exitosamente' 
                });

            case 'PUT':
                // Actualizar contrato
                const contratoId = req.query.id;
                const updateData = req.body;
                
                if (!contratoId) {
                    return res.status(400).json({ error: 'ID de contrato requerido' });
                }

                // Recalcular valores si se actualiza el monto
                let updateFields = { ...updateData };
                
                if (updateData.monto) {
                    const monto = parseFloat(updateData.monto);
                    const subtotal = monto;
                    const itbms = subtotal * 0.07;
                    const total = subtotal + itbms;
                    
                    updateFields = {
                        ...updateFields,
                        subtotal,
                        itbms,
                        total
                    };
                }

                const { error: updateError } = await supabase
                    .from('contratos')
                    .update(updateFields)
                    .eq('id', contratoId);
                
                if (updateError) throw updateError;
                return res.json({ success: true, message: 'Contrato actualizado' });

            case 'DELETE':
                // Eliminar contrato (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    return res.status(400).json({ error: 'ID de contrato requerido' });
                }

                const { error: deleteError } = await supabase
                    .from('contratos')
                    .delete()
                    .eq('id', deleteId);
                
                if (deleteError) throw deleteError;
                return res.json({ success: true, message: 'Contrato eliminado' });

            default:
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función contratos:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 