// Función serverless para Vercel - Gestión de Facturas con Supabase
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
                // Obtener todas las facturas o una específica
                if (!req.query.id) {
                    const { data: facturas, error } = await supabase
                        .from('facturas')
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
                        .eq('activo', true)
                        .order('fecha_factura', { ascending: false });
                    
                    if (error) throw error;
                    return res.json(facturas);
                }
                
                // Obtener factura específica
                const { data: factura, error: facturaError } = await supabase
                    .from('facturas')
                    .select(`
                        *,
                        clientes (
                            id,
                            nombre,
                            codigo,
                            ruc,
                            dv,
                            email,
                            telefono
                        )
                    `)
                    .eq('id', req.query.id)
                    .eq('activo', true)
                    .single();
                
                if (facturaError && facturaError.code !== 'PGRST116') throw facturaError;
                return res.json(factura || null);

            case 'POST':
                // Crear nueva factura
                const {
                    numero_factura, 
                    tipo_documento, 
                    documento_id, 
                    cliente_id,
                    subtotal, 
                    itbms, 
                    total, 
                    descripcion, 
                    fecha_factura
                } = req.body;
                
                if (!numero_factura || !tipo_documento || !documento_id || !cliente_id) {
                    return res.status(400).json({ error: 'Datos incompletos' });
                }

                // Verificar que el cliente existe
                const { data: cliente, error: clienteError } = await supabase
                    .from('clientes')
                    .select('id, nombre, ruc')
                    .eq('id', cliente_id)
                    .single();
                
                if (clienteError || !cliente) {
                    return res.status(400).json({ error: 'Cliente no encontrado' });
                }

                // Obtener datos del documento origen (cotización o contrato)
                let documentoInfo = null;
                if (tipo_documento === 'cotizacion') {
                    const { data: cot } = await supabase
                        .from('cotizaciones')
                        .select('*')
                        .eq('id', documento_id)
                        .single();
                    documentoInfo = cot;
                } else if (tipo_documento === 'contrato') {
                    const { data: con } = await supabase
                        .from('contratos')
                        .select('*')
                        .eq('id', documento_id)
                        .single();
                    documentoInfo = con;
                }

                const { data: newFactura, error: insertError } = await supabase
                    .from('facturas')
                    .insert([{
                        numero_factura,
                        tipo_documento,
                        documento_id,
                        cliente_id,
                        subtotal,
                        itbms,
                        total,
                        descripcion,
                        fecha_factura: fecha_factura || new Date().toISOString(),
                        configuracion_original: JSON.stringify(documentoInfo),
                        estado: 'Emitida'
                    }])
                    .select();
                
                if (insertError) throw insertError;
                
                return res.json({ 
                    success: true, 
                    id: newFactura[0].id,
                    message: 'Factura creada exitosamente'
                });

            case 'PUT':
                // Actualizar factura
                const facturaId = req.query.id;
                const updateData = req.body;
                
                if (!facturaId) {
                    return res.status(400).json({ error: 'ID de factura requerido' });
                }

                const { error: updateError } = await supabase
                    .from('facturas')
                    .update({
                        subtotal: updateData.subtotal,
                        itbms: updateData.itbms,
                        total: updateData.total,
                        descripcion: updateData.descripcion,
                        fecha_factura: updateData.fecha_factura,
                        estado: updateData.estado
                    })
                    .eq('id', facturaId);
                
                if (updateError) throw updateError;
                return res.json({ success: true, message: 'Factura actualizada' });

            case 'DELETE':
                // Eliminar factura (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    return res.status(400).json({ error: 'ID de factura requerido' });
                }

                const { error: deleteError } = await supabase
                    .from('facturas')
                    .update({ activo: false, estado: 'Anulada' })
                    .eq('id', deleteId);
                
                if (deleteError) throw deleteError;
                return res.json({ success: true, message: 'Factura eliminada' });

            default:
                return res.status(405).json({ error: 'Método no permitido' });
        }

    } catch (error) {
        console.error('Error en función facturas:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
} 