// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Configuracion.js cargado correctamente');
    inicializarPagina();
});

// Variables globales
const apiAdapter = new APIAdapter();
let configuracionActual = {};

// Función para inicializar la página
async function inicializarPagina() {
    try {
        await cargarConfiguracion();
        await cargarPerfilUsuario();
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

// Función para cargar configuración
async function cargarConfiguracion() {
    try {
        const configuracion = await apiAdapter.getConfiguracion();
        configuracionActual = configuracion;
        
        // Llenar formulario con datos actuales
        if (configuracion) {
            document.getElementById('nombreEmpresa').value = configuracion.nombre_empresa || '';
            document.getElementById('rucEmpresa').value = configuracion.ruc_empresa || '';
            document.getElementById('direccionEmpresa').value = configuracion.direccion_empresa || '';
            document.getElementById('telefonoEmpresa').value = configuracion.telefono_empresa || '';
            document.getElementById('emailEmpresa').value = configuracion.email_empresa || '';
            document.getElementById('sitioWeb').value = configuracion.sitio_web || '';
            document.getElementById('monedaBase').value = configuracion.moneda_base || 'USD';
            document.getElementById('idioma').value = configuracion.idioma || 'es';
            document.getElementById('zona_horaria').value = configuracion.zona_horaria || 'America/Panama';
            document.getElementById('porcentajeImpuesto').value = configuracion.porcentaje_impuesto || '7';
            document.getElementById('formatoFecha').value = configuracion.formato_fecha || 'DD/MM/YYYY';
            document.getElementById('notificacionesEmail').checked = configuracion.notificaciones_email || false;
            document.getElementById('backupAutomatico').checked = configuracion.backup_automatico || false;
        }
        
    } catch (error) {
        console.error('Error al cargar configuración:', error);
        mostrarMensaje('Error al cargar la configuración', 'error');
    }
}

// Función para cargar perfil del usuario
async function cargarPerfilUsuario() {
    try {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
        
        if (usuarioActual.id) {
            document.getElementById('nombreUsuario').value = usuarioActual.nombre || '';
            document.getElementById('emailUsuario').value = usuarioActual.email || '';
            document.getElementById('telefonoUsuario').value = usuarioActual.telefono || '';
            document.getElementById('cargoUsuario').value = usuarioActual.cargo || '';
        }
        
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        mostrarMensaje('Error al cargar el perfil del usuario', 'error');
    }
}

// Función para configurar eventos
function configurarEventos() {
    // Botón de guardar configuración
    const btnGuardarConfig = document.getElementById('btnGuardarConfiguracion');
    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', guardarConfiguracion);
    }
    
    // Botón de guardar perfil
    const btnGuardarPerfil = document.getElementById('btnGuardarPerfil');
    if (btnGuardarPerfil) {
        btnGuardarPerfil.addEventListener('click', guardarPerfil);
    }
    
    // Botón de cambiar contraseña
    const btnCambiarPassword = document.getElementById('btnCambiarPassword');
    if (btnCambiarPassword) {
        btnCambiarPassword.addEventListener('click', cambiarPassword);
    }
    
    // Botón de backup
    const btnBackup = document.getElementById('btnBackup');
    if (btnBackup) {
        btnBackup.addEventListener('click', realizarBackup);
    }
    
    // Botón de restaurar
    const btnRestaurar = document.getElementById('btnRestaurar');
    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', restaurarBackup);
    }
}

// Función para guardar configuración
async function guardarConfiguracion() {
    try {
        const configuracionData = {
            nombre_empresa: document.getElementById('nombreEmpresa').value,
            ruc_empresa: document.getElementById('rucEmpresa').value,
            direccion_empresa: document.getElementById('direccionEmpresa').value,
            telefono_empresa: document.getElementById('telefonoEmpresa').value,
            email_empresa: document.getElementById('emailEmpresa').value,
            sitio_web: document.getElementById('sitioWeb').value,
            moneda_base: document.getElementById('monedaBase').value,
            idioma: document.getElementById('idioma').value,
            zona_horaria: document.getElementById('zona_horaria').value,
            porcentaje_impuesto: parseFloat(document.getElementById('porcentajeImpuesto').value),
            formato_fecha: document.getElementById('formatoFecha').value,
            notificaciones_email: document.getElementById('notificacionesEmail').checked,
            backup_automatico: document.getElementById('backupAutomatico').checked
        };
        
        await apiAdapter.updateConfiguracion(configuracionData);
        mostrarMensaje('Configuración guardada exitosamente', 'exito');
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarMensaje('Error al guardar la configuración: ' + error.message, 'error');
    }
}

// Función para guardar perfil
async function guardarPerfil() {
    try {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
        
        const perfilData = {
            nombre: document.getElementById('nombreUsuario').value,
            email: document.getElementById('emailUsuario').value,
            telefono: document.getElementById('telefonoUsuario').value,
            cargo: document.getElementById('cargoUsuario').value
        };
        
        // Actualizar usuario en la base de datos
        await apiAdapter.updateUsuario(usuarioActual.id, perfilData);
        
        // Actualizar localStorage
        const usuarioActualizado = { ...usuarioActual, ...perfilData };
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
        
        mostrarMensaje('Perfil actualizado exitosamente', 'exito');
        
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        mostrarMensaje('Error al guardar el perfil: ' + error.message, 'error');
    }
}

