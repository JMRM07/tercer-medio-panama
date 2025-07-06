// Test de configuración de variables de entorno
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
        
        const config = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NO CONFIGURADO',
            supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADO',
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseKey
        };

        // Si no están configuradas las variables, mostrar error
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ 
                error: 'Variables de entorno no configuradas',
                config,
                instructions: 'Configura SUPABASE_URL y SUPABASE_ANON_KEY en Vercel'
            });
        }

        // Test de conexión básica
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            // Probar una consulta simple (CORREGIDA)
            const { data, error } = await supabase
                .from('clientes')
                .select('id')
                .limit(1);
            
            if (error) {
                return res.status(500).json({ 
                    error: 'Error de conexión con Supabase',
                    details: error.message,
                    config,
                    suggestion: 'Verificar que la tabla clientes existe y tiene los permisos correctos'
                });
            }
            
            // Test de inserción básica
            const testData = {
                codigo: `TEST-${Date.now()}`,
                nombre: "Test Cliente",
                ruc: "123456789",
                dv: "01",
                email: "test@example.com",
                telefono: "123456789",
                activo: true
            };

            const { data: insertData, error: insertError } = await supabase
                .from('clientes')
                .insert([testData])
                .select();

            if (insertError) {
                return res.status(500).json({ 
                    error: 'Error al probar inserción',
                    details: insertError.message,
                    config,
                    suggestion: 'Verificar permisos de escritura en la tabla clientes'
                });
            }

            // Eliminar el registro de prueba
            if (insertData && insertData[0]) {
                await supabase
                    .from('clientes')
                    .delete()
                    .eq('id', insertData[0].id);
            }
            
            return res.json({ 
                success: true,
                message: 'Configuración correcta - Todo funciona',
                config,
                connection: 'OK',
                database: 'OK',
                insertTest: 'OK'
            });
            
        } catch (connectionError) {
            return res.status(500).json({ 
                error: 'Error al conectar con Supabase',
                details: connectionError.message,
                config,
                suggestion: 'Verificar credenciales de Supabase'
            });
        }

    } catch (error) {
        console.error('Error en test-config:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
} 