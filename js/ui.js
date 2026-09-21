const estado = {
  categoria: 'Todos',
  texto: '',
  soloFavoritos: false
};

const lista = document.querySelector('#lista-lugares');
const filtros = document.querySelector('#filtros');
const contador = document.querySelector('#contador-lugares');
const sinResultados = document.querySelector('#sin-resultados');
const modal = document.querySelector('#modal-detalle');
const contenidoModal = document.querySelector('#contenido-modal');
const favoritosGuardados = () => JSON.parse(localStorage.getItem('ruta-segura-favoritos') || '[]');

function esFavorito(id) {
  return favoritosGuardados().includes(id);
}

function cambiarFavorito(id) {
  const favoritos = favoritosGuardados();
  const indice = favoritos.indexOf(id);
  if (indice >= 0) favoritos.splice(indice, 1);
  else favoritos.push(id);
  localStorage.setItem('ruta-segura-favoritos', JSON.stringify(favoritos));
  renderizarLugares();
}

function obtenerLugaresFiltrados() {
  const consulta = estado.texto.trim().toLowerCase();
  return LUGARES.filter((lugar) => {
    const coincideCategoria = estado.categoria === 'Todos' || lugar.categoria === estado.categoria;
    const coincideTexto = !consulta || [lugar.nombre, lugar.categoria, lugar.direccion, lugar.descripcion]
      .join(' ').toLowerCase().includes(consulta);
    const coincideFavorito = !estado.soloFavoritos || esFavorito(lugar.id);
    return coincideCategoria && coincideTexto && coincideFavorito;
  });
}

function renderizarFiltros() {
  const categorias = ['Todos', ...new Set(LUGARES.map((lugar) => lugar.categoria))];
  filtros.innerHTML = categorias.map((categoria) => `
    <button class="filtro ${categoria === estado.categoria ? 'activo' : ''}" data-categoria="${categoria}">
      ${categoria}
    </button>`).join('');
}

function tarjeta(lugar) {
  const favorito = esFavorito(lugar.id);
  return `
    <article class="tarjeta">
      <img src="${lugar.imagen}" alt="Referencia visual de ${lugar.nombre}" loading="lazy">
      <div class="tarjeta-cuerpo">
        <p class="categoria">${lugar.categoria}</p>
        <h2>${lugar.nombre}</h2>
        <p class="direccion">⌖ ${lugar.direccion}</p>
        <p>${lugar.descripcion}</p>
        <div class="acciones-tarjeta">
          <button class="boton enlace-detalle" data-detalle="${lugar.id}">Ver detalle</button>
          <button class="favorito" data-favorito="${lugar.id}" aria-label="${favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}" aria-pressed="${favorito}">${favorito ? '★' : '☆'}</button>
        </div>
      </div>
    </article>`;
}

function renderizarLugares() {
  const resultados = obtenerLugaresFiltrados();
  lista.innerHTML = resultados.map(tarjeta).join('');
  contador.textContent = `${resultados.length} ${resultados.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}`;
  sinResultados.hidden = resultados.length !== 0;
  renderizarFiltros();
}

function abrirDetalle(id) {
  const lugar = LUGARES.find((item) => item.id === id);
  const favorito = esFavorito(id);
  contenidoModal.innerHTML = `
    <img class="imagen-modal" src="${lugar.imagen}" alt="Referencia visual de ${lugar.nombre}">
    <div class="modal-cuerpo">
      <p class="categoria">${lugar.categoria}</p>
      <h2>${lugar.nombre}</h2>
      <p>${lugar.descripcion}</p>
      <p><strong>Ubicación:</strong> ${lugar.direccion}</p>
      <p><strong>Horario:</strong> ${lugar.horario}</p>
      <button class="boton boton-secundario" data-favorito="${lugar.id}" aria-pressed="${favorito}">${favorito ? '★ Quitar de favoritos' : '☆ Añadir a favoritos'}</button>
    </div>`;
  modal.showModal();
}

document.addEventListener('click', (event) => {
  const botonFiltro = event.target.closest('[data-categoria]');
  const botonFavorito = event.target.closest('[data-favorito]');
  const botonDetalle = event.target.closest('[data-detalle]');
  if (botonFiltro) {
    estado.categoria = botonFiltro.dataset.categoria;
    renderizarLugares();
  }
  if (botonFavorito) {
    cambiarFavorito(Number(botonFavorito.dataset.favorito));
    if (modal.open) abrirDetalle(Number(botonFavorito.dataset.favorito));
  }
  if (botonDetalle) abrirDetalle(Number(botonDetalle.dataset.detalle));
});
