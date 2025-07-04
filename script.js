// Función para mostrar el formulario seleccionado
function mostrarFormulario(tipo) {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    const botones = document.querySelectorAll('.toggle-btn');

    if (tipo === 'registro') {
        registroForm.classList.add('active');
        loginForm.classList.remove('active');
        botones[0].classList.add('active');
        botones[1].classList.remove('active');
    } else {
        loginForm.classList.add('active');
        registroForm.classList.remove('active');
        botones[1].classList.add('active');
        botones[0].classList.remove('active');
    }
}

// Verifica si localStorage está disponible
function storageDisponible() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Función para validar el formulario y registrar usuario
async function registrarUsuario(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;

    // Validar que todos los campos estén completos
    if (!nombre || !telefono || !email || !usuario || !password) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensaje('Por favor, ingrese un email válido', 'error');
        return false;
    }

    // Validar formato de teléfono (números y guiones)
    const telefonoRegex = /^[0-9-]+$/;
    if (!telefonoRegex.test(telefono)) {
        mostrarMensaje('Por favor, ingrese un teléfono válido (solo números y guiones)', 'error');
        return false;
    }

    try {
        // Usar API para registrar usuario
        await apiAdapter.register({
            nombre,
            telefono,
            email,
            usuario,
            password
        });

        // Mostrar mensaje de éxito
        mostrarMensaje('¡Usuario registrado exitosamente! Inicia sesión ahora.', 'exito');
        
        // Cambiar a formulario de login
        setTimeout(() => {
            mostrarFormulario('login');
        }, 1500);

    } catch (error) {
        console.error('Error en registro:', error);
        mostrarMensaje(error.message || 'Error al registrar usuario', 'error');
    }

    return false;
}

// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();

    // Obtener valores del formulario
    const usuario = document.getElementById('loginUsuario').value;
    const password = document.getElementById('loginClave').value;

    // Validar que los campos estén completos
    if (!usuario || !password) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return false;
    }

    try {
        // Usar API para iniciar sesión
        await apiAdapter.login(usuario, password);

        mostrarMensaje('¡Inicio de sesión exitoso!', 'exito');
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 1500);

    } catch (error) {
        console.error('Error en login:', error);
        mostrarMensaje(error.message || 'Usuario o contraseña incorrectos', 'error');
    }

    return false;
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    // Eliminar mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje-exito, .mensaje-error');
    mensajesAnteriores.forEach(msg => msg.remove());

    // Crear nuevo mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje-${tipo}`;
    mensajeDiv.style.display = 'block';

    // Insertar mensaje después del formulario activo
    const formularioActivo = document.querySelector('.form.active');
    formularioActivo.parentNode.insertBefore(mensajeDiv, formularioActivo.nextSibling);

    // Eliminar mensaje después de 3 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Función para validar la fortaleza de la contraseña
function validarContrasena() {
    const password = document.getElementById('clave').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    // Criterios de validación
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    // Calcular puntuación
    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (isLongEnough) score++;
    
    // Determinar fortaleza
    let strength = '';
    let text = '';
    
    if (password.length === 0) {
        strength = '';
        text = 'Ingresa una contraseña';
    } else if (score <= 2) {
        strength = 'weak';
        text = 'Débil';
    } else if (score <= 3) {
        strength = 'fair';
        text = 'Regular';
    } else if (score <= 4) {
        strength = 'good';
        text = 'Buena';
    } else {
        strength = 'strong';
        text = 'Fuerte';
    }
    
    // Actualizar UI
    strengthFill.className = `strength-fill ${strength}`;
    strengthText.className = `strength-text ${strength}`;
    strengthText.textContent = text;
}

// Inicializar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya hay un usuario logueado
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Redirigir al menú si ya está logueado
        window.location.href = 'menu.html';
    }
    
    // Mostrar formulario de registro por defecto
    mostrarFormulario('registro');
});

// Manejo global de errores de red
window.addEventListener('unhandledrejection', function(event) {
    console.error('Error no manejado:', event.reason);
    if (event.reason.message && event.reason.message.includes('fetch')) {
        mostrarMensaje('Error de conexión. Verifica tu internet.', 'error');
    }
}); 
