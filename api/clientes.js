// Función serverless para Vercel - Gestión de Clientes con Supabase
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Verificar variables de entorno
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ 
                error: 'Variables de entorno no configuradas',
                details: 'SUPABASE_URL y SUPABASE_ANON_KEY son requeridas',
                instructions: 'Configura las variables de entorno en Vercel'
            });
        }

        // Importar y crear cliente Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        switch (req.method) {
            case 'GET':
                // Obtener todos los clientes o uno específico
                if (!req.query.id) {
                    const { data: clientes, error } = await supabase
                        .from('clientes')
                        .select('*')
                        .eq('activo', true)
                        .order('nombre');
                    
                    if (error) {
                        console.error('Error al obtener clientes:', error);
                        return res.status(500).json({ 
                            error: 'Error al obtener clientes',
                            details: error.message
                        });
                    }
                    
                    return res.json(clientes || []);
                }
                
                // Obtener cliente específico
                const { data: cliente, error: clienteError } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', req.query.id)
                    .eq('activo', true)
                    .single();
                
                if (clienteError && clienteError.code !== 'PGRST116') {
                    console.error('Error al obtener cliente:', clienteError);
                    return res.status(500).json({ 
                        error: 'Error al obtener cliente',
                        details: clienteError.message
                    });
                }
                
                return res.json(cliente || null);

            case 'POST':
                // Crear nuevo cliente
                const { codigo, nombre, ruc, dv, email, telefono } = req.body;
                
                // Validaciones
                if (!nombre || !ruc || !dv || !email) {
                    return res.status(400).json({ 
                        error: 'Datos incompletos',
                        details: 'Nombre, RUC, DV y email son requeridos'
                    });
                }

                // Validar email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ 
                        error: 'Email inválido',
                        details: 'Por favor ingrese un email válido'
                    });
                }

                // Generar código si no se proporciona
                const clienteCodigo = codigo || `CLI-${Date.now().toString().slice(-6)}`;
                
                // Datos del cliente
                const clienteData = {
                    codigo: clienteCodigo,
                    nombre: nombre.trim(),
                    ruc: ruc.trim(),
                    dv: dv.padStart(2, '0'),
                    email: email.trim().toLowerCase(),
                    telefono: telefono ? telefono.trim() : null,
                    activo: true
                };

                console.log('Creando cliente:', clienteData);

                const { data: newClient, error: insertError } = await supabase
                    .from('clientes')
                    .insert([clienteData])
                    .select();
                
                if (insertError) {
                    console.error('Error al insertar cliente:', insertError);
                    
                    // Manejo específico de errores de duplicados
                    if (insertError.code === '23505') {
                        return res.status(409).json({ 
                            error: 'Cliente ya existe',
                            details: 'Ya existe un cliente con este RUC o email'
                        });
                    }
                    
                    return res.status(500).json({ 
                        error: 'Error al crear cliente',
                        details: insertError.message
                    });
                }

                console.log('Cliente creado exitosamente:', newClient[0]);
                
                return res.json({ 
                    success: true, 
                    id: newClient[0].id,
                    data: newClient[0],
                    message: 'Cliente creado exitosamente' 
                });

            case 'PUT':
                // Actualizar cliente
                const clienteId = req.query.id;
                const updateData = req.body;
                
                if (!clienteId) {
                    return res.status(400).json({ 
                        error: 'ID de cliente requerido',
                        details: 'Debe proporcionar el ID del cliente a actualizar'
                    });
                }

                // Validar datos de actualización
                if (!updateData.nombre || !updateData.ruc || !updateData.dv || !updateData.email) {
                    return res.status(400).json({ 
                        error: 'Datos incompletos',
                        details: 'Nombre, RUC, DV y email son requeridos'
                    });
                }

                const { error: updateError } = await supabase
                    .from('clientes')
                    .update({
                        nombre: updateData.nombre.trim(),
                        ruc: updateData.ruc.trim(),
                        dv: updateData.dv.padStart(2, '0'),
                        email: updateData.email.trim().toLowerCase(),
                        telefono: updateData.telefono ? updateData.telefono.trim() : null
                    })
                    .eq('id', clienteId);
                
                if (updateError) {
                    console.error('Error al actualizar cliente:', updateError);
                    return res.status(500).json({ 
                        error: 'Error al actualizar cliente',
                        details: updateError.message
                    });
                }
                
                return res.json({ 
                    success: true, 
                    message: 'Cliente actualizado exitosamente' 
                });

            case 'DELETE':
                // Eliminar cliente (soft delete)
                const deleteId = req.query.id;
                
                if (!deleteId) {
                    return res.status(400).json({ 
                        error: 'ID de cliente requerido',
                        details: 'Debe proporcionar el ID del cliente a eliminar'
                    });
                }

                const { error: deleteError } = await supabase
                    .from('clientes')
                    .update({ activo: false })
                    .eq('id', deleteId);
                
                if (deleteError) {
                    console.error('Error al eliminar cliente:', deleteError);
                    return res.status(500).json({ 
                        error: 'Error al eliminar cliente',
                        details: deleteError.message
                    });
                }
                
                return res.json({ 
                    success: true, 
                    message: 'Cliente eliminado exitosamente' 
                });

            default:
                return res.status(405).json({ 
                    error: 'Método no permitido',
                    details: `Método ${req.method} no soportado`
                });
        }

    } catch (error) {
        console.error('Error crítico en API clientes:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
} 