// API Adapter - Reemplaza localStorage con llamadas al backend
class APIAdapter {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('auth_token');
        this.apiURL = `${this.baseURL}/api`;
    }

    // Configurar token de autenticación
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
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

    // Función helper para manejar respuestas
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(error.error || `Error ${response.status}`);
        }
        return response.json();
    }

    // AUTENTICACIÓN - Corregido para Vercel
    async login(usuario, password) {
        const response = await fetch(`${this.apiURL}/auth?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await this.handleResponse(response);
        this.setToken(data.token);
        
        // Guardar datos del usuario para compatibilidad
        localStorage.setItem('usuarioActual', JSON.stringify({
            nombre: data.user.nombre,
            usuario: data.user.usuario
        }));
        
        return data;
    }

    async register(userData) {
        const response = await fetch(`${this.apiURL}/auth?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await this.handleResponse(response);
        
        // Para registro, no devolvemos token automáticamente
        // El usuario debe hacer login después de registrarse
        
        return data;
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('usuarioActual');
    }

    // CLIENTES - Corregido para Vercel
    async getClientes() {
        const response = await fetch(`${this.apiURL}/clientes`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data; // Vercel devuelve datos directamente
    }

    async createCliente(clienteData) {
        const response = await fetch(`${this.apiURL}/clientes`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(clienteData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async updateCliente(id, clienteData) {
        const response = await fetch(`${this.apiURL}/clientes?id=${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(clienteData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async deleteCliente(id) {
        const response = await fetch(`${this.apiURL}/clientes?id=${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // COTIZACIONES - Corregido para Vercel
    async getCotizaciones() {
        const response = await fetch(`${this.apiURL}/cotizaciones`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async createCotizacion(cotizacionData) {
        const response = await fetch(`${this.apiURL}/cotizaciones`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(cotizacionData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async updateCotizacion(id, cotizacionData) {
        const response = await fetch(`${this.apiURL}/cotizaciones?id=${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(cotizacionData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async deleteCotizacion(id) {
        const response = await fetch(`${this.apiURL}/cotizaciones?id=${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // CONTRATOS - Corregido para Vercel
    async getContratos() {
        const response = await fetch(`${this.apiURL}/contratos`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async createContrato(contratoData) {
        const response = await fetch(`${this.apiURL}/contratos`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(contratoData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async deleteContrato(id) {
        const response = await fetch(`${this.apiURL}/contratos?id=${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // FACTURAS - Corregido para Vercel
    async getFacturas() {
        const response = await fetch(`${this.apiURL}/facturas`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async createFactura(facturaData) {
        const response = await fetch(`${this.apiURL}/facturas`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(facturaData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    // REPORTES - Corregido para Vercel
    async getReportes(tipo = 'dashboard') {
        const response = await fetch(`${this.apiURL}/reportes?tipo=${tipo}`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data;
    }

    // CONFIGURACIÓN - Corregido para Vercel
    async getConfiguracion() {
        const response = await fetch(`${this.apiURL}/configuracion`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        return data;
    }

    async updateConfiguracion(configData) {
        const response = await fetch(`${this.apiURL}/configuracion`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(configData)
        });
        const data = await this.handleResponse(response);
        return data;
    }

    // COMPATIBILIDAD CON LOCALSTORAGE
    async deleteData(categoria) {
        // Esta función puede no ser necesaria en Vercel
        console.log(`Eliminar datos de categoría: ${categoria}`);
        return true;
    }

    // Métodos de compatibilidad con localStorage
    async getStorageItem(key) {
        return localStorage.getItem(key);
    }

    async setStorageItem(key, value) {
        localStorage.setItem(key, value);
        return true;
    }

    async removeStorageItem(key) {
        localStorage.removeItem(key);
        return true;
    }
}

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