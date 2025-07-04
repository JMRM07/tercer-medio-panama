// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Facturas.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let facturaEditando = null;

// Función para inicializar la página
async function inicializarPagina() {
    try {
        await cargarFacturas();
        
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

// Función para cargar facturas
async function cargarFacturas() {
    try {
        const facturas = await apiAdapter.getFacturas();
        const tbody = document.querySelector('#facturasTable tbody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!facturas || facturas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 2rem; color: #666;">
                        No hay facturas registradas
                    </td>
                </tr>
            `;
            return;
        }

        facturas.forEach(factura => {
            const tr = document.createElement('tr');
            const fechaFactura = new Date(factura.fecha_factura).toLocaleDateString('es-ES');
            const clienteNombre = factura.clientes?.nombre || 'Cliente no encontrado';
            
            tr.innerHTML = `
                <td>${factura.numero_factura || 'N/A'}</td>
                <td>${fechaFactura}</td>
                <td>${clienteNombre}</td>
                <td class="text-right">$${parseFloat(factura.subtotal || 0).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(factura.itbms || 0).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(factura.total || 0).toFixed(2)}</td>
                <td><span class="estado-${factura.estado?.toLowerCase() || 'pendiente'}">${factura.estado || 'Pendiente'}</span></td>
                <td class="descripcion-cell">${factura.descripcion || '-'}</td>
                <td>
                    <div class="acciones-factura">
                        <button class="btn-accion btn-ver" onclick="verFactura(${factura.id})" title="Ver">👁️</button>
                        <button class="btn-accion btn-editar" onclick="editarFactura(${factura.id})" title="Editar">✏️</button>
                        <button class="btn-accion btn-pdf" onclick="generarPDF(${factura.id})" title="PDF">📄</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarFactura(${factura.id})" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar facturas:', error);
        mostrarMensaje('Error al cargar las facturas: ' + error.message, 'error');
    }
}

// Función para ver factura
async function verFactura(id) {
    try {
        const factura = await apiAdapter.getFactura(id);
        
        const modalContent = `
            <div class="detalle-factura">
                <h3>Factura #${factura.numero_factura}</h3>
                <p><strong>Cliente:</strong> ${factura.clientes?.nombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date(factura.fecha_factura).toLocaleDateString('es-ES')}</p>
                <p><strong>Descripción:</strong> ${factura.descripcion || '-'}</p>
                <div class="totales-factura">
                    <p><strong>Subtotal:</strong> $${parseFloat(factura.subtotal || 0).toFixed(2)}</p>
                    <p><strong>ITBMS:</strong> $${parseFloat(factura.itbms || 0).toFixed(2)}</p>
                    <p><strong>Total:</strong> $${parseFloat(factura.total || 0).toFixed(2)}</p>
                </div>
                <p><strong>Estado:</strong> ${factura.estado || 'Pendiente'}</p>
                <p><strong>Observaciones:</strong> ${factura.observaciones || '-'}</p>
            </div>
        `;

        document.getElementById('detallesFactura').innerHTML = modalContent;
        document.getElementById('modalVisualizacion').style.display = 'block';

    } catch (error) {
        console.error('Error al ver factura:', error);
        mostrarMensaje('Error al cargar los detalles de la factura', 'error');
    }
}

// Función para editar factura
function editarFactura(id) {
    mostrarMensaje('Función de edición de factura en desarrollo', 'info');
}

// Función para generar PDF
function generarPDF(id) {
    mostrarMensaje('Función de generación de PDF en desarrollo', 'info');
}

// Función para eliminar factura
async function eliminarFactura(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta factura?')) {
        return;
    }

    try {
        await apiAdapter.deleteFactura(id);
        mostrarMensaje('Factura eliminada exitosamente', 'exito');
        await cargarFacturas();

    } catch (error) {
        console.error('Error al eliminar factura:', error);
        mostrarMensaje('Error al eliminar la factura: ' + error.message, 'error');
    }
}

// Función para crear nueva factura
function nuevaFactura() {
    mostrarMensaje('Función de nueva factura en desarrollo', 'info');
}

// Función para buscar facturas
function buscarFacturas() {
    const termino = document.getElementById('buscarFactura')?.value.toLowerCase();
    if (!termino) {
        cargarFacturas();
        return;
    }
    
    const filas = document.querySelectorAll('#facturasTable tbody tr');
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(termino) ? '' : 'none';
    });
}

// Función para filtrar por estado
function filtrarPorEstado(estado) {
    const filas = document.querySelectorAll('#facturasTable tbody tr');
    filas.forEach(fila => {
        if (estado === 'todos') {
            fila.style.display = '';
        } else {
            const estadoCell = fila.querySelector('.estado-' + estado);
            fila.style.display = estadoCell ? '' : 'none';
        }
    });
}

// Función para filtrar por fecha
function filtrarPorFecha() {
    const fechaInicio = document.getElementById('fechaInicio')?.value;
    const fechaFin = document.getElementById('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarMensaje('Por favor seleccione ambas fechas', 'error');
        return;
    }
    
    const filas = document.querySelectorAll('#facturasTable tbody tr');
    filas.forEach(fila => {
        const fechaCell = fila.cells[1].textContent; // Columna de fecha
        const fechaFactura = new Date(fechaCell.split('/').reverse().join('-'));
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        fila.style.display = (fechaFactura >= inicio && fechaFactura <= fin) ? '' : 'none';
    });
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

// Función para exportar facturas
function exportarFacturas() {
    mostrarMensaje('Función de exportación en desarrollo', 'info');
}

// Función para imprimir facturas
function imprimirFacturas() {
    window.print();
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
    .acciones-factura { display: flex; gap: 5px; justify-content: center; }
    .btn-accion { background: none; border: none; padding: 6px; cursor: pointer; border-radius: 4px; }
    .btn-accion:hover { background: #f0f0f0; }
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .modal-content { background: white; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .descripcion-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .estado-pendiente { background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; }
    .estado-pagada { background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; }
    .estado-vencida { background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; }
    .detalle-factura p { margin: 10px 0; }
    .detalle-factura h3 { color: #2c3e50; margin-bottom: 15px; }
    .totales-factura { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .totales-factura p { margin: 5px 0; }
    .text-right { text-align: right; }
`;
document.head.appendChild(style);

console.log('Facturas.js completo cargado correctamente');
