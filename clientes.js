// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Clientes.js cargado correctamente');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar clientes iniciales
    cargarClientes();
});

// Variables globales
let clienteEditando = null;
let clienteEliminando = null;
let guardandoCliente = false; // Prevenir doble submit
let ultimoSubmit = 0; // Timestamp del último submit
// apiAdapter ya está disponible globalmente desde api-adapter.js

// Configurar todos los event listeners
function configurarEventListeners() {
    // Event listener para el formulario
    const form = document.getElementById('clienteForm');
    if (form) {
        // Remover event listener anterior si existe
        form.removeEventListener('submit', guardarCliente);
        form.addEventListener('submit', guardarCliente);
    }

    // Event listener para el botón de volver
    const btnVolver = document.querySelector('[onclick="window.location.href=\'menu.html\'"]');
    if (btnVolver) {
        btnVolver.removeAttribute('onclick');
        btnVolver.addEventListener('click', function() {
            window.location.href = 'menu.html';
        });
    }

    // Event listeners para modal
    const modal = document.getElementById('modalConfirmacion');
    const btnCerrar = document.querySelector('.btn-cerrar');
    const btnCancelar = document.querySelector('.modal-buttons .btn-secondary');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');

    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalConfirmacion);
    }
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModalConfirmacion);
    }
    if (btnConfirmar) {
        console.log('Configurando event listener para botón de confirmar eliminación');
        btnConfirmar.addEventListener('click', confirmarEliminarCliente);
    } else {
        console.warn('No se encontró el botón de confirmar eliminación');
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalConfirmacion();
            }
        });
    }
}

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
    if (container) {
        container.insertBefore(mensajeDiv, container.firstChild);
    }

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
    
    // Prevenir doble submit
    if (guardandoCliente) {
        console.log('Ya se está guardando un cliente, ignorando...');
        return;
    }
    
    // Prevenir submits muy rápidos (menos de 1 segundo)
    const ahora = Date.now();
    if (ahora - ultimoSubmit < 1000) {
        console.log('Submit muy rápido, ignorando...');
        return;
    }
    ultimoSubmit = ahora;
    
    const nombre = document.getElementById('nombre').value.trim();
    const ruc = document.getElementById('ruc').value.trim();
    const dv = document.getElementById('dv').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!validarCampos(nombre, ruc, dv, email, telefono)) {
        return;
    }

    // Generar timestamp para código único
    const timestamp = new Date().getTime();
    const clienteData = {
        codigo: generarCodigo(timestamp),
        nombre,
        ruc,
        dv: dv.padStart(2, '0'),
        email,
        telefono
    };

    try {
        // Marcar que se está guardando
        guardandoCliente = true;
        
        // Deshabilitar botón mientras se procesa
        const btnGuardar = document.querySelector('button[type="submit"]');
        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.textContent = 'Guardando...';
        }

        if (clienteEditando) {
            // Actualizar cliente existente
            await apiAdapter.updateCliente(clienteEditando, clienteData);
            mostrarMensaje('Cliente actualizado exitosamente', 'exito');
            clienteEditando = null;
        } else {
            // Crear nuevo cliente
            console.log('Creando cliente con datos:', clienteData);
            const result = await apiAdapter.createCliente(clienteData);
            console.log('Resultado de crear cliente:', result);
            mostrarMensaje('Cliente guardado exitosamente', 'exito');
        }

        // Limpiar formulario y recargar tabla
        document.getElementById('clienteForm').reset();
        console.log('Recargando tabla de clientes...');
        await cargarClientes();
        console.log('Tabla de clientes recargada');

    } catch (error) {
        console.error('Error al guardar cliente:', error);
        mostrarMensaje('Error al guardar el cliente: ' + error.message, 'error');
    } finally {
        // Liberar el bloqueo de guardado
        guardandoCliente = false;
        
        // Rehabilitar botón
        const btnGuardar = document.querySelector('button[type="submit"]');
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar Cliente';
        }
    }
}

