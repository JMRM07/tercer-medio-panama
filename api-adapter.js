// API Adapter MEJORADO - Con manejo de errores y debugging
class APIAdapter {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('auth_token');
        this.apiURL = `${this.baseURL}/api`;
        this.debug = true; // Activar logs de debug
        
        if (this.debug) {
            console.log('🚀 APIAdapter inicializado:', {
                baseURL: this.baseURL,
                apiURL: this.apiURL,
                hasToken: !!this.token
            });
        }
    }

    // Configurar token de autenticación
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
            if (this.debug) console.log('✅ Token guardado');
        } else {
            localStorage.removeItem('auth_token');
            if (this.debug) console.log('🗑️ Token eliminado');
        }
    }

    // Headers para las peticiones
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Función helper para manejar respuestas MEJORADA
    async handleResponse(response) {
        const url = response.url;
        
        if (this.debug) {
            console.log(`📡 Respuesta de ${url}:`, {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });
        }
        
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
                
                if (this.debug) {
                    console.error('❌ Error detallado:', errorData);
                }
            } catch (parseError) {
                if (this.debug) {
                    console.error('❌ Error parsing response:', parseError);
                }
            }
            
            throw new Error(errorMessage);
        }
        
        try {
            const data = await response.json();
            if (this.debug) {
                console.log('✅ Datos recibidos:', data);
            }
            return data;
        } catch (parseError) {
            if (this.debug) {
                console.error('❌ Error parsing JSON:', parseError);
            }
            throw new Error('Error procesando respuesta del servidor');
        }
    }

    // Función para hacer peticiones con mejor manejo de errores
    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        if (this.debug) {
            console.log(`🔄 Petición a ${url}:`, {
                method: config.method || 'GET',
                headers: config.headers,
                body: config.body ? 'Datos enviados' : 'Sin datos'
            });
        }

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            if (this.debug) {
                console.error(`❌ Error en petición a ${url}:`, error);
            }
            
            // Mejorar el mensaje de error para el usuario
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }
            
            throw error;
        }
    }

    // AUTENTICACIÓN - Con mejor manejo de errores
    async login(usuario, password) {
        try {
            const data = await this.makeRequest('/auth?action=login', {
                method: 'POST',
                body: JSON.stringify({ usuario, password })
            });

            this.setToken(data.token);
            
            // Guardar datos del usuario para compatibilidad
            localStorage.setItem('usuarioActual', JSON.stringify({
                nombre: data.user.nombre,
                usuario: data.user.usuario
            }));
            
            if (this.debug) {
                console.log('✅ Login exitoso:', data.user);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error en login:', error);
            }
            throw new Error(`Error de autenticación: ${error.message}`);
        }
    }

    async register(userData) {
        try {
            const data = await this.makeRequest('/auth?action=register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (this.debug) {
                console.log('✅ Registro exitoso');
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error en registro:', error);
            }
            throw new Error(`Error de registro: ${error.message}`);
        }
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('usuarioActual');
        if (this.debug) {
            console.log('👋 Sesión cerrada');
        }
    }

    // CLIENTES - Con mejor manejo de errores
    async getClientes() {
        try {
            const data = await this.makeRequest('/clientes');
            
            if (this.debug) {
                console.log(`📊 Clientes cargados: ${data.length || 0}`);
            }
            
            return data || [];
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando clientes:', error);
            }
            throw new Error(`Error al cargar clientes: ${error.message}`);
        }
    }

    async createCliente(clienteData) {
        try {
            // Validar datos antes de enviar
            if (!clienteData.nombre || !clienteData.ruc || !clienteData.email) {
                throw new Error('Faltan datos obligatorios del cliente');
            }

            const data = await this.makeRequest('/clientes', {
                method: 'POST',
                body: JSON.stringify(clienteData)
            });

            if (this.debug) {
                console.log('✅ Cliente creado:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error creando cliente:', error);
            }
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }

    async updateCliente(id, clienteData) {
        try {
            if (!id) {
                throw new Error('ID de cliente requerido');
            }

            const data = await this.makeRequest(`/clientes?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(clienteData)
            });

            if (this.debug) {
                console.log('✅ Cliente actualizado:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error actualizando cliente:', error);
            }
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }

    async deleteCliente(id) {
        try {
            if (!id) {
                throw new Error('ID de cliente requerido');
            }

            const data = await this.makeRequest(`/clientes?id=${id}`, {
                method: 'DELETE'
            });

            if (this.debug) {
                console.log('✅ Cliente eliminado:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error eliminando cliente:', error);
            }
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    }

    // COTIZACIONES - Con mejor manejo de errores
    async getCotizaciones() {
        try {
            const data = await this.makeRequest('/cotizaciones');
            
            if (this.debug) {
                console.log(`📊 Cotizaciones cargadas: ${data.length || 0}`);
            }
            
            return data || [];
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando cotizaciones:', error);
            }
            throw new Error(`Error al cargar cotizaciones: ${error.message}`);
        }
    }

    async createCotizacion(cotizacionData) {
        try {
            const data = await this.makeRequest('/cotizaciones', {
                method: 'POST',
                body: JSON.stringify(cotizacionData)
            });

            if (this.debug) {
                console.log('✅ Cotización creada:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error creando cotización:', error);
            }
            throw new Error(`Error al crear cotización: ${error.message}`);
        }
    }

    async updateCotizacion(id, cotizacionData) {
        try {
            const data = await this.makeRequest(`/cotizaciones?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(cotizacionData)
            });

            if (this.debug) {
                console.log('✅ Cotización actualizada:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error actualizando cotización:', error);
            }
            throw new Error(`Error al actualizar cotización: ${error.message}`);
        }
    }

    async deleteCotizacion(id) {
        try {
            const data = await this.makeRequest(`/cotizaciones?id=${id}`, {
                method: 'DELETE'
            });

            if (this.debug) {
                console.log('✅ Cotización eliminada:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error eliminando cotización:', error);
            }
            throw new Error(`Error al eliminar cotización: ${error.message}`);
        }
    }

    // CONTRATOS - Con mejor manejo de errores
    async getContratos() {
        try {
            const data = await this.makeRequest('/contratos');
            
            if (this.debug) {
                console.log(`📊 Contratos cargados: ${data.length || 0}`);
            }
            
            return data || [];
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando contratos:', error);
            }
            throw new Error(`Error al cargar contratos: ${error.message}`);
        }
    }

    async createContrato(contratoData) {
        try {
            const data = await this.makeRequest('/contratos', {
                method: 'POST',
                body: JSON.stringify(contratoData)
            });

            if (this.debug) {
                console.log('✅ Contrato creado:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error creando contrato:', error);
            }
            throw new Error(`Error al crear contrato: ${error.message}`);
        }
    }

    async deleteContrato(id) {
        try {
            const data = await this.makeRequest(`/contratos?id=${id}`, {
                method: 'DELETE'
            });

            if (this.debug) {
                console.log('✅ Contrato eliminado:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error eliminando contrato:', error);
            }
            throw new Error(`Error al eliminar contrato: ${error.message}`);
        }
    }

    // FACTURAS - Con mejor manejo de errores
    async getFacturas() {
        try {
            const data = await this.makeRequest('/facturas');
            
            if (this.debug) {
                console.log(`📊 Facturas cargadas: ${data.length || 0}`);
            }
            
            return data || [];
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando facturas:', error);
            }
            throw new Error(`Error al cargar facturas: ${error.message}`);
        }
    }

    async createFactura(facturaData) {
        try {
            const data = await this.makeRequest('/facturas', {
                method: 'POST',
                body: JSON.stringify(facturaData)
            });

            if (this.debug) {
                console.log('✅ Factura creada:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error creando factura:', error);
            }
            throw new Error(`Error al crear factura: ${error.message}`);
        }
    }

    // REPORTES - Con mejor manejo de errores
    async getReportes(tipo = 'dashboard') {
        try {
            const data = await this.makeRequest(`/reportes?tipo=${tipo}`);
            
            if (this.debug) {
                console.log(`📊 Reporte ${tipo} cargado`);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando reportes:', error);
            }
            throw new Error(`Error al cargar reportes: ${error.message}`);
        }
    }

    // CONFIGURACIÓN - Con mejor manejo de errores
    async getConfiguracion() {
        try {
            const data = await this.makeRequest('/configuracion');
            
            if (this.debug) {
                console.log('⚙️ Configuración cargada');
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error cargando configuración:', error);
            }
            throw new Error(`Error al cargar configuración: ${error.message}`);
        }
    }

    async updateConfiguracion(configData) {
        try {
            const data = await this.makeRequest('/configuracion', {
                method: 'POST',
                body: JSON.stringify(configData)
            });

            if (this.debug) {
                console.log('✅ Configuración actualizada:', data);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error actualizando configuración:', error);
            }
            throw new Error(`Error al actualizar configuración: ${error.message}`);
        }
    }

    // BORRADO DE DATOS - Con mejor manejo de errores
    async deleteData(categoria) {
        try {
            const data = await this.makeRequest(`/configuracion?action=delete&categoria=${categoria}`, {
                method: 'DELETE'
            });

            if (this.debug) {
                console.log(`🗑️ Datos eliminados: ${categoria}`);
            }
            
            return data;
        } catch (error) {
            if (this.debug) {
                console.error('❌ Error eliminando datos:', error);
            }
            throw new Error(`Error al eliminar datos: ${error.message}`);
        }
    }

    // COMPATIBILIDAD CON LOCALSTORAGE - Mejorado
    async getStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            if (this.debug) {
                console.error(`❌ Error obteniendo ${key}:`, error);
            }
            return null;
        }
    }

    async setStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            if (this.debug) {
                console.error(`❌ Error guardando ${key}:`, error);
            }
            return false;
        }
    }

    async removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            if (this.debug) {
                console.error(`❌ Error eliminando ${key}:`, error);
            }
            return false;
        }
    }

    // FUNCIÓN DE DIAGNÓSTICO
    async diagnostico() {
        console.log('🔍 DIAGNÓSTICO DE SISTEMA:');
        console.log('==========================');
        
        const tests = [
            {
                name: 'Conexión a clientes',
                test: () => this.getClientes()
            },
            {
                name: 'Conexión a cotizaciones',
                test: () => this.getCotizaciones()
            },
            {
                name: 'Conexión a contratos',
                test: () => this.getContratos()
            },
            {
                name: 'Conexión a facturas',
                test: () => this.getFacturas()
            }
        ];

        for (const test of tests) {
            try {
                await test.test();
                console.log(`✅ ${test.name}: OK`);
            } catch (error) {
                console.error(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Función para validar si el API está disponible
    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiURL}/clientes`);
            return response.ok;
        } catch (error) {
            if (this.debug) {
                console.error('❌ API no disponible:', error);
            }
            return false;
        }
    }
}

// Función global para diagnóstico rápido
window.diagnosticar = async function() {
    const adapter = new APIAdapter();
    await adapter.diagnostico();
};

// Mensaje de ayuda
console.log('🔧 API Adapter cargado con funciones de debug');
console.log('💡 Usa diagnosticar() en la consola para probar conexiones');
console.log('📊 Los logs de debug están activados');

// Crear instancia global
const apiAdapter = new APIAdapter();

// Para compatibilidad con código existente
window.apiAdapter = apiAdapter;

// Función helper para mostrar errores de API
window.handleAPIError = function(error, defaultMessage = 'Error desconocido') {
    console.error('API Error:', error);
    
    if (error.message.includes('Token') || error.message.includes('401')) {
        // Error de autenticación - redirigir al login
        apiAdapter.logout();
        window.location.href = 'index.html';
        return;
    }
    
    const message = error.message || defaultMessage;
    
    // Si existe la función mostrarMensaje, usarla
    if (typeof mostrarMensaje === 'function') {
        mostrarMensaje(message, 'error');
    } else {
        alert(message);
    }
}; 