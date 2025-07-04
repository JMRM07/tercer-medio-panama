// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Clientes.js cargado correctamente');
    cargarClientes();
});

// Variables globales
let clienteEditando = null;
const apiAdapter = new APIAdapter();

// Función para mostrar mensajes en la página (no alert)
function mostrarMensaje(mensaje, tipo = 'info') {
    // Eliminar mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje-notificacion');
    mensajesAnteriores.forEach(msg => msg.remove());

    // Crear nuevo mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-notificacion mensaje-${tipo}`;
    mensajeDiv.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()" class="btn-cerrar-mensaje">&times;</button>
    `;

    // Insertar al inicio del container
    const container = document.querySelector('.container');
    container.insertBefore(mensajeDiv, container.firstChild);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 5000);
}

// Función para guardar cliente
async function guardarCliente(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const ruc = document.getElementById('ruc').value.trim();
    const dv = document.getElementById('dv').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!validarCampos(nombre, ruc, dv, email, telefono)) {
        return;
    }

    const clienteData = {
        codigo: generarCodigo(),
        nombre,
        ruc,
        dv: dv.padStart(2, '0'),
        email,
        telefono
    };

    try {
        if (clienteEditando) {
            // Actualizar cliente existente
            await apiAdapter.updateCliente(clienteEditando, clienteData);
            mostrarMensaje('Cliente actualizado exitosamente', 'exito');
            clienteEditando = null;
        } else {
            // Crear nuevo cliente
            await apiAdapter.createCliente(clienteData);
            mostrarMensaje('Cliente guardado exitosamente', 'exito');
        }

        // Limpiar formulario y recargar tabla
        document.getElementById('clienteForm').reset();
        cargarClientes();

    } catch (error) {
        console.error('Error al guardar cliente:', error);
        mostrarMensaje('Error al guardar el cliente: ' + error.message, 'error');
    }
}

// Función para generar código automático
function generarCodigo() {
    return 'CLI-' + Date.now().toString().slice(-6);
}

// Función para validar campos
function validarCampos(nombre, ruc, dv, email, telefono) {
    if (!nombre || !ruc || !dv || !email) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return false;
    }

    if (!/^\d{1,2}$/.test(dv) || parseInt(dv) < 1 || parseInt(dv) > 99) {
        mostrarMensaje('El DV debe ser un número entre 01 y 99', 'error');
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarMensaje('Por favor, ingrese un email válido', 'error');
        return false;
    }

    return true;
}

// Función para cargar clientes
async function cargarClientes() {
    try {
        const clientes = await apiAdapter.getClientes();
        const tbody = document.getElementById('clientesBody');
        
        tbody.innerHTML = '';
        
        if (!clientes || clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No hay clientes registrados
                    </td>
                </tr>
            `;
            return;
        }

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.codigo || 'N/A'}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.ruc}</td>
                <td>${cliente.dv}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>
                    <div class="acciones-cliente">
                        <button class="btn-cliente btn-editar" onclick="editarCliente(${cliente.id})" title="Editar cliente">
                            ✏️
                        </button>
                        <button class="btn-cliente btn-eliminar" onclick="eliminarCliente(${cliente.id})" title="Eliminar cliente">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarMensaje('Error al cargar los clientes: ' + error.message, 'error');
    }
}

// Función para editar cliente
async function editarCliente(id) {
    try {
        // Obtener datos del cliente
        const clientes = await apiAdapter.getClientes();
        const cliente = clientes.find(c => c.id === id);
        
        if (!cliente) {
            mostrarMensaje('Cliente no encontrado', 'error');
            return;
        }

        // Llenar formulario
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('ruc').value = cliente.ruc;
        document.getElementById('dv').value = cliente.dv;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono || '';

        clienteEditando = id;
        mostrarMensaje('Editando cliente: ' + cliente.nombre, 'info');

    } catch (error) {
        console.error('Error al cargar cliente para editar:', error);
        mostrarMensaje('Error al cargar el cliente', 'error');
    }
}

// Función para eliminar cliente
async function eliminarCliente(id) {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
        return;
    }

    try {
        await apiAdapter.deleteCliente(id);
        mostrarMensaje('Cliente eliminado exitosamente', 'exito');
        cargarClientes();

    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        mostrarMensaje('Error al eliminar el cliente: ' + error.message, 'error');
    }
}

// Función para cerrar modal de confirmación
function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para volver al menú (backup)
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Event listeners adicionales
window.addEventListener('beforeunload', function() {
    // Limpiar variables si el usuario sale de la página
    clienteEditando = null;
});

// Estilos adicionales para los mensajes (si no están en CSS)
const style = document.createElement('style');
style.textContent = `
    .mensaje-notificacion {
        padding: 12px 16px;
        margin: 10px 0;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
    }
    .mensaje-exito { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .mensaje-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .mensaje-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    .btn-cerrar-mensaje {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
    }
    .acciones-cliente {
        display: flex;
        gap: 8px;
        justify-content: center;
    }
    .btn-cliente {
        background: none;
        border: none;
        padding: 6px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 16px;
    }
    .btn-cliente:hover {
        background: #f0f0f0;
    }
`;
document.head.appendChild(style);

console.log('Clientes.js cargado correctamente'); 