// Función para generar código automático mejorado
function generarCodigo(timestamp = null) {
    if (!timestamp) {
        timestamp = new Date().getTime();
    }
    return 'CLI-' + timestamp.toString().slice(-6);
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
        console.log('Iniciando carga de clientes...');
        const clientes = await apiAdapter.getClientes();
        console.log('Clientes recibidos:', clientes);
        
        const tbody = document.getElementById('clientesBody');
        if (!tbody) {
            console.error('No se encontró el tbody con id clientesBody');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (!clientes || clientes.length === 0) {
            console.log('No hay clientes para mostrar');
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

        console.log(`Mostrando ${clientes.length} clientes en la tabla`);
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
                        <button class="btn-cliente btn-editar" data-cliente-id="${cliente.id}" title="Editar cliente">
                            ✏️
                        </button>
                        <button class="btn-cliente btn-eliminar" data-cliente-id="${cliente.id}" title="Eliminar cliente">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Agregar event listeners a los botones después de crearlos
        configurarBotonesAcciones();

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarMensaje('Error al cargar los clientes: ' + error.message, 'error');
    }
}

// Configurar event listeners para botones de acción
function configurarBotonesAcciones() {
    // Botones de editar
    const botonesEditar = document.querySelectorAll('.btn-editar[data-cliente-id]');
    botonesEditar.forEach(boton => {
        boton.addEventListener('click', function() {
            const clienteId = parseInt(this.getAttribute('data-cliente-id'));
            editarCliente(clienteId);
        });
    });

    // Botones de eliminar
    const botonesEliminar = document.querySelectorAll('.btn-eliminar[data-cliente-id]');
    console.log('Configurando', botonesEliminar.length, 'botones de eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', function() {
            const clienteId = parseInt(this.getAttribute('data-cliente-id'));
            console.log('Botón de eliminar clickeado, ID:', clienteId);
            eliminarCliente(clienteId);
        });
    });
}

// Función para editar cliente
async function editarCliente(id) {
    try {
        console.log('Editando cliente con ID:', id);
        
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

        // Scroll al formulario
        const formulario = document.getElementById('clienteForm');
        if (formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
        }

    } catch (error) {
        console.error('Error al cargar cliente para editar:', error);
        mostrarMensaje('Error al cargar el cliente', 'error');
    }
}

// Función para eliminar cliente
async function eliminarCliente(id) {
    try {
        console.log('Solicitando eliminación del cliente con ID:', id);
        
        // Obtener datos del cliente
        const clientes = await apiAdapter.getClientes();
        const cliente = clientes.find(c => c.id === id);
        
        if (!cliente) {
            mostrarMensaje('Cliente no encontrado', 'error');
            return;
        }

        // Mostrar modal de confirmación
        clienteEliminando = id;
        const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
        if (mensajeConfirmacion) {
            mensajeConfirmacion.textContent = `¿Está seguro que desea eliminar al cliente "${cliente.nombre}"?`;
        }

        const modal = document.getElementById('modalConfirmacion');
        if (modal) {
            console.log('Mostrando modal de confirmación para cliente:', cliente.nombre);
            modal.style.display = 'block';
        } else {
            console.warn('No se encontró el modal de confirmación');
        }

    } catch (error) {
        console.error('Error al preparar eliminación:', error);
        mostrarMensaje('Error al procesar la solicitud', 'error');
    }
}

// Función para confirmar eliminación
async function confirmarEliminarCliente() {
    if (!clienteEliminando) {
        console.log('No hay cliente seleccionado para eliminar');
        return;
    }

    try {
        console.log('Eliminando cliente con ID:', clienteEliminando);
        
        // Deshabilitar botón mientras se procesa
        const btnConfirmar = document.getElementById('btnConfirmarEliminar');
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = 'Eliminando...';
        }
        
        await apiAdapter.deleteCliente(clienteEliminando);
        mostrarMensaje('Cliente eliminado exitosamente', 'exito');
        
        // Cerrar modal y recargar tabla
        cerrarModalConfirmacion();
        await cargarClientes();
        
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        mostrarMensaje('Error al eliminar el cliente: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        const btnConfirmar = document.getElementById('btnConfirmarEliminar');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = 'Eliminar';
        }
    }
}

// Función para cerrar modal de confirmación
function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) {
        modal.style.display = 'none';
    }
    clienteEliminando = null;
}

// Función para volver al menú
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Hacer funciones globales para compatibilidad
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.guardarCliente = guardarCliente;
window.cerrarModalConfirmacion = cerrarModalConfirmacion;
window.volverAlMenu = volverAlMenu;

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