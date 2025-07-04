// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Contratos.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let contratoEditando = null;

// Función para inicializar la página
async function inicializarPagina() {
    try {
        actualizarFechaCreacion();
        generarNumeroContrato();
        await cargarClientes();
        await cargarContratos();
        
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

// Función para actualizar fecha de creación
function actualizarFechaCreacion() {
    const fechaElement = document.getElementById('fechaCreacion');
    if (fechaElement) {
        const hoy = new Date();
        fechaElement.value = hoy.toISOString().split('T')[0];
    }
}

// Función para generar número de contrato
function generarNumeroContrato() {
    const numeroElement = document.getElementById('numeroContrato');
    if (numeroElement) {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minuto = fecha.getMinutes().toString().padStart(2, '0');
        
        numeroElement.value = `CTR-${año}${mes}${dia}-${hora}${minuto}`;
    }
}

// Función para cargar clientes
async function cargarClientes() {
    try {
        const clientes = await apiAdapter.getClientes();
        const selectCliente = document.getElementById('cliente');
        
        if (selectCliente) {
            selectCliente.innerHTML = '<option value="" disabled selected>Seleccione un cliente...</option>';
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = `${cliente.nombre} (${cliente.ruc})`;
                selectCliente.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarMensaje('Error al cargar los clientes', 'error');
    }
}

// Función para calcular totales
function calcularTotal() {
    const tarifa = parseFloat(document.getElementById('tarifa').value) || 0;
    const horasContratadas = parseFloat(document.getElementById('horasContratadas').value) || 0;
    const horasReportadas = parseFloat(document.getElementById('horasReportadas').value) || 0;
    const horasFacturadas = parseFloat(document.getElementById('horasFacturadas').value) || 0;

    const subtotal = tarifa * horasContratadas;
    const itbms = subtotal * 0.07; // 7% ITBMS
    const total = subtotal + itbms;

    // Calcular balance de horas
    const balanceHoras = horasContratadas - horasReportadas;

    // Actualizar elementos
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('itbms').textContent = `$${itbms.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('balanceHoras').textContent = balanceHoras;
    
    // Cambiar color del balance
    const balanceElement = document.getElementById('balanceHoras');
    if (balanceHoras > 0) {
        balanceElement.style.color = 'green';
    } else if (balanceHoras < 0) {
        balanceElement.style.color = 'red';
    } else {
        balanceElement.style.color = 'black';
    }
}

// Función para guardar contrato
async function guardarContrato(event) {
    event.preventDefault();
    
    const numeroContrato = document.getElementById('numeroContrato').value;
    const clienteId = document.getElementById('cliente').value;
    const tipoContrato = document.getElementById('tipoContrato').value;
    const referencia = document.getElementById('referencia').value;
    const tarifa = parseFloat(document.getElementById('tarifa').value);
    const horasContratadas = parseFloat(document.getElementById('horasContratadas').value);

    if (!clienteId || !tipoContrato || !referencia || !tarifa || !horasContratadas) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return;
    }

    const subtotal = tarifa * horasContratadas;
    const itbms = subtotal * 0.07;
    const total = subtotal + itbms;

    const contratoData = {
        numero: numeroContrato,
        cliente_id: parseInt(clienteId),
        descripcion: referencia,
        monto: total,
        fecha_inicio: document.getElementById('fechaCreacion').value,
        tipo_contrato: tipoContrato,
        observaciones: `Tarifa: $${tarifa}/hora, Horas: ${horasContratadas}`
    };

    try {
        await apiAdapter.createContrato(contratoData);
        mostrarMensaje('Contrato guardado exitosamente', 'exito');
        
        // Limpiar formulario
        document.getElementById('contratoForm').reset();
        generarNumeroContrato();
        actualizarFechaCreacion();
        calcularTotal();
        
        // Recargar tabla
        await cargarContratos();

    } catch (error) {
        console.error('Error al guardar contrato:', error);
        mostrarMensaje('Error al guardar el contrato: ' + error.message, 'error');
    }
}

// Función para cargar contratos
async function cargarContratos() {
    try {
        const contratos = await apiAdapter.getContratos();
        const tbody = document.getElementById('contratosBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!contratos || contratos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 2rem; color: #666;">
                        No hay contratos registrados
                    </td>
                </tr>
            `;
            return;
        }

        contratos.forEach(contrato => {
            const tr = document.createElement('tr');
            const fechaCreacion = new Date(contrato.fecha_inicio).toLocaleDateString('es-ES');
            const clienteNombre = contrato.clientes?.nombre || 'Cliente no encontrado';
            
            tr.innerHTML = `
                <td>${contrato.numero || 'N/A'}</td>
                <td>${clienteNombre}</td>
                <td>${fechaCreacion}</td>
                <td>${contrato.descripcion || '-'}</td>
                <td>${contrato.tipo_contrato || 'N/A'}</td>
                <td class="text-right">$${contrato.monto || '0.00'}</td>
                <td class="text-right">$${contrato.subtotal || '0.00'}</td>
                <td class="text-right">$${contrato.itbms || '0.00'}</td>
                <td class="text-right">$${contrato.total || '0.00'}</td>
                <td><span class="estado-${contrato.estado?.toLowerCase()}">${contrato.estado || 'Activo'}</span></td>
                <td class="text-right">0</td>
                <td class="text-right">0</td>
                <td class="text-right">0</td>
                <td>
                    <div class="acciones-contrato">
                        <button class="btn-accion btn-ver" onclick="verContrato(${contrato.id})" title="Ver">👁️</button>
                        <button class="btn-accion btn-editar" onclick="editarContrato(${contrato.id})" title="Editar">✏️</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarContrato(${contrato.id})" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar contratos:', error);
        mostrarMensaje('Error al cargar los contratos: ' + error.message, 'error');
    }
}

// Funciones de acciones
function verContrato(id) {
    mostrarMensaje('Función de visualización en desarrollo', 'info');
}

function editarContrato(id) {
    mostrarMensaje('Función de edición en desarrollo', 'info');
}

async function eliminarContrato(id) {
    if (!confirm('¿Está seguro de que desea eliminar este contrato?')) {
        return;
    }

    try {
        await apiAdapter.deleteContrato(id);
        mostrarMensaje('Contrato eliminado exitosamente', 'exito');
        await cargarContratos();

    } catch (error) {
        console.error('Error al eliminar contrato:', error);
        mostrarMensaje('Error al eliminar el contrato: ' + error.message, 'error');
    }
}

// Funciones auxiliares
function guardarBorrador() {
    mostrarMensaje('Función de borrador en desarrollo', 'info');
}

function mostrarTodosContratos() {
    cargarContratos();
}

function limpiarTablaContratos() {
    if (confirm('¿Está seguro de que desea limpiar la tabla?')) {
        document.getElementById('contratosBody').innerHTML = '';
    }
}

function cerrarModalVisualizacion() {
    const modal = document.getElementById('modalVisualizacion');
    if (modal) modal.style.display = 'none';
}

function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) modal.style.display = 'none';
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
    .acciones-contrato { display: flex; gap: 5px; justify-content: center; }
    .btn-accion { background: none; border: none; padding: 6px; cursor: pointer; border-radius: 4px; }
    .btn-accion:hover { background: #f0f0f0; }
`;
document.head.appendChild(style);

console.log('Contratos.js completo cargado correctamente');
