const URL_SUCURSAL1 = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3760.756349524055!2d-99.9529785!3d19.7131225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2f4fbf763f929%3A0xbf1ea2d41e712d2!2sC.%20Iturbide%20s%2Fn%2C%20Centro%2C%2050640%20San%20Felipe%20del%20Progreso%2C%20M%C3%A9x.!5e0!3m2!1ses!2smx!4v1728252731234!5m2!1ses!2smx";
const URL_SUCURSAL2 = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3758.5981534974104!2d-99.9468355!3d19.7302193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2f5ad1682209b%3A0x4b87db8c460fd9e0!2sBodega%20De%20Muebles%20Espa%C3%B1a!5e0!3m2!1ses!2smx!4v1728339212345!5m2!1ses!2smx";

const elementById = (id) =>{
    return document.getElementById(id);
}

const urlEl = elementById("Sucursales");
const telefonoEl = elementById("telefono");
const direccionEl = elementById("direccion");
const correoEl = elementById("correo");
const SucursalCentralEl = elementById("SucursalCentral");
const SucursalBodegaEl = elementById("SucursalBodega");

const datosSucursales = {
    direccion2:"Atlacomulco-San Felipe del Progreso, Manzana 003, 50640, Ejido San Juan Jalpa, Estado de México",
    direccion1:"Agustín Iturbide s/n, Centro, 50640, San Felipe del Progreso, Estado de México",
    correo:"madridmuebleria@gmail.com",
    telefono:"+52 712 115 4345"
}

/*================= Cargar Datos por default ================*/

urlEl.src = URL_SUCURSAL1;
telefonoEl.textContent = datosSucursales.telefono;
direccionEl.textContent = datosSucursales.direccion1;
correoEl.textContent = datosSucursales.correo;

/*====== Cargar Datos al dar CLICK =======*/

SucursalCentralEl.addEventListener("click", ()=>{
    urlEl.src =URL_SUCURSAL1;
    telefonoEl.textContent = datosSucursales.telefono;
    direccionEl.textContent = datosSucursales.direccion1;
    correoEl.textContent = datosSucursales.correo;
});

SucursalBodegaEl.addEventListener("click", ()=>{
    urlEl.src = URL_SUCURSAL2;
    telefonoEl.textContent = datosSucursales.telefono;
    direccionEl.textContent = datosSucursales.direccion2;
    correoEl.textContent = datosSucursales.correo;
});


/* ==================== Estableciendo horario ======================== */

document.addEventListener("DOMContentLoaded", ()=>{
    const estadoBtn = elementById("estadoBtn");
    const items = document.querySelectorAll("#horarios .dropdown-item");

  const horarios = {
    1: { abre: "09:30", cierra: "18:00" }, //lunes
    2: { abre: "09:30", cierra: "18:00" },
    3: { abre: "09:30", cierra: "18:00" },
    4: null, // Jueves cerrado
    5: { abre: "09:30", cierra: "18:00" },
    6: { abre: "09:30", cierra: "18:00" },
    0: { abre: "09:30", cierra: "18:00" }, //Domingo
  };

  const ahora = new Date();
  const dia = ahora.getDay();
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

  const horario = horarios[dia];
  let estado = "Cerrado";

  if (horario) {
    const [hAbre, mAbre] = horario.abre.split(":").map(Number);
    const [hCierra, mCierra] = horario.cierra.split(":").map(Number);
    const horaAbre = hAbre + mAbre / 60;
    const horaCierra = hCierra + mCierra / 60;

    if (horaActual >= horaAbre && horaActual < horaCierra) {
      const tiempoRestante = horaCierra - horaActual;
      if (tiempoRestante <= 0.5) {
        estado = "Cierra pronto";
      } else {
        estado = "Abierto";
      }
    }
  }

  estadoBtn.textContent = estado;

  items[dia === 0 ? 6 : dia - 1].classList.add("active");
});

/* ====================== Validaciones del formulario ======================== */

document.addEventListener("DOMContentLoaded", ()=>{
    const form = elementById("contactForm");
    const resultado = elementById("resultado");

    
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      resultado.innerHTML="";
      
      const nombre = form.name.value.trim();
      const telefono = +form.phone2.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();

      let valido = true;
      const numeroValido = /^[0-9]{10}$/; //regex

      // Validar nombre
      nombre === "" ? (form.name.classList.add("is-invalid"), valido = false) : form.name.classList.remove("is-invalid");
      // Validar telefono
      (!(numeroValido.test(telefono))) ? (form.phone.classList.add("is-invalid"), valido = false) : form.phone.classList.remove("is-invalid");
      // Validar correo
      email === "" ? (form.email.classList.add("is-invalid"), valido = false) : form.email.classList.remove("is-invalid");
      // Validar mensaje
      mensaje === "" ? (form.mensaje.classList.add("is-invalid"), valido = false) : form.mensaje.classList.remove("is-invalid");

      if (!valido) {
        const mensajeAlert = `
            <h5 class="text-danger text-center">Por favor completa todos los campos correctamente.</h5>
        `
        resultado.insertAdjacentHTML("afterbegin",mensajeAlert);
        return;
      }

      // Enviar a Formspree
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          resultado.innerHTML = '<h5 class="text-success text-center">¡Gracias! Tu mensaje ha sido enviado correctamente.</h5>';
          form.reset();
        } else {
          resultado.innerHTML = '<h5 class="text-danger text-center">Ocurrió un error al enviar el mensaje.</h5>';
        }
      } catch (error) {
        resultado.innerHTML = '<h5 class="text-danger text-center">Error de conexión. Intenta de nuevo.</h5>';
      }
    });
});







