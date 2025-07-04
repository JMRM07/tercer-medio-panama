// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Cotizaciones.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let cotizacionEditando = null;

// Función para inicializar la página
async function inicializarPagina() {
    try {
        await cargarCotizaciones();
        
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

// Función para cargar cotizaciones
async function cargarCotizaciones() {
    try {
        const cotizaciones = await apiAdapter.getCotizaciones();
        const tbody = document.querySelector('#cotizacionesTable tbody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!cotizaciones || cotizaciones.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                        No hay cotizaciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        cotizaciones.forEach(cotizacion => {
            const tr = document.createElement('tr');
            const fechaCotizacion = new Date(cotizacion.fecha_cotizacion).toLocaleDateString('es-ES');
            const clienteNombre = cotizacion.clientes?.nombre || 'Cliente no encontrado';
            
            tr.innerHTML = `
                <td>${cotizacion.codigo || 'N/A'}</td>
                <td>${fechaCotizacion}</td>
                <td>${clienteNombre}</td>
                <td>${cotizacion.cantidad_items || 0} items</td>
                <td class="text-right">$${parseFloat(cotizacion.monto || 0).toFixed(2)}</td>
                <td class="descripcion-cell">${cotizacion.descripcion || '-'}</td>
                <td><span class="estado-${cotizacion.estado?.toLowerCase() || 'pendiente'}">${cotizacion.estado || 'Pendiente'}</span></td>
                <td>
                    <div class="acciones-cotizacion">
                        <button class="btn-accion btn-ver" onclick="verCotizacion(${cotizacion.id})" title="Ver">👁️</button>
                        <button class="btn-accion btn-editar" onclick="editarCotizacion(${cotizacion.id})" title="Editar">✏️</button>
                        <button class="btn-accion btn-pdf" onclick="generarPDF(${cotizacion.id})" title="PDF">📄</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarCotizacion(${cotizacion.id})" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
        mostrarMensaje('Error al cargar las cotizaciones: ' + error.message, 'error');
    }
}

// Función para ver cotización
async function verCotizacion(id) {
    try {
        const cotizacion = await apiAdapter.getCotizacion(id);
        
        const modalContent = `
            <div class="detalle-cotizacion">
                <h3>Código: ${cotizacion.codigo}</h3>
                <p><strong>Cliente:</strong> ${cotizacion.clientes?.nombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date(cotizacion.fecha_cotizacion).toLocaleDateString('es-ES')}</p>
                <p><strong>Descripción:</strong> ${cotizacion.descripcion || '-'}</p>
                <p><strong>Monto:</strong> $${parseFloat(cotizacion.monto || 0).toFixed(2)}</p>
                <p><strong>Estado:</strong> ${cotizacion.estado || 'Pendiente'}</p>
                <p><strong>Items:</strong> ${cotizacion.cantidad_items || 0}</p>
                <p><strong>Observaciones:</strong> ${cotizacion.observaciones || '-'}</p>
            </div>
        `;

        document.getElementById('detallesCotizacion').innerHTML = modalContent;
        document.getElementById('modalVisualizacion').style.display = 'block';

    } catch (error) {
        console.error('Error al ver cotización:', error);
        mostrarMensaje('Error al cargar los detalles de la cotización', 'error');
    }
}

// Función para editar cotización
function editarCotizacion(id) {
    // Redirigir a la página de cotización con el ID
    window.location.href = `cotizacion.html?id=${id}`;
}

// Función para generar PDF
function generarPDF(id) {
    mostrarMensaje('Función de generación de PDF en desarrollo', 'info');
}

// Función para eliminar cotización
async function eliminarCotizacion(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta cotización?')) {
        return;
    }

    try {
        await apiAdapter.deleteCotizacion(id);
        mostrarMensaje('Cotización eliminada exitosamente', 'exito');
        await cargarCotizaciones();

    } catch (error) {
        console.error('Error al eliminar cotización:', error);
        mostrarMensaje('Error al eliminar la cotización: ' + error.message, 'error');
    }
}

// Función para confirmar acción
function confirmarAccion(mensaje, callback) {
    document.getElementById('mensajeConfirmacion').textContent = mensaje;
    document.getElementById('modalConfirmacion').style.display = 'block';
    
    const btnConfirmar = document.getElementById('btnConfirmarAccion');
    btnConfirmar.onclick = function() {
        callback();
        cerrarModalConfirmacion();
    };
}

// Función para cerrar modal de confirmación
function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) modal.style.display = 'none';
}

// Función para cerrar modal de visualización
function cerrarModalVisualizacion() {
    const modal = document.getElementById('modalVisualizacion');
    if (modal) modal.style.display = 'none';
}

// Función para volver al menú
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Función para ir a nueva cotización
function nuevaCotizacion() {
    window.location.href = 'cotizacion.html';
}

// Función para buscar cotizaciones
function buscarCotizaciones() {
    const termino = document.getElementById('buscarCotizacion')?.value.toLowerCase();
    if (!termino) {
        cargarCotizaciones();
        return;
    }
    
    const filas = document.querySelectorAll('#cotizacionesTable tbody tr');
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(termino) ? '' : 'none';
    });
}

// Función para filtrar por estado
function filtrarPorEstado(estado) {
    const filas = document.querySelectorAll('#cotizacionesTable tbody tr');
    filas.forEach(fila => {
        if (estado === 'todos') {
            fila.style.display = '';
        } else {
            const estadoCell = fila.querySelector('.estado-' + estado);
            fila.style.display = estadoCell ? '' : 'none';
        }
    });
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
    .acciones-cotizacion { display: flex; gap: 5px; justify-content: center; }
    .btn-accion { background: none; border: none; padding: 6px; cursor: pointer; border-radius: 4px; }
    .btn-accion:hover { background: #f0f0f0; }
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .modal-content { background: white; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .descripcion-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .estado-pendiente { background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; }
    .estado-aprobado { background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; }
    .estado-rechazado { background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; }
    .detalle-cotizacion p { margin: 10px 0; }
    .detalle-cotizacion h3 { color: #2c3e50; margin-bottom: 15px; }
`;
document.head.appendChild(style);

console.log('Cotizaciones.js completo cargado correctamente');
