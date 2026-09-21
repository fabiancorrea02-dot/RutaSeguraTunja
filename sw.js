const CACHE_ESTATICO = "ruta-segura-tunja-static-v1";
const CACHE_DINAMICO = "ruta-segura-tunja-dynamic-v1";
const LIMITE_CACHE_DINAMICO = 20;

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./css/styles.css",
  "./js/datos.js",
  "./js/ui.js",
  "./js/app.js",
  "./img/icon.svg",
];

async function instalarServiceWorker() {
  const cache = await caches.open(CACHE_ESTATICO);
  await cache.addAll(APP_SHELL);
  await self.skipWaiting();
}

async function activarServiceWorker() {
  const nombresCache = await caches.keys();
  const cachesActuales = [CACHE_ESTATICO, CACHE_DINAMICO];
  await Promise.all(
    nombresCache
      .filter((nombre) => !cachesActuales.includes(nombre))
      .map((nombre) => caches.delete(nombre)),
  );
  await self.clients.claim();
}

async function estrategiaCacheConNetworkFallback(request) {
  const cacheDinamico = await caches.open(CACHE_DINAMICO);
  const respuestaCache = await cacheDinamico.match(request);
  if (respuestaCache) {
    return respuestaCache;
  }
  try {
    const respuestaRed = await fetch(request);
    const esValida =
      respuestaRed && (respuestaRed.ok || respuestaRed.type === "opaque");
    if (!esValida) {
      throw new Error("La red devolvió una respuesta no válida.");
    }
    try {
      await cacheDinamico.put(request, respuestaRed.clone());
      await limitarCache(CACHE_DINAMICO, LIMITE_CACHE_DINAMICO);
    } catch (errorCache) {
      console.warn(
        "El recurso se obtuvo de la red, pero no pudo guardarse en caché.",
        errorCache,
      );
    }
    return respuestaRed;
  } catch (errorRed) {
    return manejarRecursoNoDisponible(request);
  }
}

async function manejarRecursoNoDisponible(request) {
  if (request.mode === "navigate") {
    const paginaOffline = await caches.match("./offline.html");
    if (paginaOffline) {
      return paginaOffline;
    }
  }
  if (request.destination === "image") {
    const imagenAlternativa = await caches.match("./img/icon.svg");
    if (imagenAlternativa) {
      return imagenAlternativa;
    }
  }
  return new Response("Recurso no disponible sin conexión.", {
    status: 503,
    statusText: "Servicio no disponible",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

async function limitarCache(nombreCache, maximoItems) {
  const cache = await caches.open(nombreCache);
  const solicitudes = await cache.keys();
  if (solicitudes.length <= maximoItems) {
    return;
  }
  await cache.delete(solicitudes[0]);
  await limitarCache(nombreCache, maximoItems);
}

self.addEventListener("install", (event) => {
  event.waitUntil(instalarServiceWorker());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activarServiceWorker());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(estrategiaCacheConNetworkFallback(event.request));
});
