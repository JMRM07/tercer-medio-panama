// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Reportes.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let datosReporte = null;

// Función para inicializar la página
async function inicializarPagina() {
    try {
        await cargarEstadisticasGenerales();
        configurarFiltros();
        
    } catch (error) {
        console.error('Error al inicializar página:', error);
        mostrarMensaje('Error al cargar la página', 'error');
    }
}

// Función para mostrar mensajes en la página
function mostrarMensaje(mensaje, tipo = 'info') {
    const mensajesAnteriores = document.querySelectorAll('.mensaje-notificacion');
    mensajesAnteriores.forEach(msg => msg.remove());

    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-notificacion mensaje-${tipo}`;
    mensajeDiv.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()" class="btn-cerrar-mensaje">&times;</button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(mensajeDiv, container.firstChild);

    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 5000);
}

// Función para cargar estadísticas generales
async function cargarEstadisticasGenerales() {
    try {
        const [clientes, cotizaciones, contratos, facturas] = await Promise.all([
            apiAdapter.getClientes(),
            apiAdapter.getCotizaciones(),
            apiAdapter.getContratos(),
            apiAdapter.getFacturas()
        ]);

        actualizarEstadisticasEnDashboard(clientes, cotizaciones, contratos, facturas);
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        mostrarMensaje('Error al cargar las estadísticas generales', 'error');
    }
}

// Función para actualizar estadísticas en dashboard
function actualizarEstadisticasEnDashboard(clientes, cotizaciones, contratos, facturas) {
    // Actualizar contadores
    document.getElementById('totalClientes').textContent = clientes.length;
    document.getElementById('totalCotizaciones').textContent = cotizaciones.length;
    document.getElementById('totalContratos').textContent = contratos.length;
    document.getElementById('totalFacturas').textContent = facturas.length;

    // Calcular totales de ingresos
    const ingresosCotizaciones = cotizaciones.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
    const ingresosContratos = contratos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
    const ingresosFacturas = facturas.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

    document.getElementById('ingresosCotizaciones').textContent = `$${ingresosCotizaciones.toFixed(2)}`;
    document.getElementById('ingresosContratos').textContent = `$${ingresosContratos.toFixed(2)}`;
    document.getElementById('ingresosFacturas').textContent = `$${ingresosFacturas.toFixed(2)}`;

    // Calcular estadísticas mensuales
    const estadisticasMensuales = calcularEstadisticasMensuales(cotizaciones, contratos, facturas);
    actualizarGraficoMensual(estadisticasMensuales);
}

// Función para calcular estadísticas mensuales
function calcularEstadisticasMensuales(cotizaciones, contratos, facturas) {
    const estadisticas = {};
    const hoy = new Date();
    
    // Últimos 12 meses
    for (let i = 11; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes = fecha.toISOString().slice(0, 7);
        estadisticas[mes] = { cotizaciones: 0, contratos: 0, facturas: 0 };
    }
    
    // Agrupar por mes
    [...cotizaciones, ...contratos, ...facturas].forEach(item => {
        const fecha = new Date(item.fecha_cotizacion || item.fecha_inicio || item.fecha_factura);
        const mes = fecha.toISOString().slice(0, 7);
        
        if (estadisticas[mes]) {
            if (item.fecha_cotizacion) estadisticas[mes].cotizaciones++;
            if (item.fecha_inicio) estadisticas[mes].contratos++;
            if (item.fecha_factura) estadisticas[mes].facturas++;
        }
    });
    
    return estadisticas;
}

// Función para actualizar gráfico mensual
function actualizarGraficoMensual(estadisticas) {
    const canvas = document.getElementById('graficoMensual');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const meses = Object.keys(estadisticas);
    const datos = Object.values(estadisticas);

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar dimensiones
    const margin = 40;
    const width = canvas.width - 2 * margin;
    const height = canvas.height - 2 * margin;
    const barWidth = width / meses.length;
    const maxValue = Math.max(...datos.map(d => d.cotizaciones + d.contratos + d.facturas));

    // Dibujar barras
    datos.forEach((dato, index) => {
        const x = margin + index * barWidth;
        const totalValue = dato.cotizaciones + dato.contratos + dato.facturas;
        const barHeight = (totalValue / maxValue) * height;
        const y = margin + height - barHeight;

        // Barra
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

        // Etiqueta del mes
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(meses[index].slice(5), x + barWidth / 2, canvas.height - 10);

        // Valor
        ctx.fillText(totalValue.toString(), x + barWidth / 2, y - 5);
    });
}

// Función para configurar filtros
function configurarFiltros() {
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');
    
    if (fechaInicio && fechaFin) {
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        
        fechaInicio.value = haceUnMes.toISOString().split('T')[0];
        fechaFin.value = hoy.toISOString().split('T')[0];
    }
}

// Función para generar reporte
async function generarReporte() {
    const tipoReporte = document.getElementById('tipoReporte').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!tipoReporte) {
        mostrarMensaje('Por favor seleccione un tipo de reporte', 'error');
        return;
    }
    
    if (!fechaInicio || !fechaFin) {
        mostrarMensaje('Por favor seleccione el rango de fechas', 'error');
        return;
    }
    
    try {
        mostrarMensaje('Generando reporte...', 'info');
        
        let datos = [];
        
        switch (tipoReporte) {
            case 'clientes':
                datos = await apiAdapter.getClientes();
                break;
            case 'cotizaciones':
                datos = await apiAdapter.getCotizaciones();
                break;
            case 'contratos':
                datos = await apiAdapter.getContratos();
                break;
            case 'facturas':
                datos = await apiAdapter.getFacturas();
                break;
            default:
                mostrarMensaje('Tipo de reporte no válido', 'error');
                return;
        }
        
        // Filtrar por fecha
        const datosEnRango = filtrarPorFecha(datos, fechaInicio, fechaFin, tipoReporte);
        
        // Mostrar resultado
        mostrarResultadoReporte(tipoReporte, datosEnRango);
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        mostrarMensaje('Error al generar el reporte: ' + error.message, 'error');
    }
}

// Función para filtrar por fecha
function filtrarPorFecha(datos, fechaInicio, fechaFin, tipoReporte) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    return datos.filter(item => {
        let fechaItem;
        
        switch (tipoReporte) {
            case 'cotizaciones':
                fechaItem = new Date(item.fecha_cotizacion);
                break;
            case 'contratos':
                fechaItem = new Date(item.fecha_inicio);
                break;
            case 'facturas':
                fechaItem = new Date(item.fecha_factura);
                break;
            default:
                return true; // Para clientes, no filtrar por fecha
        }
        
        return fechaItem >= inicio && fechaItem <= fin;
    });
}

// Función para mostrar resultado del reporte
function mostrarResultadoReporte(tipoReporte, datos) {
    const tablaResultado = document.getElementById('tablaResultado');
    if (!tablaResultado) return;
    
    tablaResultado.innerHTML = '';
    
    if (datos.length === 0) {
        tablaResultado.innerHTML = '<p>No se encontraron datos para el período seleccionado.</p>';
        return;
    }
    
    const tabla = document.createElement('table');
    tabla.className = 'tabla-reporte';
    
    // Crear encabezado
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    
    let columnas = [];
    switch (tipoReporte) {
        case 'clientes':
            columnas = ['Nombre', 'Email', 'Teléfono', 'RUC', 'Dirección'];
            break;
        case 'cotizaciones':
            columnas = ['Código', 'Fecha', 'Cliente', 'Monto', 'Estado'];
            break;
        case 'contratos':
            columnas = ['Número', 'Fecha', 'Cliente', 'Monto', 'Estado'];
            break;
        case 'facturas':
            columnas = ['Número', 'Fecha', 'Cliente', 'Subtotal', 'ITBMS', 'Total'];
            break;
    }
    
    columnas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tr.appendChild(th);
    });
    
    thead.appendChild(tr);
    tabla.appendChild(thead);
    
    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    
    datos.forEach(item => {
        const tr = document.createElement('tr');
        
        switch (tipoReporte) {
            case 'clientes':
                tr.innerHTML = `
                    <td>${item.nombre}</td>
                    <td>${item.email}</td>
                    <td>${item.telefono}</td>
                    <td>${item.ruc}</td>
                    <td>${item.direccion}</td>
                `;
                break;
            case 'cotizaciones':
                tr.innerHTML = `
                    <td>${item.codigo}</td>
                    <td>${new Date(item.fecha_cotizacion).toLocaleDateString()}</td>
                    <td>${item.clientes?.nombre || 'N/A'}</td>
                    <td>$${parseFloat(item.monto || 0).toFixed(2)}</td>
                    <td>${item.estado}</td>
                `;
                break;
            case 'contratos':
                tr.innerHTML = `
                    <td>${item.numero}</td>
                    <td>${new Date(item.fecha_inicio).toLocaleDateString()}</td>
                    <td>${item.clientes?.nombre || 'N/A'}</td>
                    <td>$${parseFloat(item.monto || 0).toFixed(2)}</td>
                    <td>${item.estado}</td>
                `;
                break;
            case 'facturas':
                tr.innerHTML = `
                    <td>${item.numero_factura}</td>
                    <td>${new Date(item.fecha_factura).toLocaleDateString()}</td>
                    <td>${item.clientes?.nombre || 'N/A'}</td>
                    <td>$${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                    <td>$${parseFloat(item.itbms || 0).toFixed(2)}</td>
                    <td>$${parseFloat(item.total || 0).toFixed(2)}</td>
                `;
                break;
        }
        
        tbody.appendChild(tr);
    });
    
    tabla.appendChild(tbody);
    tablaResultado.appendChild(tabla);
    
    // Mostrar estadísticas del reporte
    const estadisticas = document.createElement('div');
    estadisticas.className = 'estadisticas-reporte';
    estadisticas.innerHTML = `
        <h3>Estadísticas del Reporte</h3>
        <p>Total de registros: ${datos.length}</p>
        ${tipoReporte !== 'clientes' ? `
            <p>Monto total: $${datos.reduce((sum, item) => sum + parseFloat(item.monto || item.total || 0), 0).toFixed(2)}</p>
        ` : ''}
    `;
    
    tablaResultado.appendChild(estadisticas);
    
    mostrarMensaje('Reporte generado exitosamente', 'exito');
}

// Función para exportar reporte
function exportarReporte() {
    const tabla = document.querySelector('.tabla-reporte');
    if (!tabla) {
        mostrarMensaje('No hay datos para exportar', 'error');
        return;
    }
    
    // Convertir tabla a CSV
    let csv = '';
    const filas = tabla.querySelectorAll('tr');
    
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('th, td');
        const valores = Array.from(celdas).map(celda => celda.textContent);
        csv += valores.join(',') + '\n';
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarMensaje('Reporte exportado exitosamente', 'exito');
}

// Función para imprimir reporte
function imprimirReporte() {
    const contenido = document.getElementById('tablaResultado').innerHTML;
    const ventanaImpresion = window.open('', '_blank');
    
    ventanaImpresion.document.write(`
        <html>
            <head>
                <title>Reporte</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .estadisticas-reporte { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Reporte - ${new Date().toLocaleDateString()}</h1>
                ${contenido}
            </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
    ventanaImpresion.print();
}

// Función para volver al menú
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Estilos adicionales
const style = document.createElement('style');
style.textContent = `
    .mensaje-notificacion {
        padding: 12px 16px; margin: 10px 0; border-radius: 4px;
        display: flex; justify-content: space-between; align-items: center; font-weight: 500;
    }
    .mensaje-exito { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .mensaje-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .mensaje-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    .btn-cerrar-mensaje { background: none; border: none; font-size: 18px; cursor: pointer; }
    .tabla-reporte { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .tabla-reporte th, .tabla-reporte td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .tabla-reporte th { background-color: #f2f2f2; font-weight: bold; }
    .estadisticas-reporte { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .estadisticas-reporte h3 { margin-top: 0; color: #2c3e50; }
    .estadisticas-reporte p { margin: 5px 0; }
`;
document.head.appendChild(style);

console.log('Reportes.js completo cargado correctamente');
