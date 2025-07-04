// Función serverless para Vercel - Gestión de Cotizaciones con Supabase
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
                // Obtener todas las cotizaciones o una específica
                if (!req.query.id) {
                    const { data: cotizaciones, error } = await supabase
                        .from('cotizaciones')
                        .select(`
                            *,
                            clientes (
                                id,
                                nombre,
                                codigo
                            )
                        `)
                        .eq('activo', true)
                        .order('fecha', { ascending: false });
                    
                    if (error) throw error;
                    return res.json(cotizaciones);
                }
                
                // Obtener cotización específica
                const { data: cotizacion, error: cotizacionError } = await supabase
                    .from('cotizaciones')
                    .select(`
                        *,
                        clientes (
                            id,
                            nombre,
                            codigo,
                            ruc,
                            dv
                        )
                    `)
                    .eq('id', req.query.id)
                    .eq('activo', true)
                    .single();
                
                if (cotizacionError && cotizacionError.code !== 'PGRST116') throw cotizacionError;
                return res.json(cotizacion || null);

            case 'POST':
                // Crear nueva cotización
                const { 
                    numero, 
                    cliente_id, 
                    descripcion, 
                    cantidad, 
                    precio_unitario, 
                    observaciones 
                } = req.body;
                
                if (!numero || !cliente_id || !descripcion || !cantidad || !precio_unitario) {
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Calcular valores
                const subtotal = parseFloat(cantidad) * parseFloat(precio_unitario);
                const itbms = subtotal * 0.07; // 7% ITBMS
                const total = subtotal + itbms;

                const { data: newCotizacion, error: insertError } = await supabase
                    .from('cotizaciones')
                    .insert([{
                        numero,
                        cliente_id,
                        descripcion,
                        cantidad,
                        precio_unitario,
                        subtotal,
                        itbms,
                        total,
                        observaciones,
                        fecha: new Date().toISOString(),
                        estado: 'Pendiente'
                    }])
                    .select();
                
                if (insertError) throw insertError;
                
                return res.json({ 
                    success: true, 
                    id: newCotizacion[0].id,
                    message: 'Cotización creada exitosamente' 
                });

            case 'PUT':
                // Actualizar cotización
                const cotizacionId = req.query.id;
                const updateData = req.body;
                
                if (!cotizacionId) {
                    return res.status(400).json({ error: 'ID de cotización requerido' });
                }

                // Recalcular valores si se actualizan cantidad o precio
                let updateFields = { ...updateData };
                
                if (updateData.cantidad || updateData.precio_unitario) {
                    const cantidad = parseFloat(updateData.cantidad) || 0;
                    const precio = parseFloat(updateData.precio_unitario) || 0;
                    const subtotal = cantidad * precio;
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
                    .from('cotizaciones')
                    .update(updateFields)
                    .eq('id', cotizacionId);
                
                if (updateError) throw updateError;
                return res.json({ success: true, message: 'Cotización actualizada' });

            case 'DELETE':
                // Eliminar cotización (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    return res.status(400).json({ error: 'ID de cotización requerido' });
                }

                const { error: deleteError } = await supabase
                    .from('cotizaciones')
                    .update({ activo: false })
                    .eq('id', deleteId);
                
                if (deleteError) throw deleteError;
                return res.json({ success: true, message: 'Cotización eliminada' });

            default:
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función cotizaciones:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 