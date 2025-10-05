// Espera a que todo el contenido de la página se cargue
window.addEventListener('load', function() {
  // Selecciona el título del Hero
  const heroTitle = document.getElementById('hero-title');
  // Verifica si el elemento existe antes de intentar manipularlo
  if (heroTitle) {
    // Cambia la opacidad a 1 para que se muestre con la transición de CSS
    heroTitle.style.opacity = 1;
  }
});