// Función para cambiar contraseña
async function cambiarPassword() {
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        mostrarMensaje('Por favor complete todos los campos de contraseña', 'error');
        return;
    }
    
    if (passwordNueva !== passwordConfirmar) {
        mostrarMensaje('Las contraseñas nuevas no coinciden', 'error');
        return;
    }
    
    if (passwordNueva.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
        
        await apiAdapter.cambiarPassword(usuarioActual.id, passwordActual, passwordNueva);
        
        // Limpiar campos
        document.getElementById('passwordActual').value = '';
        document.getElementById('passwordNueva').value = '';
        document.getElementById('passwordConfirmar').value = '';
        
        mostrarMensaje('Contraseña cambiada exitosamente', 'exito');
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        mostrarMensaje('Error al cambiar la contraseña: ' + error.message, 'error');
    }
}

// Función para realizar backup
async function realizarBackup() {
    try {
        mostrarMensaje('Generando backup...', 'info');
        
        const backup = await apiAdapter.generarBackup();
        
        // Crear archivo de descarga
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarMensaje('Backup generado y descargado exitosamente', 'exito');
        
    } catch (error) {
        console.error('Error al generar backup:', error);
        mostrarMensaje('Error al generar el backup: ' + error.message, 'error');
    }
}

// Función para restaurar backup
function restaurarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const texto = await file.text();
            const backup = JSON.parse(texto);
            
            if (confirm('¿Está seguro de que desea restaurar este backup? Esta acción reemplazará todos los datos actuales.')) {
                await apiAdapter.restaurarBackup(backup);
                mostrarMensaje('Backup restaurado exitosamente', 'exito');
                
                // Recargar página después de 2 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error al restaurar backup:', error);
            mostrarMensaje('Error al restaurar el backup: ' + error.message, 'error');
        }
    });
    
    input.click();
}

// Función para exportar datos
async function exportarDatos() {
    try {
        mostrarMensaje('Exportando datos...', 'info');
        
        const datos = await apiAdapter.exportarDatos();
        
        // Crear archivo CSV
        let csv = 'Tipo,Datos\n';
        Object.keys(datos).forEach(tipo => {
            csv += `${tipo},"${JSON.stringify(datos[tipo])}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarMensaje('Datos exportados exitosamente', 'exito');
        
    } catch (error) {
        console.error('Error al exportar datos:', error);
        mostrarMensaje('Error al exportar los datos: ' + error.message, 'error');
    }
}

// Función para limpiar caché
function limpiarCache() {
    if (confirm('¿Está seguro de que desea limpiar el caché? Esto eliminará todos los datos temporales.')) {
        localStorage.removeItem('cache_clientes');
        localStorage.removeItem('cache_cotizaciones');
        localStorage.removeItem('cache_contratos');
        localStorage.removeItem('cache_facturas');
        
        mostrarMensaje('Caché limpiado exitosamente', 'exito');
    }
}

// Función para restablecer configuración
function restablecerConfiguracion() {
    if (confirm('¿Está seguro de que desea restablecer la configuración a los valores por defecto?')) {
        document.getElementById('nombreEmpresa').value = '';
        document.getElementById('rucEmpresa').value = '';
        document.getElementById('direccionEmpresa').value = '';
        document.getElementById('telefonoEmpresa').value = '';
        document.getElementById('emailEmpresa').value = '';
        document.getElementById('sitioWeb').value = '';
        document.getElementById('monedaBase').value = 'USD';
        document.getElementById('idioma').value = 'es';
        document.getElementById('zona_horaria').value = 'America/Panama';
        document.getElementById('porcentajeImpuesto').value = '7';
        document.getElementById('formatoFecha').value = 'DD/MM/YYYY';
        document.getElementById('notificacionesEmail').checked = false;
        document.getElementById('backupAutomatico').checked = false;
        
        mostrarMensaje('Configuración restablecida a valores por defecto', 'exito');
    }
}

// Función para volver al menú
function volverAlMenu() {
    window.location.href = 'menu.html';
}

// Función para mostrar información del sistema
function mostrarInfoSistema() {
    const info = `
        <div class="info-sistema">
            <h3>Información del Sistema</h3>
            <p><strong>Versión:</strong> 1.0.0</p>
            <p><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Navegador:</strong> ${navigator.userAgent}</p>
            <p><strong>Idioma:</strong> ${navigator.language}</p>
            <p><strong>Zona horaria:</strong> ${Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-info';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Información del Sistema</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-cerrar">&times;</button>
            </div>
            <div class="modal-body">
                ${info}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
    .modal-info {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
        display: flex; justify-content: center; align-items: center; z-index: 1000;
    }
    .modal-info .modal-content {
        background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;
    }
    .modal-info .modal-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .modal-info .btn-cerrar {
        background: none; border: none; font-size: 24px; cursor: pointer; color: #666;
    }
    .info-sistema p { margin: 10px 0; }
    .info-sistema h3 { color: #2c3e50; margin-bottom: 15px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea {
        width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;
    }
    .form-group input[type="checkbox"] { width: auto; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn:hover { opacity: 0.9; }
`;
document.head.appendChild(style);

console.log('Configuracion.js completo cargado correctamente');
