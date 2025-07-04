// Configuración de API para Vercel 
const API_BASE_URL = window.location.origin; 
 
// Rutas de API disponibles 
const API_ROUTES = { 
    clientes: '/api/clientes', 
    cotizaciones: '/api/cotizaciones', 
    contratos: '/api/contratos', 
    facturas: '/api/facturas', 
    reportes: '/api/reportes', 
    configuracion: '/api/configuracion', 
    auth: '/api/auth' 
}; 
 
// Función helper para hacer peticiones 
async function apiRequest(url, options = {}) { 
    const response = await fetch(API_BASE_URL + url, { 
        headers: { 
            'Content-Type': 'application/json', 
            ...options.headers 
        }, 
        ...options 
    }); 
    return response.json(); 
} 
