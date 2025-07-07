// Diagnóstico completo de la aplicación
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const diagnostico = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        }
    };

    function addTest(name, status, details, fix = null) {
        diagnostico.tests.push({
            test: name,
            status: status ? 'PASS' : 'FAIL',
            details,
            fix
        });
        diagnostico.summary.total++;
        if (status) {
            diagnostico.summary.passed++;
        } else {
            diagnostico.summary.failed++;
        }
    }

    try {
        // Test 1: Variables de entorno
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        addTest(
            "Variables de entorno",
            !!(supabaseUrl && supabaseKey),
            supabaseUrl && supabaseKey ? 
                `SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...` : 
                "Variables de entorno no configuradas",
            !supabaseUrl || !supabaseKey ? 
                "Configurar SUPABASE_URL y SUPABASE_ANON_KEY en Vercel Settings → Environment Variables" : null
        );

        if (!supabaseUrl || !supabaseKey) {
            return res.json({
                ...diagnostico,
                error: "Variables de entorno no configuradas",
                nextStep: "Configurar variables en Vercel y redesplegar"
            });
        }

        // Test 2: Importación de Supabase
        let supabase;
        try {
            const { createClient } = await import('@supabase/supabase-js');
            supabase = createClient(supabaseUrl, supabaseKey);
            addTest(
                "Importación de Supabase",
                true,
                "Librería @supabase/supabase-js importada correctamente"
            );
        } catch (importError) {
            addTest(
                "Importación de Supabase",
                false,
                `Error al importar: ${importError.message}`,
                "Verificar que @supabase/supabase-js está en package.json"
            );
            return res.json({
                ...diagnostico,
                error: "Error al importar Supabase"
            });
        }

        // Test 3: Conexión básica a Supabase
        try {
            const { data: connectionTest, error: connectionError } = await supabase
                .from('clientes')
                .select('id')
                .limit(1);

            addTest(
                "Conexión a Supabase",
                !connectionError,
                connectionError ? 
                    `Error de conexión: ${connectionError.message}` : 
                    "Conexión exitosa a Supabase"
            );

            if (connectionError) {
                return res.json({
                    ...diagnostico,
                    error: "Error de conexión a Supabase",
                    supabaseError: connectionError
                });
            }
        } catch (connError) {
            addTest(
                "Conexión a Supabase",
                false,
                `Error crítico: ${connError.message}`,
                "Verificar credenciales de Supabase"
            );
            return res.json({
                ...diagnostico,
                error: "Error crítico de conexión"
            });
        }

        // Test 4: Verificar tabla clientes
        try {
            const { data: tableTest, error: tableError } = await supabase
                .from('clientes')
                .select('*')
                .limit(1);

            addTest(
                "Tabla clientes existe",
                !tableError,
                tableError ? 
                    `Error de tabla: ${tableError.message}` : 
                    "Tabla clientes accesible",
                tableError ? 
                    "Ejecutar script SQL para crear tabla clientes en Supabase" : null
            );

            if (tableError) {
                return res.json({
                    ...diagnostico,
                    error: "Tabla clientes no existe o no es accesible",
                    tableError
                });
            }
        } catch (tableTestError) {
            addTest(
                "Tabla clientes existe",
                false,
                `Error al verificar tabla: ${tableTestError.message}`
            );
        }

        // Test 5: Prueba de inserción (simulada)
        try {
            const testData = {
                codigo: `TEST-${Date.now()}`,
                nombre: "Cliente Test",
                ruc: "123456789",
                dv: "01",
                email: "test@test.com",
                telefono: "123456789"
            };

            // Primero intentar insertar
            const { data: insertTest, error: insertError } = await supabase
                .from('clientes')
                .insert([testData])
                .select();

            let insertSuccess = !insertError;
            let insertDetails = insertError ? 
                `Error al insertar: ${insertError.message}` : 
                "Inserción de prueba exitosa";

            // Si la inserción fue exitosa, eliminar el registro de prueba
            if (insertSuccess && insertTest && insertTest[0]) {
                await supabase
                    .from('clientes')
                    .delete()
                    .eq('id', insertTest[0].id);
                insertDetails += " (registro de prueba eliminado)";
            }

            addTest(
                "Prueba de inserción",
                insertSuccess,
                insertDetails,
                insertError ? 
                    "Verificar permisos de la tabla y estructura de datos" : null
            );

        } catch (insertTestError) {
            addTest(
                "Prueba de inserción",
                false,
                `Error en prueba: ${insertTestError.message}`
            );
        }

        // Test 6: Verificar estructura de la tabla
        try {
            const { data: structureTest, error: structureError } = await supabase
                .rpc('get_table_columns', { table_name: 'clientes' })
                .limit(1);

            // Si la función RPC no existe, intentar una consulta simple
            if (structureError) {
                const { data: simpleTest, error: simpleError } = await supabase
                    .from('clientes')
                    .select('id, nombre, ruc, dv, email, telefono')
                    .limit(0);

                addTest(
                    "Estructura de tabla",
                    !simpleError,
                    simpleError ? 
                        `Error de estructura: ${simpleError.message}` : 
                        "Estructura básica verificada"
                );
            } else {
                addTest(
                    "Estructura de tabla",
                    true,
                    "Estructura de tabla verificada con RPC"
                );
            }
        } catch (structureTestError) {
            addTest(
                "Estructura de tabla",
                false,
                `Error al verificar estructura: ${structureTestError.message}`
            );
        }

        // Resultado final
        const allTestsPassed = diagnostico.summary.failed === 0;
        
        return res.json({
            ...diagnostico,
            status: allTestsPassed ? 'SUCCESS' : 'FAILED',
            message: allTestsPassed ? 
                "Todas las pruebas pasaron. La aplicación debería funcionar correctamente." :
                `${diagnostico.summary.failed} pruebas fallaron. Revisar detalles.`,
            nextSteps: allTestsPassed ? [
                "Tu aplicación está configurada correctamente",
                "Intenta agregar un cliente desde la interfaz",
                "Si aún hay errores, revisar la consola del navegador"
            ] : [
                "Resolver los errores indicados en las pruebas",
                "Ejecutar diagnóstico nuevamente",
                "Contactar soporte si los problemas persisten"
            ]
        });

    } catch (error) {
        console.error('Error en diagnóstico:', error);
        return res.status(500).json({
            ...diagnostico,
            error: 'Error crítico en diagnóstico',
            details: error.message,
            stack: error.stack
        });
    }
} 