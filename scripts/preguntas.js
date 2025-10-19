document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los botones del accordion
  const accordionButtons = document.querySelectorAll(".accordion-button");

  accordionButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Para debug: muestra en consola cuál se abrió/cerró
      const pregunta = button.textContent.trim();
      const expanded = button.getAttribute("aria-expanded") === "true";
      console.log(`Pregunta "${pregunta}" ${expanded ? "cerrada" : "abierta"}`);
      
    });
  });

  // Formulario de preguntas 
  const form = document.querySelector("form[action='/enviar-pregunta']");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Evita envío real para demo
      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const pregunta = document.getElementById("pregunta").value;

      console.log("Nueva pregunta enviada:");
      console.log({ nombre, email, pregunta });

      // Opcional: limpiar formulario
      form.reset();
      alert("¡Gracias! Tu pregunta ha sido registrada.");
    });
  } else {
    console.error("No se encontró el formulario de preguntas.");
  }
});
