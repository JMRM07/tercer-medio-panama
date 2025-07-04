// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Cotizacion.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let cotizacionActual = null;
let itemsCotizacion = [];
let editandoCotizacion = false;

// Función para inicializar la página
async function inicializarPagina() {
    try {
        actualizarFechaActual();
        generarCodigoCotizacion();
        await cargarClientes();
        
        // Verificar si se está editando una cotización
        const urlParams = new URLSearchParams(window.location.search);
        const cotizacionId = urlParams.get('id');
        
        if (cotizacionId) {
            editandoCotizacion = true;
            await cargarCotizacion(cotizacionId);
        }
        
        configurarEventos();
        
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

// Función para actualizar fecha actual
function actualizarFechaActual() {
    const fechaElement = document.getElementById('fechaCotizacion');
    if (fechaElement) {
        const hoy = new Date();
        fechaElement.value = hoy.toISOString().split('T')[0];
    }
}

// Función para generar código de cotización
function generarCodigoCotizacion() {
    const codigoElement = document.getElementById('codigoCotizacion');
    if (codigoElement && !editandoCotizacion) {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minuto = fecha.getMinutes().toString().padStart(2, '0');
        
        codigoElement.value = `COT-${año}${mes}${dia}-${hora}${minuto}`;
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

// Función para cargar cotización (modo edición)
async function cargarCotizacion(id) {
    try {
        const cotizacion = await apiAdapter.getCotizacion(id);
        cotizacionActual = cotizacion;
        
        // Llenar formulario con datos de la cotización
        document.getElementById('codigoCotizacion').value = cotizacion.codigo;
        document.getElementById('fechaCotizacion').value = cotizacion.fecha_cotizacion.split('T')[0];
        document.getElementById('cliente').value = cotizacion.cliente_id;
        document.getElementById('descripcionGeneral').value = cotizacion.descripcion;
        document.getElementById('observaciones').value = cotizacion.observaciones;
        
        // Cambiar título de la página
        document.querySelector('h1').innerHTML = '<i class="fas fa-edit"></i> Editar Cotización';
        
        // Si tiene items, cargarlos
        if (cotizacion.items) {
            itemsCotizacion = cotizacion.items;
            actualizarTablaItems();
        }
        
    } catch (error) {
        console.error('Error al cargar cotización:', error);
        mostrarMensaje('Error al cargar la cotización', 'error');
    }
}

// Función para configurar eventos
function configurarEventos() {
    // Eventos para agregar items
    const btnAgregarItem = document.getElementById('btnAgregarItem');
    if (btnAgregarItem) {
        btnAgregarItem.addEventListener('click', abrirModalItem);
    }
    
    // Eventos para calcular totales automáticamente
    const inputs = ['cantidadItem', 'precioItem', 'descuentoItem'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calcularTotalItem);
        }
    });
}

// Función para abrir modal de item
function abrirModalItem(item = null) {
    const modal = document.getElementById('modalItem');
    if (modal) {
        modal.style.display = 'block';
        
        if (item) {
            // Modo edición
            document.getElementById('descripcionItem').value = item.descripcion;
            document.getElementById('cantidadItem').value = item.cantidad;
            document.getElementById('precioItem').value = item.precio;
            document.getElementById('descuentoItem').value = item.descuento || 0;
            modal.dataset.editIndex = item.index;
        } else {
            // Modo creación
            limpiarFormularioItem();
            delete modal.dataset.editIndex;
        }
        
        calcularTotalItem();
    }
}

// Función para cerrar modal de item
function cerrarModalItem() {
    const modal = document.getElementById('modalItem');
    if (modal) {
        modal.style.display = 'none';
        limpiarFormularioItem();
    }
}

// Función para limpiar formulario de item
function limpiarFormularioItem() {
    document.getElementById('descripcionItem').value = '';
    document.getElementById('cantidadItem').value = '1';
    document.getElementById('precioItem').value = '';
    document.getElementById('descuentoItem').value = '0';
    document.getElementById('totalItem').textContent = '$0.00';
}

// Función para calcular total del item
function calcularTotalItem() {
    const cantidad = parseFloat(document.getElementById('cantidadItem').value) || 0;
    const precio = parseFloat(document.getElementById('precioItem').value) || 0;
    const descuento = parseFloat(document.getElementById('descuentoItem').value) || 0;
    
    const subtotal = cantidad * precio;
    const descuentoAmount = subtotal * (descuento / 100);
    const total = subtotal - descuentoAmount;
    
    document.getElementById('totalItem').textContent = `$${total.toFixed(2)}`;
}

// Función para agregar item
function agregarItem() {
    const descripcion = document.getElementById('descripcionItem').value;
    const cantidad = parseFloat(document.getElementById('cantidadItem').value);
    const precio = parseFloat(document.getElementById('precioItem').value);
    const descuento = parseFloat(document.getElementById('descuentoItem').value) || 0;
    
    if (!descripcion || !cantidad || !precio) {
        mostrarMensaje('Por favor complete todos los campos del item', 'error');
        return;
    }
    
    const subtotal = cantidad * precio;
    const descuentoAmount = subtotal * (descuento / 100);
    const total = subtotal - descuentoAmount;
    
    const item = {
        descripcion,
        cantidad,
        precio,
        descuento,
        subtotal,
        total
    };
    
    const modal = document.getElementById('modalItem');
    const editIndex = modal.dataset.editIndex;
    
    if (editIndex !== undefined) {
        // Editar item existente
        itemsCotizacion[parseInt(editIndex)] = item;
    } else {
        // Agregar nuevo item
        itemsCotizacion.push(item);
    }
    
    actualizarTablaItems();
    calcularTotalesCotizacion();
    cerrarModalItem();
    
    mostrarMensaje('Item agregado exitosamente', 'exito');
}

// Función para actualizar tabla de items
function actualizarTablaItems() {
    const tbody = document.getElementById('itemsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    itemsCotizacion.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.descripcion}</td>
            <td class="text-center">${item.cantidad}</td>
            <td class="text-right">$${item.precio.toFixed(2)}</td>
            <td class="text-right">${item.descuento}%</td>
            <td class="text-right">$${item.subtotal.toFixed(2)}</td>
            <td class="text-right">$${item.total.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn-accion btn-editar" onclick="editarItem(${index})" title="Editar">✏️</button>
                <button class="btn-accion btn-eliminar" onclick="eliminarItem(${index})" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para editar item
function editarItem(index) {
    const item = { ...itemsCotizacion[index], index };
    abrirModalItem(item);
}

// Función para eliminar item
function eliminarItem(index) {
    if (confirm('¿Está seguro de que desea eliminar este item?')) {
        itemsCotizacion.splice(index, 1);
        actualizarTablaItems();
        calcularTotalesCotizacion();
        mostrarMensaje('Item eliminado exitosamente', 'exito');
    }
}

// Función para calcular totales de la cotización
function calcularTotalesCotizacion() {
    const subtotal = itemsCotizacion.reduce((sum, item) => sum + item.total, 0);
    const itbms = subtotal * 0.07; // 7% ITBMS
    const total = subtotal + itbms;
    
    document.getElementById('subtotalCotizacion').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('itbmsCotizacion').textContent = `$${itbms.toFixed(2)}`;
    document.getElementById('totalCotizacion').textContent = `$${total.toFixed(2)}`;
}

// Función para guardar cotización
async function guardarCotizacion() {
    const codigo = document.getElementById('codigoCotizacion').value;
    const fecha = document.getElementById('fechaCotizacion').value;
    const clienteId = document.getElementById('cliente').value;
    const descripcion = document.getElementById('descripcionGeneral').value;
    const observaciones = document.getElementById('observaciones').value;
    
    if (!codigo || !fecha || !clienteId || !descripcion) {
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (itemsCotizacion.length === 0) {
        mostrarMensaje('Debe agregar al menos un item a la cotización', 'error');
        return;
    }
    
    const subtotal = itemsCotizacion.reduce((sum, item) => sum + item.total, 0);
    const itbms = subtotal * 0.07;
    const total = subtotal + itbms;
    
    const cotizacionData = {
        codigo,
        fecha_cotizacion: fecha,
        cliente_id: parseInt(clienteId),
        descripcion,
        observaciones,
        monto: total,
        cantidad_items: itemsCotizacion.length,
        items: itemsCotizacion,
        estado: 'pendiente'
    };
    
    try {
        if (editandoCotizacion && cotizacionActual) {
            await apiAdapter.updateCotizacion(cotizacionActual.id, cotizacionData);
            mostrarMensaje('Cotización actualizada exitosamente', 'exito');
        } else {
            await apiAdapter.createCotizacion(cotizacionData);
            mostrarMensaje('Cotización guardada exitosamente', 'exito');
        }
        
        // Redirigir a la lista de cotizaciones después de 2 segundos
        setTimeout(() => {
            window.location.href = 'cotizaciones.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error al guardar cotización:', error);
        mostrarMensaje('Error al guardar la cotización: ' + error.message, 'error');
    }
}

// Función para volver al menú
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Función para ir a lista de cotizaciones
function irAListaCotizaciones() {
    window.location.href = 'cotizaciones.html';
}

// Función para generar PDF
function generarPDF() {
    mostrarMensaje('Función de generación de PDF en desarrollo', 'info');
}

// Función para duplicar cotización
function duplicarCotizacion() {
    if (confirm('¿Desea crear una nueva cotización basada en la actual?')) {
        editandoCotizacion = false;
        generarCodigoCotizacion();
        actualizarFechaActual();
        document.querySelector('h1').innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Cotización';
        mostrarMensaje('Cotización duplicada. Modifique los datos necesarios y guarde.', 'info');
    }
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
    .btn-accion { background: none; border: none; padding: 6px; cursor: pointer; border-radius: 4px; }
    .btn-accion:hover { background: #f0f0f0; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .modal-content { background: white; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 600px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn:hover { opacity: 0.9; }
`;
document.head.appendChild(style);

console.log('Cotizacion.js completo cargado correctamente');
