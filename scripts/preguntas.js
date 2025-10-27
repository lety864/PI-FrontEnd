// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener el formulario
    const form = document.querySelector('.contact-form form');
    
    // Obtener los campos del formulario
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const preguntaInput = document.getElementById('pregunta');
    
    // Función para crear mensajes de alerta
    function mostrarAlerta(mensaje, tipo) {
        // Eliminar alertas previas
        const alertaPrevia = document.querySelector('.alert-mensaje');
        if (alertaPrevia) {
            alertaPrevia.remove();
        }
        
        // Crear el elemento de alerta
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show alert-mensaje`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            <strong>${tipo === 'danger' ? '¡Error!' : '¡Éxito!'}</strong> ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insertar la alerta antes del formulario
        form.parentElement.insertBefore(alerta, form);
        
        // Si es mensaje de éxito, quitarlo después de 2 segundos
        if (tipo === 'success') {
            setTimeout(() => {
                alerta.classList.remove('show');
                setTimeout(() => alerta.remove(), 150);
            }, 2000);
        }
        
        // Hacer scroll suave hacia la alerta
        alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Función para validar email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Función para limpiar clases de validación
    function limpiarValidacion(input) {
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
    }
    
    // Función para marcar campo como inválido
    function marcarInvalido(input, mensaje) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        // Buscar o crear el mensaje de error
        let feedbackDiv = input.nextElementSibling;
        if (!feedbackDiv || !feedbackDiv.classList.contains('invalid-feedback')) {
            feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedbackDiv, input.nextSibling);
        }
        feedbackDiv.textContent = mensaje;
    }
    
    // Función para marcar campo como válido
    function marcarValido(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        // Remover mensaje de error si existe
        const feedbackDiv = input.nextElementSibling;
        if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
            feedbackDiv.remove();
        }
    }
    
    // Validación en tiempo real para el nombre
    nombreInput.addEventListener('input', function() {
        if (this.value.trim().length === 0) {
            limpiarValidacion(this);
        } else if (this.value.trim().length < 3) {
            marcarInvalido(this, 'El nombre debe tener al menos 3 caracteres');
        } else {
            marcarValido(this);
        }
    });
    
    // Validación en tiempo real para el email
    emailInput.addEventListener('input', function() {
        if (this.value.trim().length === 0) {
            limpiarValidacion(this);
        } else if (!validarEmail(this.value.trim())) {
            marcarInvalido(this, 'Por favor, ingresa un correo electrónico válido');
        } else {
            marcarValido(this);
        }
    });
    
    // Validación en tiempo real para la pregunta
    preguntaInput.addEventListener('input', function() {
        if (this.value.trim().length === 0) {
            limpiarValidacion(this);
        } else if (this.value.trim().length < 10) {
            marcarInvalido(this, 'La pregunta debe tener al menos 10 caracteres');
        } else {
            marcarValido(this);
        }
    });
    
    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let formularioValido = true;
        
        // Validar nombre
        if (nombreInput.value.trim().length === 0) {
            marcarInvalido(nombreInput, 'Por favor, ingresa tu nombre');
            formularioValido = false;
        } else if (nombreInput.value.trim().length < 3) {
            marcarInvalido(nombreInput, 'El nombre debe tener al menos 3 caracteres');
            formularioValido = false;
        } else {
            marcarValido(nombreInput);
        }
        
        // Validar email
        if (emailInput.value.trim().length === 0) {
            marcarInvalido(emailInput, 'Por favor, ingresa tu correo electrónico');
            formularioValido = false;
        } else if (!validarEmail(emailInput.value.trim())) {
            marcarInvalido(emailInput, 'Por favor, ingresa un correo electrónico válido');
            formularioValido = false;
        } else {
            marcarValido(emailInput);
        }
        
        // Validar pregunta
        if (preguntaInput.value.trim().length === 0) {
            marcarInvalido(preguntaInput, 'Por favor, escribe tu pregunta');
            formularioValido = false;
        } else if (preguntaInput.value.trim().length < 10) {
            marcarInvalido(preguntaInput, 'La pregunta debe tener al menos 10 caracteres');
            formularioValido = false;
        } else {
            marcarValido(preguntaInput);
        }
        
        // Si el formulario no es válido, mostrar alerta y detener
        if (!formularioValido) {
            mostrarAlerta('Por favor, corrige los errores en el formulario antes de enviarlo.', 'danger');
            return;
        }
        
        // Si todo es válido, simular envío exitoso
        // Aquí normalmente harías una petición AJAX al servidor
        
        // Deshabilitar el botón temporalmente
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Simular envío (remover este setTimeout cuando conectes con el backend)
        setTimeout(() => {
            // Mostrar mensaje de éxito
            mostrarAlerta('Tu pregunta se envió con éxito. Te responderemos pronto.', 'success');
            
            // Limpiar el formulario
            form.reset();
            
            // Limpiar todas las validaciones visuales
            limpiarValidacion(nombreInput);
            limpiarValidacion(emailInput);
            limpiarValidacion(preguntaInput);
            
            // Rehabilitar el botón
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Pregunta';
            
        }, 1000); // Simula 1 segundo de envío
    });
    
});