// Verificar si usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Función para navegar a una página
function navegarA(pagina) {
    console.log(`Navegando a: ${pagina}`);
    if (verificarAutenticacion()) {
        window.location.href = pagina;
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
    }
}

// Función para mostrar el modal de configuración
function abrirModalConfiguracion() {
    const modal = document.getElementById('modalConfiguracion');
    if (modal) {
        modal.style.display = 'block';
        cargarConfiguracion();
    }
}

// Función para cerrar el modal de configuración
function cerrarModalConfiguracion() {
    const modal = document.getElementById('modalConfiguracion');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para cargar la configuración actual
async function cargarConfiguracion() {
    try {
        const response = await fetch('/api/configuracion');
        if (response.ok) {
            const config = await response.json();
            
            // Cargar valores en los campos
            if (config.itbms) {
                document.getElementById('itbmsValue').value = parseFloat(config.itbms) * 100;
            }
            if (config.moneda_base) {
                document.getElementById('monedaBase').value = config.moneda_base;
            }
            if (config.tasa_cambio) {
                document.getElementById('tasaCambio').value = config.tasa_cambio;
            }
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

// Función para guardar la configuración
async function guardarConfiguracion() {
    const itbms = parseFloat(document.getElementById('itbmsValue').value) / 100;
    const monedaBase = document.getElementById('monedaBase').value;
    const tasaCambio = parseFloat(document.getElementById('tasaCambio').value);

    if (!itbms || !monedaBase || !tasaCambio) {
        alert('Por favor, complete todos los campos de configuración');
        return;
    }

    try {
        const response = await fetch('/api/configuracion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
                itbms: itbms,
                moneda_base: monedaBase,
                tasa_cambio: tasaCambio
            })
        });

        if (response.ok) {
            alert('Configuración guardada exitosamente');
            cerrarModalConfiguracion();
        } else {
            throw new Error('Error al guardar configuración');
        }
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        alert('Error al guardar la configuración. Intente nuevamente.');
    }
}

// Función para mostrar/ocultar opciones de borrado
function toggleOpcionesBorrado() {
    const opciones = document.getElementById('opcionesBorrado');
    const boton = document.getElementById('btnMostrarOpcionesBorrado');
    
    if (opciones.style.display === 'none' || opciones.style.display === '') {
        opciones.style.display = 'block';
        boton.textContent = 'Ocultar opciones de borrado';
    } else {
        opciones.style.display = 'none';
        boton.textContent = 'Borrar datos registrados';
    }
}

// Variable para almacenar el tipo de dato a borrar
let tipoDatoABorrar = null;

// Función para borrar datos
function borrarDatos(tipo) {
    tipoDatoABorrar = tipo;
    const modal = document.getElementById('modalConfirmacion');
    const mensaje = document.getElementById('mensajeConfirmacion');
    
    mensaje.textContent = `¿Está seguro de que desea borrar todos los ${tipo}? Esta acción no se puede deshacer.`;
    modal.style.display = 'block';
    
    // Configurar el botón de confirmación
    const btnConfirmar = document.getElementById('btnConfirmarBorrado');
    btnConfirmar.onclick = confirmarBorrado;
}

// Función para confirmar el borrado
async function confirmarBorrado() {
    if (!tipoDatoABorrar) return;
    
    try {
        const response = await fetch(`/api/${tipoDatoABorrar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        
        if (response.ok) {
            const mensajeBorrado = document.getElementById('mensajeBorrado');
            mensajeBorrado.textContent = `${tipoDatoABorrar} eliminados exitosamente`;
            mensajeBorrado.style.display = 'block';
            mensajeBorrado.style.color = 'green';
            
            setTimeout(() => {
                mensajeBorrado.style.display = 'none';
            }, 3000);
        } else {
            throw new Error('Error al eliminar datos');
        }
    } catch (error) {
        console.error('Error al borrar datos:', error);
        const mensajeBorrado = document.getElementById('mensajeBorrado');
        mensajeBorrado.textContent = 'Error al eliminar datos. Intente nuevamente.';
        mensajeBorrado.style.display = 'block';
        mensajeBorrado.style.color = 'red';
        
        setTimeout(() => {
            mensajeBorrado.style.display = 'none';
        }, 3000);
    }
    
    cerrarModalConfirmacion();
}

// Función para cerrar el modal de confirmación
function cerrarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    modal.style.display = 'none';
    tipoDatoABorrar = null;
}

// Función para cargar nombre de usuario
function cargarNombreUsuario() {
    const usuarioData = localStorage.getItem('usuarioActual');
    if (usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            const nombreUsuario = document.getElementById('nombreUsuario');
            if (nombreUsuario) {
                nombreUsuario.textContent = `Bienvenido, ${usuario.nombre || usuario.usuario}`;
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        }
    }
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const modalConfig = document.getElementById('modalConfiguracion');
    const modalConfirm = document.getElementById('modalConfirmacion');
    
    if (event.target === modalConfig) {
        cerrarModalConfiguracion();
    }
    if (event.target === modalConfirm) {
        cerrarModalConfirmacion();
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu.js cargado correctamente');
    
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Cargar nombre de usuario
    cargarNombreUsuario();
    
    // Agregar event listeners adicionales si es necesario
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Click en menu item:', this);
        });
    });
});

// Función de depuración para verificar que el script se carga
console.log('Script menu.js cargado exitosamente'); 