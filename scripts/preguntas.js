document.addEventListener('DOMContentLoaded', function() {
    // Selecciona todos los botones de preguntas
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(button => {
        button.addEventListener('click', function() {
            // Encuentra el contenedor de la respuesta asociado
            const answer = this.nextElementSibling;
            
            // Alternar la clase 'active' en el botón
            this.classList.toggle('active');

            // Lógica para desplegar o colapsar la respuesta
            if (answer.style.maxHeight) {
                // Si ya está abierto, ciérralo (establece max-height a 0)
                answer.style.maxHeight = null;
            } else {
                // Si está cerrado, ábrelo (establece max-height a la altura de su contenido)
                answer.style.maxHeight = answer.scrollHeight + "px";
            }

            //  Cerrar otros elementos cuando uno se abre
            faqQuestions.forEach(otherButton => {
                if (otherButton !== this && otherButton.classList.contains('active')) {
                    otherButton.classList.remove('active');
                    otherButton.nextElementSibling.style.maxHeight = null;
                }
            });
        });
    });
});