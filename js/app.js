const buscador = document.querySelector("#buscador");
const estadoConexion = document.querySelector("#estado-conexion");
const botonFavoritos = document.querySelector("#btn-favoritos");
const botonInstalar = document.querySelector("#btn-instalar");
let eventoInstalacion;

function actualizarConexion() {
  const enLinea = navigator.onLine;
  estadoConexion.textContent = enLinea ? "● En línea" : "● Sin conexión";
  estadoConexion.className = `estado ${enLinea ? "estado--online" : "estado--offline"}`;
}

buscador.addEventListener("input", (event) => {
  estado.texto = event.target.value;
  renderizarLugares();
});

botonFavoritos.addEventListener("click", () => {
  estado.soloFavoritos = !estado.soloFavoritos;
  botonFavoritos.textContent = estado.soloFavoritos
    ? "Ver todos los lugares"
    : "Ver favoritos";
  botonFavoritos.setAttribute("aria-pressed", estado.soloFavoritos);
  renderizarLugares();
});

window.addEventListener("online", actualizarConexion);
window.addEventListener("offline", actualizarConexion);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  eventoInstalacion = event;
  botonInstalar.hidden = false;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js"),
  );
}

actualizarConexion();
renderizarLugares();
